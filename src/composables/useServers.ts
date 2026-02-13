import { ref, computed, watch, onUnmounted } from 'vue'
import type { Server, FilterState, GameType, CfxServer, PlayerCounts } from '@/types'
import { fetchAllServers, fetchPlayerCounts, clearCache } from '@/services/api'
import { normalizeServer } from '@/utils/helpers'
import { DEFAULT_PER_PAGE, REFRESH_INTERVAL } from '@/constants'

const servers = ref<Server[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const loadProgress = ref(0)
const lastUpdated = ref<Date | null>(null)
const playerCounts = ref<PlayerCounts>({ fivem: 0, redm: 0 })
let refreshTimer: ReturnType<typeof setInterval> | null = null

const filters = ref<FilterState>({
  search: '',
  locale: 'th_TH',
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
  /** Load all servers from API */
  async function loadServers() {
    loading.value = true
    error.value = null
    loadProgress.value = 0

    try {
      const rawServers: CfxServer[] = await fetchAllServers((count) => {
        loadProgress.value = count
      })

      servers.value = rawServers
        .map(normalizeServer)
        .filter(s => s.hostnameClean.length > 0)

      lastUpdated.value = new Date()

      // Also fetch player counts
      playerCounts.value = await fetchPlayerCounts()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load servers'
      error.value = message
      console.error('Failed to load servers:', err)
    } finally {
      loading.value = false
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
    refreshTimer = setInterval(loadServers, REFRESH_INTERVAL)
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
