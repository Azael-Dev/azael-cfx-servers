<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FilterState, SortField, SortOrder } from '@/types'
import type { TranslationSchema } from '@/i18n/types'
import { LOCALE_OPTIONS, SORT_OPTIONS } from '@/constants'
import { useI18n } from '@/i18n'
import { getFlagUrl } from '@/utils/helpers'

const { t } = useI18n()

/** Locale options with i18n "All" label */
const localeOptions = computed(() =>
  LOCALE_OPTIONS.map(opt =>
    opt.code === '' ? { ...opt, label: t.value.allLocales } : opt
  )
)

/** Locale dropdown open state */
const localeOpen = ref(false)
const localeDropdownRef = ref<HTMLElement | null>(null)

/** Currently selected locale option */
const selectedLocale = computed(() =>
  localeOptions.value.find(opt => opt.code === props.filters.locale) || localeOptions.value[0]!
)

function selectLocale(code: string) {
  emit('update:locale', code)
  localeOpen.value = false
}

function toggleLocaleDropdown() {
  localeOpen.value = !localeOpen.value
}

/** Close dropdown when clicking outside */
function handleClickOutside(event: MouseEvent) {
  if (localeDropdownRef.value && !localeDropdownRef.value.contains(event.target as Node)) {
    localeOpen.value = false
  }
}

import { onMounted, onUnmounted } from 'vue'
onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const props = defineProps<{
  filters: FilterState
}>()

const emit = defineEmits<{
  'update:locale': [value: string]
  'update:hideEmpty': [value: boolean]
  'update:hideFull': [value: boolean]
  'update:sort': [field: SortField, order: SortOrder]
  'refresh': []
}>()

function handleSortChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value
  const [field, order] = value.split(':') as [SortField, SortOrder]
  emit('update:sort', field, order)
}

function handleHideEmptyChange(event: Event) {
  emit('update:hideEmpty', (event.target as HTMLInputElement).checked)
}

function handleHideFullChange(event: Event) {
  emit('update:hideFull', (event.target as HTMLInputElement).checked)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Locale Filter (custom dropdown with flag images) -->
    <div ref="localeDropdownRef" class="relative">
      <button
        type="button"
        @click="toggleLocaleDropdown"
        class="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-sm text-white transition-colors hover:border-surface-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <img
          v-if="selectedLocale.code && getFlagUrl(selectedLocale.code)"
          :src="getFlagUrl(selectedLocale.code)"
          :alt="selectedLocale.code"
          class="h-4 w-auto rounded-sm"
        />
        <span v-else class="text-base leading-none">🌐</span>
        <span>{{ selectedLocale.label }}</span>
        <svg class="h-4 w-4 text-gray-500 transition-transform" :class="{ 'rotate-180': localeOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          v-if="localeOpen"
          class="absolute left-0 z-50 mt-1 max-h-72 w-56 overflow-auto rounded-lg border border-surface-700 bg-surface-900 py-1 shadow-xl shadow-black/30"
        >
          <li
            v-for="opt in localeOptions"
            :key="opt.code"
            @click="selectLocale(opt.code)"
            :class="[
              'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-800',
              opt.code === props.filters.locale ? 'bg-primary-600/15 text-primary-400' : 'text-gray-300',
            ]"
          >
            <img
              v-if="opt.code && getFlagUrl(opt.code)"
              :src="getFlagUrl(opt.code)"
              :alt="opt.code"
              class="h-4 w-auto rounded-sm"
            />
            <span v-else class="text-base leading-none">🌐</span>
            <span>{{ opt.label }}</span>
          </li>
        </ul>
      </Transition>
    </div>

    <!-- Sort -->
    <div class="relative">
      <select
        :value="`${props.filters.sortBy}:${props.filters.sortOrder}`"
        @change="handleSortChange"
        class="appearance-none rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 pr-10 text-sm text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
      >
        <option
          v-for="opt in SORT_OPTIONS"
          :key="`${opt.field}:${opt.order}`"
          :value="`${opt.field}:${opt.order}`"
        >
          {{ t[opt.labelKey as keyof TranslationSchema] }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>

    <!-- Toggle Filters -->
    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="props.filters.hideEmpty"
        @change="handleHideEmptyChange"
        class="h-4 w-4 rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
      />
      <span class="text-sm text-gray-400">{{ t.hideEmpty }}</span>
    </label>

    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="props.filters.hideFull"
        @change="handleHideFullChange"
        class="h-4 w-4 rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
      />
      <span class="text-sm text-gray-400">{{ t.hideFull }}</span>
    </label>

    <!-- Refresh -->
    <button
      @click="emit('refresh')"
      class="ml-auto flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-primary-500 hover:text-white"
      :title="t.refresh"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span class="hidden sm:inline">{{ t.refresh }}</span>
    </button>
  </div>
</template>
