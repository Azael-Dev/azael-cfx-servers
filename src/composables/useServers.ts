import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import type { Server, FilterState, GameType, CfxServer, PlayerCounts } from '@/types'
import { fetchAllServers, fetchPlayerCounts, clearCache } from '@/services/api'
import { normalizeServer } from '@/utils/helpers'
import { DEFAULT_PER_PAGE, REFRESH_INTERVAL } from '@/constants'
import { useGeoLocation } from '@/composables/useGeoLocation'
import { getCountryFlagUrl } from '@/composables/useCountryFlag'
import { useI18n } from '@/i18n'

const servers = ref<Server[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const loadProgress = ref(0)
const lastUpdated = ref<Date | null>(null)
const playerCounts = ref<PlayerCounts>({ fivem: 0, redm: 0 })
let refreshTimer: ReturnType<typeof setInterval> | null = null
let geoLocaleApplied = false

/**
 * Set of server IDs currently expanded (detail panel open).
 * Exported at module level so ServerCard can add/remove without calling useServers().
 * Background refresh preserves old data for these servers to keep the UI stable.
 */
export const expandedServerIds = reactive(new Set<string>())

const filters = ref<FilterState>({
  search: '',
  locale: '',
  gameType: 'fivem' as GameType,
  hideEmpty: false,
  hideFull: false,
  sortBy: 'players',
  sortOrder: 'desc',
  currentPage: 1,
  perPage: DEFAULT_PER_PAGE,
})

/**
 * Common non-standard region codes used by FiveM servers
 * mapped to their ISO 3166-1 alpha-2 equivalents.
 */
const REGION_ALIASES: Record<string, string> = {
  UK: 'GB', // United Kingdom
}

/**
 * Extract a valid ISO 3166-1 alpha-2 region code from a locale string.
 * Handles common aliases (e.g. 'en-UK' → 'GB').
 * Returns uppercase 2-letter code or '' if invalid.
 */
function extractRegion(code: string): string {
  const parts = code.split(/[-_]/)
  let region = parts[1]?.toUpperCase()
  if (!region || !/^[A-Z]{2}$/.test(region)) return ''
  region = REGION_ALIASES[region] || region
  return region
}

/**
 * Get country display name for a region code using Intl.DisplayNames.
 * @param region - ISO 3166-1 alpha-2 code (e.g. 'US', 'TH')
 * @param uiLang - BCP 47 tag for the display language (e.g. 'en', 'th')
 * Returns '' if the region is invalid or not recognized.
 */
function getCountryDisplayName(region: string, uiLang: string): string {
  if (!region || !/^[A-Z]{2}$/.test(region)) return ''
  try {
    const regionDisplay = new Intl.DisplayNames([uiLang], { type: 'region' })
    const name = regionDisplay.of(region)
    // Intl.DisplayNames returns the input code itself when unrecognized
    if (!name || name === region) return ''
    return name
  } catch {
    return ''
  }
}

/** Locale option derived from server data */
export interface DynamicLocaleOption {
  code: string
  label: string
  count: number
  flagUrl: string
}

/**
 * Build dynamic locale options grouped by country from current servers filtered by game type.
 * Locales without a valid region code are excluded (counted under "All" only).
 * Sorted by server count descending. Only includes countries with count > 0.
 */
const localeMap = computed(() => {
  // Group by region (country code) — multiple locale codes with the same
  // region (e.g. en-US, es-US) are merged under one country entry.
  const regionMap = new Map<string, { codes: Set<string>; count: number }>()
  for (const s of servers.value) {
    if (s.gameType !== filters.value.gameType) continue
    const loc = s.locale
    if (!loc) continue
    const region = extractRegion(loc)
    if (!region) continue // invalid region → skip (falls into All)
    const entry = regionMap.get(region)
    if (entry) {
      entry.codes.add(loc)
      entry.count++
    } else {
      regionMap.set(region, { codes: new Set([loc]), count: 1 })
    }
  }
  return regionMap
})

const { currentLocale: i18nLocale } = useI18n()

const dynamicLocaleOptions = computed<DynamicLocaleOption[]>(() => {
  const uiLang = i18nLocale.value // reactive dependency on site language
  const options: DynamicLocaleOption[] = []

  for (const [region, { count }] of localeMap.value) {
    if (count === 0) continue
    const label = getCountryDisplayName(region, uiLang)
    if (!label) continue // unrecognized country → skip
    const flagUrl = getCountryFlagUrl(region)
    options.push({
      code: region, // use region code (e.g. 'US', 'TH') as the filter key
      label,
      count,
      flagUrl,
    })
  }

  // Sort by count descending
  options.sort((a, b) => b.count - a.count)
  return options
})

/** Filtered and sorted server list */
const filteredServers = computed(() => {
  let result = [...servers.value]

  // Filter by game type
  result = result.filter(s => s.gameType === filters.value.gameType)

  // Filter by locale (region-based: e.g. 'US' matches 'en-US', 'es-US', etc.)
  if (filters.value.locale) {
    const filterRegion = filters.value.locale.toUpperCase()
    result = result.filter(s => extractRegion(s.locale) === filterRegion)
  }

  // Filter by search query
  if (filters.value.search) {
    const q = filters.value.search.toLowerCase()
    result = result.filter(s =>
      s.hostnameClean.toLowerCase().includes(q) ||
      s.projectName.toLowerCase().includes(q) ||
      s.gametype.toLowerCase().includes(q) ||
      s.mapname.toLowerCase().includes(q) ||
      s.endpoint.includes(q)
    )
  }

  // Hide empty servers
  if (filters.value.hideEmpty) {
    result = result.filter(s => s.players > 0)
  }

  // Hide full servers
  if (filters.value.hideFull) {
    result = result.filter(s => s.players < s.maxPlayers)
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0
    switch (filters.value.sortBy) {
      case 'players':
        cmp = a.players - b.players
        break
      case 'name':
        cmp = a.hostnameClean.localeCompare(b.hostnameClean)
        break
      case 'upvotes':
        cmp = a.upvotePower - b.upvotePower
        break
      case 'maxPlayers':
        cmp = a.maxPlayers - b.maxPlayers
        break
    }
    return filters.value.sortOrder === 'desc' ? -cmp : cmp
  })

  return result
})

