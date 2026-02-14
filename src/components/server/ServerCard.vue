<script setup lang="ts">
import { computed } from 'vue'
import type { Server } from '@/types'
import { renderHostname, formatNumber, getPlayerFillPercent, getFlagUrl, getConnectUrl } from '@/utils/helpers'
import { useI18n } from '@/i18n'

const { t } = useI18n()

const props = defineProps<{
  server: Server
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

/** Resolved display name: sv_projectName > sv_projectDesc > hostname */
const displayName = computed(() =>
  props.server.projectName || props.server.projectDescription || props.server.hostname
)

const renderedHostname = computed(() => renderHostname(displayName.value))

/** Show subtitle only when main title is projectName and projectDescription exists */
const subtitle = computed(() =>
  props.server.projectName && props.server.projectDescription
    ? props.server.projectDescription
    : ''
)

const flagSrc = computed(() => getFlagUrl(props.server.locale))
</script>

<template>
  <div class="group relative overflow-hidden rounded-xl border border-surface-800 bg-surface-900/60 p-4 transition-all duration-200 hover:border-surface-700 hover:bg-surface-900 hover:shadow-xl hover:shadow-black/20">
    <!-- Banner Background -->
    <div
      v-if="server.bannerUrl"
      class="absolute inset-0 opacity-10 group-hover:opacity-[0.15] transition-opacity duration-300"
      :style="{
        backgroundImage: `url(${server.bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    ></div>

    <div class="relative z-10 flex items-start gap-4">
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
          <svg v-else class="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
          </svg>
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

            <!-- Project description (shown when main title is sv_projectName) -->
            <p v-if="subtitle" class="mt-0.5 truncate text-xs text-gray-500">
              {{ subtitle }}
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
            <img v-if="flagSrc" :src="flagSrc" :alt="server.locale" class="h-3 w-5 rounded-sm object-cover" loading="lazy" />
            <svg v-else class="h-3 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
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
            class="inline-flex items-center gap-1 rounded-md bg-surface-800 px-2 py-0.5 text-xs text-gray-400 max-w-[120px] truncate"
          >
            <svg class="h-3 w-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            {{ server.mapname }}
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
            <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
            </svg>
            {{ server.upvotePower }}
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
