<script setup lang="ts">
import { computed, ref, onBeforeUnmount } from 'vue'
import type { Server } from '@/types'
import { renderHostname, formatNumber, getPlayerFillPercent, getConnectUrl, getServerGradient, getCountryCode } from '@/utils/helpers'
import { useI18n } from '@/i18n'
import { useServerIcon } from '@/composables/useServerIcon'
import { expandedServerIds } from '@/composables/useServers'
import { getCountryFlagUrl } from '@/composables/useCountryFlag'
import ServerCardDetail from './ServerCardDetail.vue'
import AppTooltip from '@/components/common/AppTooltip.vue'

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
  return 'bg-online'
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

const flagSrc = computed(() => {
  const cc = getCountryCode(props.server.locale)
  return cc ? getCountryFlagUrl(cc) : ''
})

/** Deterministic gradient for icon fallback */
const serverGradient = computed(() => getServerGradient(props.server.endpoint))

/** Lazy-load icon & banner from single-server API */
const _serverIcon = useServerIcon(
  props.server.endpoint,
  props.server.bannerUrl,
  props.server.upvotePower,
  props.server.burstPower,
)
const iconUrl = _serverIcon.iconUrl
const bannerUrl = _serverIcon.bannerUrl
const upvotePower = _serverIcon.upvotePower
const iconLoading = _serverIcon.iconLoading
const serverLoadFailed = _serverIcon.loadFailed
const connectEnabled = _serverIcon.connectEnabled

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

// ── Expand / Collapse logic ────────────────────────────────────────────
const expanded = ref(false)

// Sync expanded state with global set so auto-refresh can preserve data
watch(expanded, (val) => {
  if (val) expandedServerIds.add(props.server.id)
  else expandedServerIds.delete(props.server.id)
})

onBeforeUnmount(() => {
  expandedServerIds.delete(props.server.id)
})

/** Desktop: require pointer device with hover capability */
const isDesktop = typeof window !== 'undefined'
  ? window.matchMedia('(hover: hover) and (pointer: fine)')
  : null

let hoverTimer: ReturnType<typeof setTimeout> | null = null
const HOVER_DELAY = 1000 // ms before expand on hover

/** Detect Windows platform for Connect button (fivem:// protocol) */
const isWindows = typeof navigator !== 'undefined'
  && /Windows/i.test(navigator.userAgent)

/** Track if mouse is over the Connect button to prevent card expansion */
const isOverConnect = ref(false)

/** Connect button should be disabled by default, enabled only after successful load & non-private */
const connectDisabled = computed(() => !connectEnabled.value)

function handleMouseEnter() {
  if (!isDesktop?.matches) return
  if (isOverConnect.value) return
  if (serverLoadFailed.value) return // don't expand if loading failed
  hoverTimer = setTimeout(() => { expanded.value = true }, HOVER_DELAY)
}

function handleMouseLeave() {
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null }
  if (isDesktop?.matches) { expanded.value = false }
}

function handleConnectEnter() {
  isOverConnect.value = true
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null }
}

function handleConnectLeave() {
  isOverConnect.value = false
  // Restart hover timer since mouse is still inside the card
  if (isDesktop?.matches && !expanded.value) {
    hoverTimer = setTimeout(() => { expanded.value = true }, HOVER_DELAY)
  }
}

function handleDetailLoaded(payload: { loadFailed: boolean; isPrivate: boolean }) {
  // If load failed, collapse the card immediately
  if (payload.loadFailed) {
    expanded.value = false
  }
}

function handleCardClick(e: MouseEvent) {
  // Don't toggle when clicking interactive elements (links, buttons, tooltips)
  const target = e.target as HTMLElement
  if (target.closest('a, button')) return

  // Don't expand if loading failed
  if (serverLoadFailed.value) return

  // Toggle on click (both desktop and mobile)
  expanded.value = !expanded.value
}

onBeforeUnmount(() => {
  if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null }
})
</script>

<template>
  <div
    :ref="(el) => { _serverIcon.cardRef.value = el as HTMLElement | null }"
    class="group relative overflow-hidden rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-3 transition-all duration-200 hover:border-surface-700 hover:bg-surface-900 hover:shadow-xl hover:shadow-black/20 cursor-pointer select-none"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click="handleCardClick"
  >
    <!-- Banner Background (fixed to header row, does not expand) -->
    <div class="absolute inset-x-0 top-0 h-[calc(2.5rem+1.5rem)] pointer-events-none">
      <div
        v-if="bannerLoaded"
        class="absolute inset-0 opacity-10 group-hover:opacity-[0.15] transition-opacity duration-300"
        :style="{
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }"
      ></div>
    </div>

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
        <p v-if="subtitle" class="mt-0.5 truncate text-xs text-gray-500">
          {{ subtitle }}
        </p>
      </div>

      <!-- Tags (center, hidden on small screens) -->
      <div class="hidden md:flex flex-shrink-0 items-center gap-1.5">
        <!-- Game type -->
        <span
          v-if="server.gametype"
          class="inline-flex items-center rounded-md bg-surface-800/80 px-1.5 py-0.5 text-xs text-gray-500 truncate"
        >
          {{ server.gametype }}
        </span>

        <!-- Map -->
        <span
          v-if="server.mapname"
          class="inline-flex items-center gap-1 rounded-md bg-surface-800/80 px-1.5 py-0.5 text-xs text-gray-500 truncate"
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
          v-if="upvotePower > 1"
          class="inline-flex items-center gap-0.5 rounded-md bg-amber-900/30 px-1.5 py-0.5 text-xs text-amber-400"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {{ upvotePower }}
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
            <svg class="h-3.5 w-3.5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
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

      <!-- Connect button (Windows desktop only) -->
      <div v-if="isWindows" class="hidden md:flex flex-shrink-0"
        @mouseenter="handleConnectEnter"
        @mouseleave="handleConnectLeave"
      >
        <!-- Disabled state: load failed or private server -->
        <AppTooltip
          v-if="connectDisabled"
          :text="serverLoadFailed ? t.connectUnavailable : t.connectPrivate"
          position="top"
        >
          <span
            class="flex items-center gap-1.5 rounded-lg bg-surface-700 px-3 py-1.5 text-xs font-medium text-gray-500 cursor-not-allowed select-none"
          >
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M5 3v18l15-9L5 3z" />
            </svg>
            <span class="hidden sm:inline">{{ t.connect }}</span>
          </span>
        </AppTooltip>
        <!-- Normal state -->
        <a
          v-else
          :href="getConnectUrl(server.gameType, server.id)"
          class="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-primary-600/20 transition-all duration-200 hover:bg-primary-500 hover:shadow-primary-500/30 active:scale-95"
          @click.stop
        >
          <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M5 3v18l15-9L5 3z" />
          </svg>
          <span class="hidden sm:inline">{{ t.connect }}</span>
        </a>
      </div>

      <!-- Expand indicator (mobile only) -->
      <div class="md:hidden flex-shrink-0 ml-0.5">
        <svg
          class="h-4 w-4 text-gray-600 transition-transform duration-200"
          :class="{ 'rotate-180': expanded }"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Expanded Detail Panel -->
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[800px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[800px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="expanded" class="overflow-hidden">
        <ServerCardDetail
          :endpoint="server.endpoint"
          :game-type="server.gameType"
          :server-id="server.id"
          @loaded="handleDetailLoaded"
        />
      </div>
    </Transition>
  </div>
</template>
