<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { AdSlot } from '@/types'
import { adBlockDetected } from '@/composables/useAdBlock'
import { ADSENSE } from '@/constants'

const props = defineProps<{
  adSlot: AdSlot
}>()

const adContainer = ref<HTMLDivElement | null>(null)

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

/**
 * Map ad slot to the corresponding Google AdSense ad-slot ID.
 * Update ADSENSE.SLOTS in constants/index.ts with your actual AdSense ad unit IDs.
 */
const adSlotId = computed(() => {
  switch (props.adSlot.size) {
    case 'leaderboard':
      return ADSENSE.SLOTS.LEADERBOARD
    case 'rectangle':
      return ADSENSE.SLOTS.RECTANGLE
    case 'banner':
      return ADSENSE.SLOTS.BANNER
    case 'skyscraper':
      return ADSENSE.SLOTS.SKYSCRAPER
    default:
      return ADSENSE.SLOTS.LEADERBOARD
  }
})

/**
 * Determine the ad format based on the slot size.
 * - 'auto' for responsive ads (leaderboard, banner, skyscraper)
 * - 'rectangle' uses fixed 300x250
 */
const adFormat = computed(() => {
  if (props.adSlot.size === 'rectangle') return ''
  return 'auto'
})

const isResponsive = computed(() => props.adSlot.size !== 'rectangle')

/**
 * Push ad request to Google AdSense after the <ins> element is rendered.
 */
const initAdSense = async () => {
  await nextTick()
  if (!adContainer.value) return

  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    // AdSense may throw if the ad slot is invalid or already filled
  }
}

onMounted(() => {
  initAdSense()
})
</script>

<template>
  <div
    v-if="adSlot.enabled && !adBlockDetected"
    :class="[
      'rounded-lg border border-dashed border-surface-700 bg-surface-900/50 overflow-hidden',
      {
        'h-[90px]': adSlot.size === 'banner' && adSlot.position !== 'footer',
        'h-[90px] w-full mb-6': adSlot.size === 'leaderboard' && adSlot.id === 'header-banner',
        'h-[90px] w-full': adSlot.size === 'leaderboard',
        'h-[250px] w-[300px]': adSlot.size === 'rectangle',
        'h-[600px] w-[160px]': adSlot.size === 'skyscraper',
      }
    ]"
  >
    <!-- Google AdSense Ad Container -->
    <div ref="adContainer" :class="adSlot.position === 'footer' ? '' : 'flex items-center justify-center h-full'">
      <ins
        class="adsbygoogle"
        :style="isResponsive ? 'display:block' : 'display:inline-block;width:300px;height:250px'"
        :data-ad-client="ADSENSE.CLIENT_ID"
        :data-ad-slot="adSlotId"
        :data-ad-format="adFormat || undefined"
        :data-full-width-responsive="isResponsive ? 'true' : undefined"
      />
    </div>
  </div>
</template>
