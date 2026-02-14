<script setup lang="ts">
import { computed, ref } from 'vue'
import type { Server } from '@/types'
import { renderHostname, formatNumber, getPlayerFillPercent, getFlagUrl, getConnectUrl, getServerGradient } from '@/utils/helpers'
import { useI18n } from '@/i18n'
import { useServerIcon } from '@/composables/useServerIcon'

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

/** Deterministic gradient for icon fallback */
const serverGradient = computed(() => getServerGradient(props.server.endpoint))

/** Lazy-load icon & banner from single-server API */
const { cardRef, iconUrl, bannerUrl, iconLoading } = useServerIcon(
  props.server.endpoint,
  props.server.bannerUrl,
)

/** Icon error handling */
const iconError = ref(false)
const handleIconError = () => { iconError.value = true }

/** Banner preload — only show after confirmed load */
const bannerLoaded = ref(false)

// Watch bannerUrl and preload when it changes
import { watch } from 'vue'
watch(bannerUrl, (url) => {
  if (!url) return
  bannerLoaded.value = false
  const img = new Image()
  img.onload = () => { bannerLoaded.value = true }
  img.onerror = () => { bannerLoaded.value = false }
  img.src = url
}, { immediate: true })
</script>

<template>
  <div ref="cardRef" class="group relative overflow-hidden rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-3 transition-all duration-200 hover:border-surface-700 hover:bg-surface-900 hover:shadow-xl hover:shadow-black/20">
    <!-- Banner Background -->
    <div
      v-if="bannerLoaded"
      class="absolute inset-0 opacity-10 group-hover:opacity-[0.15] transition-opacity duration-300"
      :style="{
        backgroundImage: `url(${bannerUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }"
    ></div>

    <div class="relative z-10 flex items-center gap-3">
      <!-- Server Icon -->
      <div class="flex-shrink-0">
        <div class="h-10 w-10 rounded-lg flex items-center justify-center overflow-hidden"
             :style="{ background: (!iconUrl || iconError) && !iconLoading ? serverGradient : undefined }"
             :class="{ 'bg-surface-800': (iconUrl && !iconError) || iconLoading }"
        >
          <img
            v-if="iconUrl && !iconError"
            :src="iconUrl"
            :alt="server.hostnameClean"
            class="h-full w-full object-cover"
            loading="lazy"
            @error="handleIconError"
          />
          <!-- Loading skeleton -->
          <div v-else-if="iconLoading" class="h-full w-full bg-surface-700 relative overflow-hidden">
            <div class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-surface-600/40 to-transparent"></div>
          </div>
        </div>
      </div>

      <!-- Server Info (left side) -->
      <div class="min-w-0 flex-1">
        <!-- Hostname -->
        <h3
          class="truncate text-sm font-semibold leading-tight"
          v-html="renderedHostname"
        ></h3>
        <!-- Subtitle -->
        <p v-if="subtitle" class="mt-0.5 truncate text-xs text-gray-500 max-w-[260px]">
          {{ subtitle }}
        </p>
      </div>

      <!-- Tags (center, hidden on small screens) -->
      <div class="hidden md:flex flex-shrink-0 items-center gap-1.5">
        <!-- Game type -->
        <span
          v-if="server.gametype"
          class="inline-flex items-center rounded-md bg-surface-800/80 px-1.5 py-0.5 text-xs text-gray-500 max-w-[90px] truncate"
        >
          {{ server.gametype }}
        </span>

        <!-- Map -->
        <span
          v-if="server.mapname"
          class="inline-flex items-center gap-1 rounded-md bg-surface-800/80 px-1.5 py-0.5 text-xs text-gray-500 max-w-[90px] truncate"
        >
          {{ server.mapname }}
        </span>

        <!-- OneSync -->
        <span
          v-if="server.onesyncEnabled"
          class="inline-flex items-center rounded-md bg-emerald-900/30 px-1.5 py-0.5 text-xs text-emerald-400"
        >
          OS
        </span>

        <!-- Upvotes -->
        <span
          v-if="server.upvotePower > 0"
          class="inline-flex items-center gap-0.5 rounded-md bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-400"
        >
          <svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
          </svg>
          {{ server.upvotePower }}
        </span>

        <!-- Locale flag -->
        <span class="inline-flex items-center">
          <img v-if="flagSrc" :src="flagSrc" :alt="server.locale" class="h-4 w-5 rounded-xs object-cover" loading="lazy" />
          <svg v-else class="h-4 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </div>

      <!-- Player count + bar -->
      <div class="flex-shrink-0 flex items-center gap-2">
        <div class="text-right">
          <div class="flex items-center gap-1">
            <svg class="h-4 w-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <span class="text-sm font-semibold text-white">{{ formatNumber(server.players) }}</span>
            <span class="text-xs text-gray-500">/{{ server.maxPlayers }}</span>
          </div>
          <div class="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-800">
            <div
              :class="['h-full rounded-full transition-all duration-500', playerBarColor]"
              :style="{ width: `${playerPercent}%` }"
            ></div>
          </div>
        </div>
      </div>

      <!-- Connect button -->
      <div class="flex-shrink-0">
        <a
          :href="getConnectUrl(server.id)"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 active:scale-95"
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
