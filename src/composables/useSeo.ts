import { watch } from 'vue'
import { useI18n } from '@/i18n'

interface SeoMeta {
    title?: string
    description?: string
    ogTitle?: string
    ogDescription?: string
}

/**
 * Composable to dynamically update SEO meta tags based on locale.
 * Updates document title, meta description, og tags, and html lang attribute.
 */
export function useSeo() {
    const { currentLocale } = useI18n()

    const seoData: Record<string, { title: string; description: string }> = {
        en: {
        title: 'CFX Servers - FiveM & RedM Server List',
        description:
            'Browse and find the best FiveM & RedM servers worldwide. Real-time server list with player counts, filters, and search.',
        },
        th: {
        title: 'CFX Servers - รายการเซิร์ฟเวอร์ FiveM & RedM',
        description:
            'ค้นหาเซิร์ฟเวอร์ FiveM และ RedM ที่ดีที่สุดจากทั่วโลก รายการเซิร์ฟเวอร์แบบเรียลไทม์พร้อมจำนวนผู้เล่น ตัวกรอง และการค้นหา',
        },
    }

    function setMeta(name: string, content: string) {
        let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
        if (!el) {
        el = document.createElement('meta')
        el.setAttribute('name', name)
        document.head.appendChild(el)
        }
        el.setAttribute('content', content)
    }

    function setOgMeta(property: string, content: string) {
        let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
        if (!el) {
        el = document.createElement('meta')
        el.setAttribute('property', property)
        document.head.appendChild(el)
        }
        el.setAttribute('content', content)
    }

    function updateSeo(overrides?: SeoMeta) {
        const locale = currentLocale.value
        const data = seoData[locale] ?? seoData['en']

        const title = overrides?.title ?? data!.title
        const description = overrides?.description ?? data!.description

        // Update document title
        document.title = title

        // Update meta tags
        setMeta('description', description)
        setMeta('title', title)

        // Update Open Graph tags
        setOgMeta('og:title', overrides?.ogTitle ?? title)
        setOgMeta('og:description', overrides?.ogDescription ?? description)
        setOgMeta('og:locale', locale === 'th' ? 'th_TH' : 'en_US')

        // Update Twitter tags
        setMeta('twitter:title', overrides?.ogTitle ?? title)
        setMeta('twitter:description', overrides?.ogDescription ?? description)

        // Update html lang
        document.documentElement.lang = locale
    }

    /**
     * Update dynamic structured data (e.g., server count stats)
     */
    function updateStructuredData(stats: { serverCount: number; playerCount: number }) {
        const id = 'seo-dynamic-jsonld'
        let script = document.getElementById(id) as HTMLScriptElement | null
        if (!script) {
        script = document.createElement('script')
        script.id = id
        script.type = 'application/ld+json'
        document.head.appendChild(script)
        }

        script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'FiveM & RedM Server List',
        description: `Live directory of ${stats.serverCount.toLocaleString()} FiveM and RedM servers with ${stats.playerCount.toLocaleString()} active players.`,
        url: 'https://servers.azael.dev/',
        license: 'https://servers.azael.dev/',
        creator: {
            '@type': 'Organization',
            name: 'Azael Dev',
        },
        })
    }

    // Auto-update SEO when locale changes
    watch(currentLocale, () => {
        updateSeo()
    })

    return {
        updateSeo,
        updateStructuredData,
    }
}
