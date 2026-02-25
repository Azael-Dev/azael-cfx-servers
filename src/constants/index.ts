import type { SortOption } from '@/types'

/** Ad slot enablement configuration */
export const AD_ENABLED = {
  HEADER: true,              // Enable header leaderboard
  CONTENT: true,             // Enable inline content ads
  SIDEBAR: true,             // Enable sidebar rectangles
  FOOTER: true,               // Enable footer banner
} as const

/** Adsterra ad configuration */
export const ADSTERRA = {
  /** Adsterra ad unit keys per size */
  KEYS: {
    LEADERBOARD: 'b8125a056372ff94d6b97e54f84d4f62',  // 728×90 (header & inline)
    RECTANGLE: '9a262d58d722a366f3ae4b3b4ae408d4',     // 300×250 (sidebar)
  },
  /** Referral banner (footer) */
  REFERRAL: {
    URL: 'https://beta.publishers.adsterra.com/referral/cYffQLq5Qy',
    BANNER: 'https://landings-cdn.adsterratech.com/referralBanners/gif/720x90_adsterra_reff.gif',
  },
  /** invoke.js base URL */
  INVOKE_BASE: 'https://www.highperformanceformat.com',
} as const

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
export const DEFAULT_PER_PAGE = 20

/** Default tweet limit for feed display */
export const DEFAULT_TWEET_LIMIT = 3

/** API base URLs */
export const API = {
  /** CORS proxy */
  CORS_PROXY: 'https://corsproxy.io',
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
  /** Geolocation API */
  GEOLOCATION: 'https://free.freeipapi.com/api/json',
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
