import { ref, reactive, watch, onUnmounted } from 'vue'
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
 * Stagger delay per card index (ms) to spread out API requests and avoid rate limits.
 * Each card waits `cardIndex * CARD_FETCH_STAGGER` ms before triggering its fetch.
 * Cached cards skip the delay entirely.
 */
const CARD_FETCH_STAGGER = 150

/**
 * Lazy-load server icon & banner via the single-server JSON API.
 *
 * Rate-limit protections:
 *  - In-memory `iconCache` avoids redundant fetches when paginating back.
 *  - `cardIndex` stagger delay — cards fetch one-by-one with CARD_FETCH_STAGGER ms gap.
 *  - `pageKey` reset — when the page changes, uncached cards re-enter skeleton state
 *    and re-trigger their staggered fetch sequence.
 *  - Concurrency queue + 429 backoff are handled at the api.ts layer.
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
    /** Connect is enabled by default; disabled only when server is private */
    const connectEnabled = ref(true)

    /**
     * `cardReady` is false until the single-server fetch resolves (or cache hit).
     * While false the card renders as a full skeleton row.
     * Cached entries skip the skeleton entirely.
     */
    const cardReady = ref(false)

    /** Populate state from cache entry */
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

    /** Check cache first — cached cards are immediately ready (no skeleton) */
    const cached = iconCache.get(endpoint)
    if (cached) applyCache(cached)

    /** Intersection Observer ref — set this on the card root element */
    const cardRef = ref<HTMLElement | null>(null)
    let observer: IntersectionObserver | null = null
    let fetched = false
    let delayTimer: ReturnType<typeof setTimeout> | null = null

    async function doFetch() {
        if (fetched) return
        fetched = true

        // Re-check cache (may have been populated by another card while we waited)
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
        const delay = iconCache.has(endpoint) ? 0 : cardIndex * CARD_FETCH_STAGGER
        if (delay === 0) {
            doFetch()
        } else {
            delayTimer = setTimeout(doFetch, delay)
        }
    }

    /** Start observing when cardRef is set */
    function startObserving() {
        if (!cardRef.value || observer) return

        observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    scheduleStaggeredFetch()
                    observer?.disconnect()
                    observer = null
                }
            },
            { rootMargin: '50px' },
        )

        observer.observe(cardRef.value)
    }

    // Re-initialise when pageKey changes (page navigation)
    watch(() => pageKey, () => {
        // Reset fetch state so the new page's cards fetch fresh
        fetched = false
        if (!iconCache.has(endpoint)) {
            cardReady.value = false
            iconUrl.value = ''
            loadFailed.value = false
        }
        // Restart observer for the new card position
        observer?.disconnect()
        observer = null
        if (cardRef.value) startObserving()
    })

    // Watch for cardRef being set (template ref)
    watch(cardRef, (el) => {
        if (el) startObserving()
    })

    onUnmounted(() => {
        observer?.disconnect()
        observer = null
        if (delayTimer) { clearTimeout(delayTimer); delayTimer = null }
    })

    return {
        cardRef,
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
