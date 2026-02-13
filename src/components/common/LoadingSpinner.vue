<script setup lang="ts">
defineProps<{
  progress?: number
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-24">
    <!-- Spinner -->
    <div class="relative">
      <div class="h-16 w-16 rounded-full border-4 border-surface-800"></div>
      <div class="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-primary-500"></div>
    </div>

    <p class="mt-6 text-sm font-medium text-gray-400">กำลังโหลดเซิร์ฟเวอร์...</p>

    <div v-if="progress && progress > 0" class="mt-3 text-center">
      <p class="text-xs text-gray-600">โหลดแล้ว {{ progress.toLocaleString() }} เซิร์ฟเวอร์</p>
      <div class="mt-2 h-1 w-48 overflow-hidden rounded-full bg-surface-800">
        <div
          class="h-full rounded-full bg-primary-500 transition-all duration-300"
          :style="{ width: `${Math.min(100, (progress / 8000) * 100)}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>
