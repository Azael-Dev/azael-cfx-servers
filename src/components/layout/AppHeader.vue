<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import type { GameType, PlayerCounts } from '@/types'
import type { Locale } from '@/i18n/types'
import { formatNumber } from '@/utils/helpers'
import { useI18n } from '@/i18n'
import { SOCIAL_LINKS } from '@/constants'
import { getCountryFlagUrl } from '@/composables/useCountryFlag'

const { t, currentLocale, setLocale, availableLocales } = useI18n()

const props = defineProps<{
  gameType: GameType
  playerCounts: PlayerCounts
}>()

const emit = defineEmits<{
  'update:gameType': [value: GameType]
}>()

const currentCount = computed(() =>
  props.gameType === 'fivem' ? props.playerCounts.fivem : props.playerCounts.redm
)

/** Custom language dropdown */
const langOpen = ref(false)
const langDropdownRef = ref<HTMLElement | null>(null)

const currentLang = computed(() =>
  availableLocales.find(l => l.code === currentLocale.value) || availableLocales[0]!
)

function selectLang(locale: Locale) {
  setLocale(locale)
  langOpen.value = false
}

function toggleLangDropdown() {
  langOpen.value = !langOpen.value
}

function handleClickOutside(event: MouseEvent) {
  if (langDropdownRef.value && !langDropdownRef.value.contains(event.target as Node)) {
    langOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-surface-800 bg-surface-950/80 backdrop-blur-xl">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <router-link to="/" class="flex items-center gap-3 group">
          <img src="/images/logo.gif" alt="CFX Logo" class="h-9 w-9 object-contain rounded-full" />
          <div class="hidden sm:block">
            <h1 class="text-lg font-bold text-white group-hover:text-primary-400 transition-colors">
              {{ t.siteTitle }}
            </h1>
            <p class="text-xs text-gray-500 -mt-0.5">{{ t.siteSubtitle }}</p>
          </div>
        </router-link>

        <!-- Game Type Toggle -->
        <div class="flex items-center gap-2">
          <div class="flex rounded-lg bg-surface-900 p-1 border border-surface-800">
            <button
              @click="emit('update:gameType', 'fivem')"
              :class="[
                'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                gameType === 'fivem'
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-surface-800'
              ]"
            >
              FiveM
            </button>
            <button
              @click="emit('update:gameType', 'redm')"
              :class="[
                'px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                gameType === 'redm'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                  : 'text-gray-400 hover:text-white hover:bg-surface-800'
              ]"
            >
              RedM
            </button>
          </div>

          <!-- Player count badge -->
          <div v-if="currentCount > 0" class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary-600/10 to-primary-500/10 border border-primary-600/20 backdrop-blur-sm">
            <div class="relative flex items-center justify-center">
              <span class="absolute h-3 w-3 rounded-full bg-emerald-500 animate-ping opacity-75"></span>
              <svg class="relative h-4 w-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
              </svg>
            </div>
            <div class="flex items-baseline gap-1">
              <span class="text-sm font-semibold text-gray-300">{{ formatNumber(currentCount) }}</span>
              <span class="text-xs text-gray-400">{{ t.online }}</span>
            </div>
          </div>
        </div>

        <!-- Right section -->
        <div class="flex items-center gap-2">
          <!-- Language Switcher (custom dropdown) -->
          <div ref="langDropdownRef" class="relative">
            <button
              type="button"
              @click="toggleLangDropdown"
              class="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-gray-400 hover:text-white hover:bg-surface-800 transition-colors focus:outline-none cursor-pointer"
              :title="currentLang.label"
            >
              <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M3.6 9h16.8M3.6 15h16.8" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9Z" />
              </svg>
              <span class="text-sm font-medium uppercase">{{ currentLang.code }}</span>
              <svg
                class="h-4 w-4 transition-transform"
                :class="{ 'rotate-180': langOpen }"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <!-- Dropdown list -->
            <Transition
              enter-active-class="transition duration-100 ease-out"
              enter-from-class="scale-95 opacity-0"
              enter-to-class="scale-100 opacity-100"
              leave-active-class="transition duration-75 ease-in"
              leave-from-class="scale-100 opacity-100"
              leave-to-class="scale-95 opacity-0"
            >
              <ul
                v-if="langOpen"
                class="absolute right-0 z-50 mt-1 w-44 overflow-auto rounded-lg border border-surface-700 bg-surface-900 py-1 shadow-xl shadow-black/30"
              >
                <li
                  v-for="loc in availableLocales"
                  :key="loc.code"
                  @click="selectLang(loc.code)"
                  :class="[
                    'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-800',
                    loc.code === currentLocale ? 'bg-primary-600/15 text-primary-400' : 'text-gray-300',
                  ]"
                >
                  <img
                    :src="getCountryFlagUrl(loc.countryCode)"
                    :alt="loc.label"
                    class="h-3 w-5 rounded-sm object-cover"
                    loading="lazy"
                  />
                  <span>{{ loc.label }}</span>
                </li>
              </ul>
            </Transition>
          </div>

          <a
            :href="SOCIAL_LINKS.GITHUB"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="GitHub"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>

          <a
            :href="SOCIAL_LINKS.DISCORD"
            target="_blank"
            rel="noopener noreferrer"
            class="flex items-center justify-center h-9 w-9 rounded-lg text-gray-400 hover:text-white hover:bg-surface-800 transition-colors"
            title="Discord"
          >
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </header>
</template>
