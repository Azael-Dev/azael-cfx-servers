<script setup lang="ts">
import { useI18n } from '@/i18n'

const { t, tt } = useI18n()

defineProps<{
  progress?: number
}>()
</script>

<template>
  <div class="space-y-3">
    <!-- Progress info -->
    <div v-if="progress && progress > 0" class="flex items-center justify-between px-1 mb-2">
      <p class="text-xs text-gray-500">{{ t.loadingServers }}</p>
      <div class="flex items-center gap-3">
        <p class="text-xs text-gray-600">{{ tt('loadedServers', { count: progress.toLocaleString() }) }}</p>
        <div class="h-1 w-32 overflow-hidden rounded-full bg-surface-800">
          <div
            class="h-full rounded-full bg-primary-500 transition-all duration-300"
            :style="{ width: `${Math.min(100, (progress / 8000) * 100)}%` }"
          ></div>
        </div>
      </div>
    </div>
    <p v-else class="text-xs text-gray-500 px-1 mb-2">{{ t.loadingServers }}</p>

    <!-- Skeleton cards -->
    <div
      v-for="i in 8"
      :key="i"
      class="rounded-xl border border-surface-800 bg-surface-900/60 p-4"
    >
      <div class="flex items-start gap-4">
        <!-- Icon skeleton -->
        <div class="h-12 w-12 rounded-lg bg-surface-800 animate-pulse"></div>

        <!-- Content skeleton -->
        <div class="min-w-0 flex-1 space-y-2.5">
          <!-- Title -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 space-y-1.5">
              <div class="h-4 rounded bg-surface-800 animate-pulse" :style="{ width: `${55 + (i % 3) * 15}%` }"></div>
              <div class="h-3 rounded bg-surface-800/60 animate-pulse" :style="{ width: `${35 + (i % 4) * 10}%` }"></div>
            </div>
            <!-- Player count skeleton -->
            <div class="flex-shrink-0 space-y-1.5">
              <div class="h-4 w-16 rounded bg-surface-800 animate-pulse"></div>
              <div class="h-1 w-20 rounded-full bg-surface-800 animate-pulse"></div>
            </div>
          </div>

          <!-- Tags skeleton -->
          <div class="flex items-center gap-2">
            <div class="h-5 w-14 rounded-md bg-surface-800 animate-pulse"></div>
            <div class="h-5 w-20 rounded-md bg-surface-800 animate-pulse"></div>
            <div class="h-5 w-16 rounded-md bg-surface-800 animate-pulse"></div>
          </div>
        </div>

        <!-- Connect button skeleton -->
        <div class="h-8 w-20 rounded-lg bg-surface-800 animate-pulse flex-shrink-0 self-center"></div>
      </div>
    </div>
  </div>
</template>
