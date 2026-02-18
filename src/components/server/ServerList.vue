<script setup lang="ts">
import type { Server, AdSlot } from '@/types'
import ServerCard from './ServerCard.vue'
import AdBanner from '@/components/layout/AdBanner.vue'
import { useI18n } from '@/i18n'
import { AD_ENABLED } from '@/constants'

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
  enabled: AD_ENABLED.CONTENT,
}
</script>

<template>
  <div class="space-y-3">
    <!-- Loading skeleton -->
    <template v-if="loading">
      <div
        v-for="i in 8"
        :key="i"
        class="rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <!-- Icon skeleton -->
          <div class="h-10 w-10 flex-shrink-0 rounded-lg bg-surface-800 animate-pulse"></div>

          <!-- Server info skeleton -->
          <div class="min-w-0 flex-1 space-y-1">
            <div class="h-4 rounded bg-surface-800 animate-pulse" :style="{ width: `${50 + (i % 3) * 15}%` }"></div>
            <div class="h-3 rounded bg-surface-800/60 animate-pulse" :style="{ width: `${30 + (i % 4) * 10}%`, maxWidth: '260px' }"></div>
          </div>

          <!-- Tags skeleton (hidden on small screens) -->
          <div class="hidden md:flex flex-shrink-0 items-center gap-1.5">
            <div class="h-5 w-16 rounded-md bg-surface-800 animate-pulse"></div>
            <div class="h-5 w-16 rounded-md bg-surface-800 animate-pulse"></div>
            <div class="h-5 w-8 rounded-md bg-surface-800 animate-pulse"></div>
            <div class="h-4 w-5 rounded-xs bg-surface-800 animate-pulse"></div>
          </div>

          <!-- Player count skeleton -->
          <div class="flex-shrink-0 text-right space-y-1">
            <div class="flex items-center gap-1 justify-end">
              <div class="h-4 w-4 rounded bg-surface-800 animate-pulse"></div>
              <div class="h-4 w-10 rounded bg-surface-800 animate-pulse"></div>
              <div class="h-3 w-6 rounded bg-surface-800/60 animate-pulse"></div>
            </div>
            <div class="h-1 w-full rounded-full bg-surface-800 animate-pulse"></div>
          </div>

          <!-- Connect button skeleton (Windows desktop only) -->
          <div class="hidden md:flex flex-shrink-0">
            <div class="h-[30px] w-[72px] rounded-lg bg-surface-800 animate-pulse"></div>
          </div>

          <!-- Expand indicator skeleton (mobile only) -->
          <div class="flex-shrink-0 ml-0.5 md:hidden">
            <div class="h-4 w-4 rounded bg-surface-800/60 animate-pulse"></div>
          </div>
        </div>
      </div>
    </template>

    <!-- Server list -->
    <template v-else-if="servers.length > 0">
      <template v-for="(server, index) in servers" :key="server.id">
        <!-- Inline Ad - every N items -->
        <AdBanner
          v-if="index > 0 && index % inlineAdInterval === 0"
          :key="`ad-${index}`"
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
