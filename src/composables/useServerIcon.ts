import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { fetchSingleServer } from '@/services/api'
import { API } from '@/constants'

/** In-memory icon cache shared across all ServerCard instances */
const iconCache = new Map<string, { iconUrl: string; bannerUrl: string; upvotePower: number; burstPower: number; loadFailed: boolean; isPrivate: boolean }>()

/**
 * Reactive set of server endpoints discovered as private via fetchSingleServer.
 * Used by useServers to filter out private servers when hidePrivate is enabled.
 */
export const privateServerIds = reactive(new Set<string>())

/**
 * Stagger delay per card index (ms) to spread queue insertions and avoid
 * saturating the concurrency queue all at once on page load.
 * Card 0 = 0 ms, card 1 = 100 ms, ..., card 11 = 1100 ms.
 * Cached cards always skip the delay.
 */
const CARD_FETCH_STAGGER = 100

/**
 * Lazy-load server icon & banner via the single-server JSON API.
 *
 * Loading strategy:
 *  - All cards on the current page are queued immediately on mount (no viewport gating).
 *  - Requests are staggered by `cardIndex × CARD_FETCH_STAGGER` ms to smooth
 *    queue insertion, then processed `SINGLE_SERVER_MAX_CONCURRENT` at a time.
 *  - In-memory `iconCache` skips the network for endpoints already fetched.
 *  - `pageKey` reset: when the page changes, uncached cards re-enter skeleton
 *    state and re-queue their fetch for the new page's cards.
 *  - Concurrency limit + 429 backoff are handled at the api.ts layer.
 */
export function useServerIcon(
  endpoint: string,
  fallbackBanner: string,
  initialUpvotePower = 0,
  initialBurstPower = 0,
  cardIndex = 0,
  pageKey = 0,
) {
    const iconUrl = ref('')
    const bannerUrl = ref(fallbackBanner)
    const upvotePower = ref(initialUpvotePower)
    const burstPower = ref(initialBurstPower)
    const loadFailed = ref(false)
    const isPrivate = ref(false)
    const connectEnabled = ref(true)

    /**
     * `cardReady` is false until the single-server fetch resolves (or cache hit).
     * While false the card renders as a full skeleton row.
     */
    const cardReady = ref(false)

    function applyCache(c: NonNullable<ReturnType<typeof iconCache.get>>) {
        iconUrl.value = c.iconUrl
        if (c.bannerUrl) bannerUrl.value = c.bannerUrl
        upvotePower.value = c.upvotePower
        burstPower.value = c.burstPower
        loadFailed.value = c.loadFailed
        isPrivate.value = c.isPrivate
        connectEnabled.value = !c.isPrivate
        cardReady.value = true
    }

    // Cached cards are immediately ready — no skeleton shown
    const cached = iconCache.get(endpoint)
    if (cached) applyCache(cached)

    let fetched = false
    let delayTimer: ReturnType<typeof setTimeout> | null = null

    async function doFetch() {
        if (fetched) return
        fetched = true

        // Re-check cache (may have been populated by another card while waiting)
        const hit = iconCache.get(endpoint)
        if (hit) { applyCache(hit); return }

        try {
            const server = await fetchSingleServer(endpoint)
            if (!server) {
                loadFailed.value = true
                connectEnabled.value = true
                iconCache.set(endpoint, { iconUrl: '', bannerUrl: fallbackBanner, upvotePower: initialUpvotePower, burstPower: initialBurstPower, loadFailed: true, isPrivate: false })
                return
            }

            const data = server.Data
            const vars = data.vars || {}
            const iv = data.iconVersion || parseInt(vars['iconVersion'] || '0', 10) || 0
            const resolvedIcon = iv !== 0 ? API.SERVER_ICON(endpoint, iv) : ''
            const resolvedBanner = vars['banner_detail'] || vars['banner_connecting'] || fallbackBanner
            const resolvedUpvotePower = data.upvotePower || 0
            const resolvedBurstPower = data.burstPower || 0
            const resolvedIsPrivate = data.private || false

            iconUrl.value = resolvedIcon
            if (resolvedBanner) bannerUrl.value = resolvedBanner
            upvotePower.value = resolvedUpvotePower
            burstPower.value = resolvedBurstPower
            isPrivate.value = resolvedIsPrivate
            loadFailed.value = false
            connectEnabled.value = !resolvedIsPrivate

            if (resolvedIsPrivate) privateServerIds.add(endpoint)
            else privateServerIds.delete(endpoint)

            iconCache.set(endpoint, {
                iconUrl: resolvedIcon,
                bannerUrl: resolvedBanner,
                upvotePower: resolvedUpvotePower,
                burstPower: resolvedBurstPower,
                loadFailed: false,
                isPrivate: resolvedIsPrivate,
            })
        } catch {
            loadFailed.value = true
            connectEnabled.value = true
            iconCache.set(endpoint, { iconUrl: '', bannerUrl: fallbackBanner, upvotePower: initialUpvotePower, burstPower: initialBurstPower, loadFailed: true, isPrivate: false })
        } finally {
            cardReady.value = true
        }
    }

    function scheduleStaggeredFetch() {
        if (delayTimer) { clearTimeout(delayTimer); delayTimer = null }
        // Cached entries skip the delay and resolve synchronously
        const delay = iconCache.has(endpoint) ? 0 : cardIndex * CARD_FETCH_STAGGER
        if (delay === 0) {
            doFetch()
        } else {
            delayTimer = setTimeout(doFetch, delay)
        }
    }

    // Queue fetch immediately on mount — all cards on the page start together
    onMounted(() => {
        if (!iconCache.has(endpoint)) {
            cardReady.value = false
        }
        scheduleStaggeredFetch()
    })

    // Re-queue when pageKey changes (page navigation — new set of cards)
    watch(() => pageKey, () => {
        fetched = false
        if (!iconCache.has(endpoint)) {
            cardReady.value = false
            iconUrl.value = ''
            loadFailed.value = false
        }
        scheduleStaggeredFetch()
    })

    onUnmounted(() => {
        if (delayTimer) { clearTimeout(delayTimer); delayTimer = null }
    })

    return {
        iconUrl,
        bannerUrl,
        upvotePower,
        burstPower,
        cardReady,
        loadFailed,
        isPrivate,
        connectEnabled,
    }
}
