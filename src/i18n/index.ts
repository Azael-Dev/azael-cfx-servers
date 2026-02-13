import { ref, computed } from 'vue'
import type { Locale, TranslationSchema } from './types'
import en from './locales/en'
import th from './locales/th'

/** All registered translations */
const messages: Record<Locale, TranslationSchema> = { en, th }

/** Supported locale codes */
const supportedLocales: Locale[] = Object.keys(messages) as Locale[]

/** Detect browser language and map to supported locale */
function detectLocale(): Locale {
  const langs = navigator.languages ?? [navigator.language]

  for (const lang of langs) {
    const code = lang.toLowerCase().split('-')[0] as Locale
    if (supportedLocales.includes(code)) {
      return code
    }
  }

  return 'en' // fallback
}

/** Load saved preference or detect from browser */
function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem('cfx-locale') as Locale | null
    if (saved && supportedLocales.includes(saved)) {
      return saved
    }
  } catch {
    // localStorage may be unavailable
  }
  return detectLocale()
}

/** Current active locale (reactive, shared across app) */
const currentLocale = ref<Locale>(getInitialLocale())

/** Set locale and persist */
function setLocale(locale: Locale) {
  if (supportedLocales.includes(locale)) {
    currentLocale.value = locale
    try {
      localStorage.setItem('cfx-locale', locale)
    } catch {
      // ignore
    }
    document.documentElement.lang = locale
  }
}

/** Computed current translation object */
const t = computed<TranslationSchema>(() => messages[currentLocale.value])

/**
 * Interpolate placeholders: `{key}` → value
 * Usage: `tt('copyright', { year: 2026 })` → "© 2026 CFX Servers..."
 */
function tt(key: keyof TranslationSchema, params?: Record<string, string | number>): string {
  let text = t.value[key]
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v))
    }
  }
  return text
}

/** Time locale string for toLocaleTimeString() */
const timeLocale = computed(() => (currentLocale.value === 'th' ? 'th-TH' : 'en-US'))

/** Available locales for the language switcher */
const availableLocales: { code: Locale; label: string; flag: string }[] = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'th', label: 'ไทย', flag: '🇹🇭' },
]

export function useI18n() {
  return {
    t,
    tt,
    currentLocale,
    setLocale,
    timeLocale,
    availableLocales,
    supportedLocales,
  }
}

/** Set initial lang attribute */
document.documentElement.lang = currentLocale.value
