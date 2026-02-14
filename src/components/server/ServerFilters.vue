<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { FilterState, SortField, SortOrder } from '@/types'
import type { TranslationSchema } from '@/i18n/types'
import { LOCALE_OPTIONS, SORT_OPTIONS } from '@/constants'
import { useI18n } from '@/i18n'
import { getFlagUrl } from '@/utils/helpers'

const { t } = useI18n()

/** Get translated sort label */
function getSortLabel(labelKey: string): string {
  return t.value[labelKey as keyof TranslationSchema] || labelKey
}

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

/** Sort dropdown open state */
const sortOpen = ref(false)
const sortDropdownRef = ref<HTMLElement | null>(null)

/** Currently selected sort option */
const selectedSort = computed(() => {
  const key = `${props.filters.sortBy}:${props.filters.sortOrder}`
  return SORT_OPTIONS.find(opt => `${opt.field}:${opt.order}` === key) || SORT_OPTIONS[0]!
})

function selectSort(field: SortField, order: SortOrder) {
  emit('update:sort', field, order)
  sortOpen.value = false
}

function toggleSortDropdown() {
  sortOpen.value = !sortOpen.value
}

/** Close dropdown when clicking outside */
function handleClickOutside(event: MouseEvent) {
  if (localeDropdownRef.value && !localeDropdownRef.value.contains(event.target as Node)) {
    localeOpen.value = false
  }
  if (sortDropdownRef.value && !sortDropdownRef.value.contains(event.target as Node)) {
    sortOpen.value = false
  }
}

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
          class="h-3 w-5 rounded-sm object-cover"
        />
        <svg v-else class="h-3 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
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
              class="h-3 w-5 rounded-sm object-cover"
            />
            <svg v-else class="h-3 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{{ opt.label }}</span>
          </li>
        </ul>
      </Transition>
    </div>

    <!-- Sort (custom dropdown) -->
    <div ref="sortDropdownRef" class="relative">
      <button
        type="button"
        @click="toggleSortDropdown"
        class="flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-sm text-white transition-colors hover:border-surface-600 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
      >
        <svg class="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
        </svg>
        <span>{{ getSortLabel(selectedSort.labelKey) }}</span>
        <svg class="h-4 w-4 text-gray-500 transition-transform" :class="{ 'rotate-180': sortOpen }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          v-if="sortOpen"
          class="absolute left-0 z-50 mt-1 w-56 overflow-auto rounded-lg border border-surface-700 bg-surface-900 py-1 shadow-xl shadow-black/30"
        >
          <li
            v-for="opt in SORT_OPTIONS"
            :key="`${opt.field}:${opt.order}`"
            @click="selectSort(opt.field, opt.order)"
            :class="[
              'flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors hover:bg-surface-800',
              opt.field === props.filters.sortBy && opt.order === props.filters.sortOrder
                ? 'bg-primary-600/15 text-primary-400'
                : 'text-gray-300',
            ]"
          >
            <svg class="h-4 w-4 flex-shrink-0" :class="opt.order === 'desc' ? 'text-orange-400' : 'text-blue-400'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="opt.order === 'desc'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
            <span>{{ getSortLabel(opt.labelKey) }}</span>
          </li>
        </ul>
      </Transition>
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
