<script setup lang="ts">
import type { FilterState, SortField, SortOrder } from '@/types'
import { LOCALE_OPTIONS, SORT_OPTIONS } from '@/constants'

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

function handleLocaleChange(event: Event) {
  emit('update:locale', (event.target as HTMLSelectElement).value)
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
    <!-- Locale Filter -->
    <div class="relative">
      <select
        :value="props.filters.locale"
        @change="handleLocaleChange"
        class="appearance-none rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 pr-10 text-sm text-white transition-colors focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 cursor-pointer"
      >
        <option
          v-for="opt in LOCALE_OPTIONS"
          :key="opt.code"
          :value="opt.code"
        >
          {{ opt.flag }} {{ opt.label }}
        </option>
      </select>
      <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg class="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
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
          {{ opt.label }}
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
      <span class="text-sm text-gray-400">ซ่อนว่าง</span>
    </label>

    <label class="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        :checked="props.filters.hideFull"
        @change="handleHideFullChange"
        class="h-4 w-4 rounded border-surface-700 bg-surface-900 text-primary-500 focus:ring-primary-500/20 cursor-pointer"
      />
      <span class="text-sm text-gray-400">ซ่อนเต็ม</span>
    </label>

    <!-- Refresh -->
    <button
      @click="emit('refresh')"
      class="ml-auto flex items-center gap-2 rounded-lg border border-surface-700 bg-surface-900 px-4 py-2 text-sm text-gray-400 transition-colors hover:border-primary-500 hover:text-white"
      title="รีเฟรช"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      <span class="hidden sm:inline">รีเฟรช</span>
    </button>
  </div>
</template>
