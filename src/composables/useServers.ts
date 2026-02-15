import { ref, reactive, computed, watch, onUnmounted } from 'vue'
import type { Server, FilterState, GameType, CfxServer, PlayerCounts } from '@/types'
import { fetchAllServers, fetchPlayerCounts, clearCache } from '@/services/api'
import { normalizeServer } from '@/utils/helpers'
import { DEFAULT_PER_PAGE, REFRESH_INTERVAL, LOCALE_OPTIONS } from '@/constants'

const servers = ref<Server[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const loadProgress = ref(0)
const lastUpdated = ref<Date | null>(null)
const playerCounts = ref<PlayerCounts>({ fivem: 0, redm: 0 })
let refreshTimer: ReturnType<typeof setInterval> | null = null

/**
 * Set of server IDs currently expanded (detail panel open).
 * Exported at module level so ServerCard can add/remove without calling useServers().
 * Background refresh preserves old data for these servers to keep the UI stable.
 */
export const expandedServerIds = reactive(new Set<string>())

/**
 * Detect client locale from browser and match to available LOCALE_OPTIONS.
 * Returns matched locale code (e.g. 'th-TH') or '' (All) if no match.
 */
function detectClientLocale(): string {
  try {
    const langs = navigator.languages ?? [navigator.language]
    for (const lang of langs) {
      // Try exact match first (e.g., en-US → en-US)
      const exact = LOCALE_OPTIONS.find(
        opt => opt.code && opt.code.toLowerCase() === lang.toLowerCase()
      )
      if (exact) return exact.code

      // Try language-only match (e.g., th → th-TH, de → de-DE)
      const langCode = lang.split('-')[0]?.toLowerCase()
      if (langCode) {
        const partial = LOCALE_OPTIONS.find(
          opt => opt.code && opt.code.split('-')[0]?.toLowerCase() === langCode
        )
        if (partial) return partial.code
      }
    }
  } catch {
    // navigator.languages may be unavailable
  }
  return '' // default: show all
}

const filters = ref<FilterState>({
  search: '',
  locale: detectClientLocale(),
  gameType: 'fivem' as GameType,
  hideEmpty: false,
  hideFull: false,
  sortBy: 'players',
  sortOrder: 'desc',
  currentPage: 1,
  perPage: DEFAULT_PER_PAGE,
})

/** Filtered and sorted server list */
const filteredServers = computed(() => {
  let result = [...servers.value]

  // Filter by game type
  result = result.filter(s => s.gameType === filters.value.gameType)

  // Filter by locale
  if (filters.value.locale) {
    result = result.filter(s => s.locale === filters.value.locale)
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
    loadServers,
    refresh,
    startAutoRefresh,
    stopAutoRefresh,
  }
}
