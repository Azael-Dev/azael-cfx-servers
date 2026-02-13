import type { LocaleOption, SortOption } from '@/types'

/** Available locale/country presets (labels are native language names, not translated) */
export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: '', label: '', flag: '🌐' }, // label filled dynamically via i18n (All)
  { code: 'th-TH', label: 'ไทย', flag: '🇹🇭' },
  { code: 'en-US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'de-DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr-FR', label: 'Français', flag: '🇫🇷' },
  { code: 'pt-BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'es-ES', label: 'Español', flag: '🇪🇸' },
  { code: 'pl-PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'ro-RO', label: 'Română', flag: '🇷🇴' },
  { code: 'it-IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl-NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr-TR', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar-AE', label: 'العربية', flag: '🇦🇪' },
  { code: 'ru-RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' },
  { code: 'ja-JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko-KR', label: '한국어', flag: '🇰🇷' },
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
  /** Server banner */
  SERVER_BANNER: (serverId: string) =>
    `https://servers-frontend.fivem.net/api/servers/banner/${serverId}`,
} as const

/** Cache duration in milliseconds (5 minutes) */
export const CACHE_DURATION = 5 * 60 * 1000

/** Refresh interval for server list (60 seconds) */
export const REFRESH_INTERVAL = 60 * 1000
