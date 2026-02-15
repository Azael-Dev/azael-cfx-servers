import type { LocaleOption, SortOption } from '@/types'

/** Available locale/country presets (labels are native language names, not translated) */
export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: '', label: '' }, // label filled dynamically via i18n (All)
  { code: 'th-TH', label: 'ไทย' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'pt-BR', label: 'Português (BR)' },
  { code: 'es-ES', label: 'Español' },
  { code: 'pl-PL', label: 'Polski' },
  { code: 'ro-RO', label: 'Română' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'nl-NL', label: 'Nederlands' },
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'ar-AE', label: 'العربية' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'zh-CN', label: '中文' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
]

/** Sort option presets (labelKey references TranslationSchema keys) */
export const SORT_OPTIONS: SortOption[] = [
  { field: 'players', order: 'desc', labelKey: 'sortPlayersDesc' },
  { field: 'players', order: 'asc', labelKey: 'sortPlayersAsc' },
  { field: 'name', order: 'asc', labelKey: 'sortNameAsc' },
  { field: 'name', order: 'desc', labelKey: 'sortNameDesc' },
  { field: 'upvotes', order: 'desc', labelKey: 'sortUpvotesDesc' },
  { field: 'maxPlayers', order: 'desc', labelKey: 'sortSlotsDesc' },
]

/** Default items per page */
export const DEFAULT_PER_PAGE = 30

/** API base URLs */
export const API = {
  /** All server data — CORS-enabled stream (primary for browser) */
  STREAM_CFX: 'https://frontend.cfx-services.net/api/servers/stream/',
  /** All server data via redirect (302 lacks CORS — only usable server-side) */
  STREAM_REDIR: 'https://servers-frontend.fivem.net/api/servers/streamRedir/',
  /** All server data direct (no CORS — fallback via Vite proxy) */
  STREAM_DIRECT: 'https://servers-frontend.fivem.net/api/servers/stream/',
  /** Single server details */
  SINGLE_SERVER: 'https://servers-frontend.fivem.net/api/servers/single',
  /** Player counts — response: [players, unknown, maxSlots] */
  COUNTS_FIVEM: 'https://static.cfx.re/runtime/counts.json',
  COUNTS_REDM: 'https://static.cfx.re/runtime/counts_rdr3.json',
  /** Server icon */
  SERVER_ICON: (endpoint: string, iconVersion: number) =>
    `https://servers-frontend.fivem.net/api/servers/icon/${endpoint}/${iconVersion}.png`,
  /** Cfx.re tweets feed */
  TWEETS: 'https://runtime.fivem.net/tweets.json',
} as const

/** Cache duration in milliseconds (5 minutes) */
export const CACHE_DURATION = 5 * 60 * 1000

/** Refresh interval for server list (60 seconds) */
export const REFRESH_INTERVAL = 60 * 1000

/** Social media links */
export const SOCIAL_LINKS = {
  GITHUB: 'https://portal.azael.dev/links/github',
  DISCORD: 'https://portal.azael.dev/links/discord',
} as const
