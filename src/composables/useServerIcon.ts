import { ref, watch, onUnmounted } from 'vue'
import { fetchSingleServer } from '@/services/api'
import { API } from '@/constants';

/** In-memory icon cache shared across all ServerCard instances */
const iconCache = new Map<string, { iconUrl: string; bannerUrl: string; upvotePower: number; burstPower: number }>()

/**
 * Lazy-load server icon & banner via the single-server JSON API.
 *
 * The streaming protobuf API does NOT include `iconVersion`,
 * so we fetch `/api/servers/single/{endpoint}` only for servers
 * that are actually visible on screen (Intersection Observer).
 */
export function useServerIcon(endpoint: string, fallbackBanner: string, initialUpvotePower = 0, initialBurstPower = 0) {
    const iconUrl = ref('')
    const bannerUrl = ref(fallbackBanner)
    const upvotePower = ref(initialUpvotePower)
    const burstPower = ref(initialBurstPower)
    const loading = ref(false)

    /** Check cache first */
    const cached = iconCache.get(endpoint)
    if (cached) {
        iconUrl.value = cached.iconUrl
        if (cached.bannerUrl) bannerUrl.value = cached.bannerUrl
        upvotePower.value = cached.upvotePower
        burstPower.value = cached.burstPower
    }

    /** Intersection Observer ref — set this on the card root element */
    const cardRef = ref<HTMLElement | null>(null)
    let observer: IntersectionObserver | null = null
    let fetched = false

    async function fetchIcon() {
        if (fetched || loading.value) return
        fetched = true

        // Already cached
        if (iconCache.has(endpoint)) {
        const c = iconCache.get(endpoint)!
        iconUrl.value = c.iconUrl
        if (c.bannerUrl) bannerUrl.value = c.bannerUrl
        upvotePower.value = c.upvotePower
        burstPower.value = c.burstPower
        return
        }

        loading.value = true
        try {
        const server = await fetchSingleServer(endpoint)
        if (!server) return

        const data = server.Data
        const vars = data.vars || {}
        const iv = data.iconVersion || parseInt(vars['iconVersion'] || '0', 10) || 0
        const resolvedIcon = iv != 0 ? API.SERVER_ICON(endpoint, iv) : ''
        const resolvedBanner = vars['banner_detail']
            || vars['banner_connecting']
            || fallbackBanner
        const resolvedUpvotePower = data.upvotePower || 0
        const resolvedBurstPower = data.burstPower || 0

        iconUrl.value = resolvedIcon
        if (resolvedBanner) bannerUrl.value = resolvedBanner
        upvotePower.value = resolvedUpvotePower
        burstPower.value = resolvedBurstPower

        // Cache for reuse (e.g. when paginating back)
        iconCache.set(endpoint, {
            iconUrl: resolvedIcon,
            bannerUrl: resolvedBanner,
            upvotePower: resolvedUpvotePower,
            burstPower: resolvedBurstPower,
        })
        } catch {
        // silently fail — fallback SVG will show
        } finally {
        loading.value = false
        }
    }

    /** Start observing when cardRef is set */
    function startObserving() {
        if (!cardRef.value || observer) return

        observer = new IntersectionObserver(
        (entries) => {
            if (entries[0]?.isIntersecting) {
            fetchIcon()
            // Stop observing once triggered
            observer?.disconnect()
            observer = null
            }
        },
        { rootMargin: '200px' } // pre-fetch a bit before visible
        )

        observer.observe(cardRef.value)
    }

    // Watch for cardRef being set (template ref)
    watch(cardRef, (el) => {
        if (el) startObserving()
    })

    onUnmounted(() => {
        observer?.disconnect()
        observer = null
    })

    return {
        cardRef,
        iconUrl,
        bannerUrl,
        upvotePower,
        burstPower,
        iconLoading: loading,
    }
}
