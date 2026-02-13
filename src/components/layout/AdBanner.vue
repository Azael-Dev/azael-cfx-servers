<script setup lang="ts">
import type { AdSlot } from '@/types'

defineProps<{
  adSlot: AdSlot
}>()
</script>

<template>
  <div
    v-if="adSlot.enabled"
    :class="[
      'rounded-lg border border-dashed border-surface-700 bg-surface-900/50 overflow-hidden',
      {
        'h-[90px]': adSlot.size === 'banner',
        'h-[90px] w-full': adSlot.size === 'leaderboard',
        'h-[250px] w-[300px]': adSlot.size === 'rectangle',
        'h-[600px] w-[160px]': adSlot.size === 'skyscraper',
      }
    ]"
  >
    <!-- Replace this with actual ad code (Google AdSense, etc.) -->
    <div class="flex items-center justify-center h-full text-gray-600">
      <div class="text-center">
        <p class="text-xs">{{ adSlot.position.toUpperCase() }} AD</p>
        <p class="text-[10px] mt-1 text-gray-700">{{ adSlot.size }} ({{ adSlot.id }})</p>
      </div>
    </div>
  </div>
</template>
