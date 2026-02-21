import type { SortOption } from '@/types'

/** Ad slot enablement configuration */
export const AD_ENABLED = {
  HEADER: false,              // Enable header leaderboard
  CONTENT: false,             // Enable inline content ads
  SIDEBAR: false,             // Enable sidebar rectangles
  FOOTER: true,               // Enable footer banner
} as const

/** Google AdSense configuration */
export const ADSENSE = {
  /** Publisher client ID (must match the script in index.html) */
  CLIENT_ID: 'ca-pub-3218585194390171',
  /** Ad unit slot IDs — replace with your actual AdSense ad unit IDs */
  SLOTS: {
    LEADERBOARD: '1234567890',   // 728×90 responsive (header, inline)
    RECTANGLE: '0987654321',     // 300×250 fixed (sidebar)
    BANNER: '1122334455',        // Responsive banner (footer)
    SKYSCRAPER: '5566778899',    // 160×600 (unused currently)
  },
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
export const DEFAULT_PER_PAGE = 30

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
