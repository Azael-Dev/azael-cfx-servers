import type { LocaleOption, SortOption } from '@/types'

/** Available locale/country presets */
export const LOCALE_OPTIONS: LocaleOption[] = [
  { code: 'th_TH', label: 'ไทย', flag: '🇹🇭' },
  { code: 'en_US', label: 'English (US)', flag: '🇺🇸' },
  { code: 'en_GB', label: 'English (UK)', flag: '🇬🇧' },
  { code: 'de_DE', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr_FR', label: 'Français', flag: '🇫🇷' },
  { code: 'pt_BR', label: 'Português (BR)', flag: '🇧🇷' },
  { code: 'es_ES', label: 'Español', flag: '🇪🇸' },
  { code: 'pl_PL', label: 'Polski', flag: '🇵🇱' },
  { code: 'ro_RO', label: 'Română', flag: '🇷🇴' },
  { code: 'it_IT', label: 'Italiano', flag: '🇮🇹' },
  { code: 'nl_NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'tr_TR', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'ar_AE', label: 'العربية', flag: '🇦🇪' },
  { code: 'ru_RU', label: 'Русский', flag: '🇷🇺' },
  { code: 'zh_CN', label: '中文', flag: '🇨🇳' },
  { code: 'ja_JP', label: '日本語', flag: '🇯🇵' },
  { code: 'ko_KR', label: '한국어', flag: '🇰🇷' },
  { code: '', label: 'ทั้งหมด (All)', flag: '🌐' },
]

/** Sort option presets */
export const SORT_OPTIONS: SortOption[] = [
  { field: 'players', order: 'desc', label: 'ผู้เล่น (มาก → น้อย)' },
  { field: 'players', order: 'asc', label: 'ผู้เล่น (น้อย → มาก)' },
  { field: 'name', order: 'asc', label: 'ชื่อ (A → Z)' },
  { field: 'name', order: 'desc', label: 'ชื่อ (Z → A)' },
  { field: 'upvotes', order: 'desc', label: 'Upvotes (มาก → น้อย)' },
  { field: 'maxPlayers', order: 'desc', label: 'สล็อต (มาก → น้อย)' },
]

/** Default items per page */
export const DEFAULT_PER_PAGE = 30

/** API base URLs */
export const API = {
  /** All server data (streaming msgpack) */
  STREAM_REDIR: 'https://servers-frontend.fivem.net/api/servers/streamRedir',
  /** Top servers by locale */
  TOP_SERVERS: 'https://servers-frontend.fivem.net/api/servers/top',
  /** Single server details */
  SINGLE_SERVER: 'https://servers-frontend.fivem.net/api/servers/single',
  /** Player counts */
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
