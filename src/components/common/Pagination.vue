<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  'update:currentPage': [value: number]
}>()

const visiblePages = computed(() => {
  const pages: (number | '...')[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
    return pages
  }

  pages.push(1)

  if (current > 3) {
    pages.push('...')
  }

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) {
    pages.push('...')
  }

  pages.push(total)

  return pages
})

function goTo(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('update:currentPage', page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}
</script>

<template>
  <div v-if="totalPages > 1" class="flex items-center justify-center gap-1.5 pt-6">
    <!-- Previous -->
    <button
      @click="goTo(currentPage - 1)"
      :disabled="currentPage === 1"
      class="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-700 bg-surface-900 text-gray-400 transition-colors hover:border-primary-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <!-- Page numbers -->
    <template v-for="(page, index) in visiblePages" :key="index">
      <span v-if="page === '...'" class="px-2 text-sm text-gray-600">...</span>
      <button
        v-else
        @click="goTo(page)"
        :class="[
          'flex h-9 min-w-[36px] items-center justify-center rounded-lg text-sm font-medium transition-all duration-200',
          page === currentPage
            ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/25'
            : 'border border-surface-700 bg-surface-900 text-gray-400 hover:border-primary-500 hover:text-white'
        ]"
      >
        {{ page }}
      </button>
    </template>

    <!-- Next -->
    <button
      @click="goTo(currentPage + 1)"
      :disabled="currentPage === totalPages"
      class="flex h-9 w-9 items-center justify-center rounded-lg border border-surface-700 bg-surface-900 text-gray-400 transition-colors hover:border-primary-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  </div>
</template>
