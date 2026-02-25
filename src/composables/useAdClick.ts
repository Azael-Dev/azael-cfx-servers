import { ADSTERRA } from '@/constants'

// const AD_URL = 'https://www.effectivegatecpm.com/qhxdgj14u?key=5008b480f3ab6313e8cacac0bec3db3a'
const AD_URL = `${ADSTERRA.REFERRAL.SMARTLINK}?key=${ADSTERRA.KEYS.SMARTLINK}`
const COOLDOWN_MS = 5 * 60 * 1_000   // 5 minutes between ad opens
const STORAGE_KEY = '__cfx_adclick_ts'

export function fireAdClick(): void {
    try {
        const now = Date.now()
        const last = parseInt(localStorage.getItem(STORAGE_KEY) ?? '0', 10)

        if (now - last < COOLDOWN_MS) return   // still in cooldown – skip silently

        localStorage.setItem(STORAGE_KEY, String(now))
        window.open(AD_URL, '_blank', 'noopener,noreferrer')
    } catch {
        // localStorage may be unavailable in private-browsing on some browsers – ignore
    }
}
