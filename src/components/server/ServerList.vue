<script setup lang="ts">
import type { Server, AdSlot } from '@/types'
import ServerCard from './ServerCard.vue'
import AdBanner from '@/components/layout/AdBanner.vue'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const props = defineProps<{
  servers: Server[]
  loading: boolean
  currentPage: number
  perPage: number
}>()

/** Inline ad config - show ads every N servers */
const inlineAdInterval = 10

const inlineAdSlot: AdSlot = {
  id: 'inline-server-list',
  position: 'inline',
  size: 'leaderboard',
  enabled: true,
}
</script>

<template>
  <div class="space-y-3">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div
        v-for="i in 8"
        :key="i"
        class="animate-pulse rounded-xl border border-surface-800 bg-surface-900/60 p-4"
      >
        <div class="flex items-start gap-4">
          <div class="h-12 w-12 rounded-lg bg-surface-800"></div>
          <div class="flex-1 space-y-2">
            <div class="h-4 w-3/4 rounded bg-surface-800"></div>
            <div class="h-3 w-1/2 rounded bg-surface-800"></div>
            <div class="flex gap-2 mt-2">
              <div class="h-5 w-16 rounded bg-surface-800"></div>
              <div class="h-5 w-16 rounded bg-surface-800"></div>
            </div>
          </div>
          <div class="h-8 w-20 rounded-lg bg-surface-800"></div>
        </div>
      </div>
    </template>

    <!-- Server list -->
    <template v-else-if="servers.length > 0">
      <template v-for="(server, index) in servers" :key="server.id">
        <!-- Inline Ad - every N items -->
        <AdBanner
          v-if="index > 0 && index % inlineAdInterval === 0"
          :ad-slot="inlineAdSlot"
        />

        <ServerCard
          :server="server"
        />
      </template>
    </template>

    <!-- Empty state -->
    <div
      v-else
      class="flex flex-col items-center justify-center rounded-xl border border-surface-800 bg-surface-900/60 py-16"
    >
      <svg class="h-16 w-16 text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <p class="text-lg font-medium text-gray-400">{{ t.noServersFound }}</p>
      <p class="mt-1 text-sm text-gray-600">{{ t.noServersSuggestion }}</p>
    </div>
  </div>
</template>
