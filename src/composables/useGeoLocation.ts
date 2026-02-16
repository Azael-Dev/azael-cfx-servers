import { ref } from 'vue'
import { API } from '@/constants';

const CACHE_KEY = 'cfx-geo-country'
const CACHE_DURATION = 60 * 60 * 1000 // 60 minutes

interface GeoCache {
    countryCode: string
    timestamp: number
}

/** Reactive country code detected from ipwho.is (cached in localStorage) */
const countryCode = ref<string>('')
const geoLoading = ref(false)
const geoReady = ref(false)

/** Read cached value from localStorage */
function getCached(): string | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY)
        if (!raw) return null
        const parsed: GeoCache = JSON.parse(raw)
        if (Date.now() - parsed.timestamp < CACHE_DURATION) {
            return parsed.countryCode
        }
        localStorage.removeItem(CACHE_KEY)
    } catch {
        // ignore
    }
    return null
}

/** Write value to localStorage */
function setCache(code: string): void {
    try {
        const entry: GeoCache = { countryCode: code, timestamp: Date.now() }
        localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
    } catch {
        // ignore
    }
}

/** Fetch country code from ipwho.is (cached in localStorage) */
async function detectCountryCode(): Promise<string> {
    // Return cached value if available
    const cached = getCached()
    if (cached !== null) {
        countryCode.value = cached
        geoReady.value = true
        return cached
    }

    geoLoading.value = true
    try {
        const res = await fetch(API.GEOLOCATION)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()
        if (!data.success) {
            console.warn('ipwho.is error:', data.message)
            geoReady.value = true
            return ''
        }
        const code = (data.country_code as string) || ''
        countryCode.value = code
        setCache(code)
        geoReady.value = true
        return code
    } catch (err) {
        console.warn('Failed to detect geo location:', err)
        geoReady.value = true
        return ''
    } finally {
        geoLoading.value = false
    }
}

export function useGeoLocation() {
    return {
        countryCode,
        geoLoading,
        geoReady,
        detectCountryCode,
    }
}
