<script setup lang="ts">
import { formatNumber } from '@/utils/helpers'
import { useI18n } from '@/i18n'

const { t, timeLocale } = useI18n()

defineProps<{
  serverCount: number
  playerCount: number
  totalSlots: number
  loading: boolean
  lastUpdated: Date | null
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
    <!-- Servers -->
    <div class="rounded-xl border border-surface-800 bg-surface-900/60 p-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600/10">
          <svg class="h-4 w-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">{{ t.statsServers }}</p>
          <p class="text-lg font-bold text-white" v-if="!loading">
            {{ formatNumber(serverCount) }}
          </p>
          <div v-else class="h-6 w-16 animate-pulse rounded bg-surface-800 mt-0.5"></div>
        </div>
      </div>
    </div>

    <!-- Players -->
    <div class="rounded-xl border border-surface-800 bg-surface-900/60 p-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-online/10">
          <svg class="h-4 w-4 text-online" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">{{ t.statsPlayers }}</p>
          <p class="text-lg font-bold text-white" v-if="!loading">
            {{ formatNumber(playerCount) }}
          </p>
          <div v-else class="h-6 w-16 animate-pulse rounded bg-surface-800 mt-0.5"></div>
        </div>
      </div>
    </div>

    <!-- Total Slots -->
    <div class="rounded-xl border border-surface-800 bg-surface-900/60 p-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-500/10">
          <svg class="h-4 w-4 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">{{ t.statsTotalSlots }}</p>
          <p class="text-lg font-bold text-white" v-if="!loading">
            {{ formatNumber(totalSlots) }}
          </p>
          <div v-else class="h-6 w-16 animate-pulse rounded bg-surface-800 mt-0.5"></div>
        </div>
      </div>
    </div>

    <!-- Last Updated -->
    <div class="rounded-xl border border-surface-800 bg-surface-900/60 p-4">
      <div class="flex items-center gap-2">
        <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/10">
          <svg class="h-4 w-4 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-gray-500">{{ t.statsLastUpdated }}</p>
          <p class="text-sm font-medium text-white" v-if="lastUpdated">
            {{ lastUpdated.toLocaleTimeString(timeLocale) }}
          </p>
          <p class="text-sm text-gray-600" v-else>-</p>
        </div>
      </div>
    </div>
  </div>
</template>