/** Paginated server list */
const paginatedServers = computed(() => {
  const start = (filters.value.currentPage - 1) * filters.value.perPage
  return filteredServers.value.slice(start, start + filters.value.perPage)
})

/** Total pages */
const totalPages = computed(() =>
  Math.ceil(filteredServers.value.length / filters.value.perPage)
)

/** Total filtered count */
const totalFiltered = computed(() => filteredServers.value.length)

/** Total servers loaded */
const totalServers = computed(() => servers.value.length)

/** Stats for current filter */
const stats = computed(() => {
  const filtered = filteredServers.value
  const totalPlayers = filtered.reduce((sum, s) => sum + s.players, 0)
  const totalSlots = filtered.reduce((sum, s) => sum + s.maxPlayers, 0)
  return {
    serverCount: filtered.length,
    playerCount: totalPlayers,
    totalSlots,
  }
})

export function useServers() {
  const { detectCountryCode } = useGeoLocation()

  /** Load all servers from API (initial load shows skeleton, refresh does not) */
  async function loadServers(isBackgroundRefresh = false) {
    if (!isBackgroundRefresh) {
      loading.value = true
    }
    error.value = null
    loadProgress.value = 0

    try {
      const rawServers: CfxServer[] = await fetchAllServers((count) => {
        loadProgress.value = count
      })

      let newServers = rawServers
        .map(normalizeServer)
        .filter(s => s.hostnameClean.length > 0)

      // Preserve old data for servers with detail panel open
      if (isBackgroundRefresh && expandedServerIds.size > 0) {
        const oldMap = new Map(servers.value.map(s => [s.id, s]))
        newServers = newServers.map(s =>
          expandedServerIds.has(s.id) && oldMap.has(s.id) ? oldMap.get(s.id)! : s
        )
      }

      servers.value = newServers

      lastUpdated.value = new Date()

      // Apply geo-based locale once after first load
      if (!geoLocaleApplied) {
        geoLocaleApplied = true
        try {
          const cc = await detectCountryCode()
          if (cc) {
            // cc is already an ISO country code (e.g. 'TH', 'US')
            const ccUpper = cc.toUpperCase()
            const match = dynamicLocaleOptions.value.find(opt => opt.code === ccUpper)
            if (match) {
              filters.value.locale = match.code
            }
          }
        } catch {
          // geo detection failed, keep filter as-is
        }
      }

      // Also fetch player counts
      playerCounts.value = await fetchPlayerCounts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load servers'
      // Only surface errors on initial load, not background refresh
      if (!isBackgroundRefresh) {
        error.value = message
      }
      console.error('Failed to load servers:', err)
    } finally {
      if (!isBackgroundRefresh) {
        loading.value = false
      }
    }
  }

  /** Refresh server data */
  async function refresh() {
    clearCache()
    await loadServers()
  }

  /** Start auto-refresh */
  function startAutoRefresh() {
    stopAutoRefresh()
    refreshTimer = setInterval(() => loadServers(true), REFRESH_INTERVAL)
  }

  /** Stop auto-refresh */
  function stopAutoRefresh() {
    if (refreshTimer) {
      clearInterval(refreshTimer)
      refreshTimer = null
    }
  }

  /** Reset current page when filters change */
  watch(
    () => [filters.value.search, filters.value.locale, filters.value.gameType, filters.value.hideEmpty, filters.value.hideFull],
    () => {
      filters.value.currentPage = 1
    }
  )

  onUnmounted(() => {
    stopAutoRefresh()
  })

  return {
    servers,
    loading,
    error,
    loadProgress,
    lastUpdated,
    playerCounts,
    filters,
    filteredServers,
    paginatedServers,
    totalPages,
    totalFiltered,
    totalServers,
    stats,
    dynamicLocaleOptions,
    loadServers,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
