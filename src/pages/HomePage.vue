<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useServers } from '@/composables/useServers'
import { useSeo } from '@/composables/useSeo'
import { useI18n } from '@/i18n'
import type { AdSlot, SortField, SortOrder } from '@/types'

const { t } = useI18n()
const { updateSeo, updateStructuredData } = useSeo()

import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import AdBanner from '@/components/layout/AdBanner.vue'
import ServerSearch from '@/components/server/ServerSearch.vue'
import ServerFilters from '@/components/server/ServerFilters.vue'
import ServerList from '@/components/server/ServerList.vue'
import StatsBar from '@/components/common/StatsBar.vue'
import Pagination from '@/components/common/Pagination.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import CfxFeed from '@/components/sidebar/CfxFeed.vue'

const {
  loading,
  error,
  loadProgress,
  lastUpdated,
  playerCounts,
  filters,
  paginatedServers,
  totalPages,
  totalFiltered,
  stats,
  loadServers,
  refresh,
  startAutoRefresh,
} = useServers()

// Ad slot configurations
const headerAd: AdSlot = { id: 'header-banner', position: 'header', size: 'leaderboard', enabled: true }
const sidebarAd: AdSlot = { id: 'sidebar-rect', position: 'sidebar', size: 'rectangle', enabled: true }
const sidebarAd2: AdSlot = { id: 'sidebar-rect-2', position: 'sidebar', size: 'rectangle', enabled: true }
const sidebarAd3: AdSlot = { id: 'sidebar-rect-3', position: 'sidebar', size: 'rectangle', enabled: true }

function handleSortUpdate(field: SortField, order: SortOrder) {
  filters.value.sortBy = field
  filters.value.sortOrder = order
}

onMounted(async () => {
  updateSeo()
  await loadServers()
  startAutoRefresh()
})

// Update structured data when stats change
watch(stats, (newStats) => {
  if (newStats.serverCount > 0) {
    updateStructuredData({
      serverCount: newStats.serverCount,
      playerCount: newStats.playerCount,
    })
  }
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader
      :game-type="filters.gameType"
      :player-counts="playerCounts"
      @update:game-type="filters.gameType = $event"
    />

    <main class="flex-1">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <!-- Content -->
        <div class="flex gap-6">
          <!-- Main content -->
          <div class="min-w-0 flex-1">
            <!-- Header Ad -->
            <div class="flex justify-center">
              <AdBanner :ad-slot="headerAd" />
            </div>

            <!-- Hero Stats -->
            <StatsBar
              :server-count="stats.serverCount"
              :player-count="stats.playerCount"
              :total-slots="stats.totalSlots"
              :loading="loading && paginatedServers.length === 0"
              :last-updated="lastUpdated"
            />

            <!-- Search & Filters -->
            <div class="my-6 space-y-4">
              <ServerSearch
                v-model="filters.search"
                :total-results="totalFiltered"
                :loading="loading"
              />
              <ServerFilters
                :filters="filters"
                @update:locale="filters.locale = $event"
                @update:hide-empty="filters.hideEmpty = $event"
                @update:hide-full="filters.hideFull = $event"
                @update:sort="handleSortUpdate"
                @refresh="refresh"
              />
            </div>

            <!-- Error Alert -->
            <div
              v-if="error"
              class="mt-6 flex items-center gap-3 rounded-xl border border-red-800/50 bg-red-900/20 px-5 py-4"
            >
              <svg class="h-5 w-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <div>
                <p class="text-sm font-medium text-red-300">{{ t.errorOccurred }}</p>
                <p class="text-xs text-red-400/70 mt-0.5">{{ error }}</p>
              </div>
              <button
                @click="refresh"
                class="ml-auto rounded-lg bg-red-800/50 px-3 py-1.5 text-xs text-red-300 hover:bg-red-800"
              >
                {{ t.tryAgain }}
              </button>
            </div>
            <!-- Loading -->
            <LoadingSpinner
              v-if="loading && paginatedServers.length === 0"
              :progress="loadProgress"
            />

            <!-- Server List -->
            <template v-else>
              <ServerList
                :servers="paginatedServers"
                :loading="false"
                :current-page="filters.currentPage"
                :per-page="filters.perPage"
              />

              <Pagination
                :current-page="filters.currentPage"
                :total-pages="totalPages"
                @update:current-page="filters.currentPage = $event"
              />
            </template>
          </div>

          <!-- Sidebar (Desktop) -->
          <aside class="hidden lg:block w-[300px] flex-shrink-0 space-y-6">
            <!-- Quick Info Card -->
            <div class="rounded-xl border border-surface-800 bg-surface-900/60 p-5">
              <h3 class="text-sm font-semibold text-white mb-3">{{ t.about }}</h3>
              <p class="text-xs text-gray-500 leading-relaxed">
                {{ t.aboutDescription }}
              </p>
              <div class="mt-4 space-y-2">
                <a
                  href="https://fivem.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-xs text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {{ t.downloadFiveM }}
                </a>
                <a
                  href="https://redm.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="flex items-center gap-2 text-xs text-gray-400 hover:text-primary-400 transition-colors"
                >
                  <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  {{ t.downloadRedM }}
                </a>
              </div>
            </div>

            <!-- Sidebar Ad -->
            <AdBanner :ad-slot="sidebarAd" />

            <!-- Cfx.re Feed -->
            <CfxFeed />

            <!-- Sidebar Ad -->
            <AdBanner :ad-slot="sidebarAd2" />
            <AdBanner :ad-slot="sidebarAd3" />
          </aside>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
