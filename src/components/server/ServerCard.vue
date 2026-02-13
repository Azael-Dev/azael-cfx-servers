<script setup lang="ts">
import { computed } from 'vue'
import type { Server } from '@/types'
import { renderHostname, formatNumber, getPlayerFillPercent, getFlagUrl, getConnectUrl } from '@/utils/helpers'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const props = defineProps<{
  server: Server
  rank?: number
}>()

const playerPercent = computed(() =>
  getPlayerFillPercent(props.server.players, props.server.maxPlayers)
)

const playerBarColor = computed(() => {
  if (playerPercent.value >= 90) return 'bg-red-500'
  if (playerPercent.value >= 70) return 'bg-warning'
  if (playerPercent.value >= 30) return 'bg-online'
  return 'bg-primary-500'
})

const renderedHostname = computed(() => renderHostname(props.server.hostname))

const flagSrc = computed(() => getFlagUrl(props.server.locale))
</script>

<template>
  <div class="group relative rounded-xl border border-surface-800 bg-surface-900/60 p-4 transition-all duration-200 hover:border-surface-700 hover:bg-surface-900 hover:shadow-xl hover:shadow-black/20">
    <!-- Rank badge -->
    <div
      v-if="rank && rank <= 3"
      :class="[
        'absolute -top-2 -left-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-lg',
        rank === 1 ? 'bg-yellow-500 text-black' : '',
        rank === 2 ? 'bg-gray-300 text-black' : '',
        rank === 3 ? 'bg-amber-700 text-white' : '',
      ]"
    >
      {{ rank }}
    </div>

    <div class="flex items-start gap-4">
      <!-- Server Icon -->
      <div class="flex-shrink-0">
        <div class="h-12 w-12 rounded-lg bg-surface-800 flex items-center justify-center overflow-hidden">
          <img
            v-if="server.iconUrl"
            :src="server.iconUrl"
            :alt="server.hostnameClean"
            class="h-full w-full object-cover"
            loading="lazy"
          />
          <span v-else class="text-lg text-gray-600">
            {{ server.gameType === 'fivem' ? '🎮' : '🤠' }}
          </span>
        </div>
      </div>

      <!-- Server Info -->
      <div class="min-w-0 flex-1">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0 flex-1">
            <!-- Hostname with colors -->
            <h3
              class="truncate text-sm font-semibold leading-tight"
              v-html="renderedHostname"
            ></h3>

            <!-- Project name -->
            <p v-if="server.projectName" class="mt-0.5 truncate text-xs text-gray-500">
              {{ server.projectName }}
            </p>
          </div>

          <!-- Player count -->
          <div class="flex-shrink-0 text-right">
            <div class="flex items-center gap-1.5">
              <svg class="h-3.5 w-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
              </svg>
              <span class="text-sm font-semibold text-white">
                {{ formatNumber(server.players) }}
              </span>
              <span class="text-xs text-gray-500">/</span>
              <span class="text-xs text-gray-500">{{ server.maxPlayers }}</span>
            </div>

            <!-- Player bar -->
            <div class="mt-1.5 h-1 w-20 overflow-hidden rounded-full bg-surface-800">
              <div
                :class="['h-full rounded-full transition-all duration-500', playerBarColor]"
                :style="{ width: `${playerPercent}%` }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Tags row -->
        <div class="mt-2.5 flex flex-wrap items-center gap-2">
          <!-- Locale flag -->
          <span class="inline-flex items-center gap-1 rounded-md bg-surface-800 px-2 py-0.5 text-xs text-gray-400">
            <img v-if="flagSrc" :src="flagSrc" :alt="server.locale" class="h-3.5 w-auto rounded-sm" loading="lazy" />
            <span v-else>🌐</span>
            <span class="hidden sm:inline">{{ server.locale }}</span>
          </span>

          <!-- Game type -->
          <span
            v-if="server.gametype"
            class="inline-flex items-center rounded-md bg-surface-800 px-2 py-0.5 text-xs text-gray-400 max-w-[120px] truncate"
          >
            {{ server.gametype }}
          </span>

          <!-- Map -->
          <span
            v-if="server.mapname"
            class="inline-flex items-center rounded-md bg-surface-800 px-2 py-0.5 text-xs text-gray-400 max-w-[120px] truncate"
          >
            🗺️ {{ server.mapname }}
          </span>

          <!-- OneSync badge -->
          <span
            v-if="server.onesyncEnabled"
            class="inline-flex items-center rounded-md bg-emerald-900/30 px-2 py-0.5 text-xs text-emerald-400"
          >
            OneSync
          </span>

          <!-- Upvotes -->
          <span
            v-if="server.upvotePower > 0"
            class="inline-flex items-center gap-1 rounded-md bg-amber-900/30 px-2 py-0.5 text-xs text-amber-400"
          >
            🔥 {{ server.upvotePower }}
          </span>
        </div>
      </div>

      <!-- Connect button -->
      <div class="flex-shrink-0 self-center">
        <a
          :href="getConnectUrl(server.id)"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2 text-xs font-medium text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 active:scale-95"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span class="hidden sm:inline">{{ t.connect }}</span>
        </a>
      </div>
    </div>
  </div>
</template>
