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
 * Map ad slot to the corresponding Google AdSense ad-unit ID by position.
 * Each position uses its own ad unit for accurate reporting in AdSense.
 */
const adSlotId = computed(() => {
  switch (props.adSlot.position) {
    case 'header':
      return ADSENSE.SLOTS.HEADER
    case 'inline':
      return ADSENSE.SLOTS.INLINE
    case 'sidebar':
      return ADSENSE.SLOTS.SIDEBAR
    case 'footer':
      return ADSENSE.SLOTS.FOOTER
    default:
      return ADSENSE.SLOTS.HEADER
  }
})

/**
 * Determine the ad format per slot.
 * - rectangle: fixed 300×250 (no format attr needed)
 * - footer banner: 'horizontal' — prefer horizontal creatives
 * - others (leaderboard etc.): 'auto' — responsive
 */
const adFormat = computed(() => {
  if (props.adSlot.size === 'rectangle') return ''
  if (props.adSlot.position === 'footer') return 'horizontal'
  return 'auto'
})

/** Rectangle uses fixed dimensions; all other slots are responsive */
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
        'h-[90px] w-full mb-6': adSlot.size === 'leaderboard' && adSlot.id === 'header-banner',
        'h-[90px] w-full': adSlot.size === 'leaderboard' && adSlot.id !== 'header-banner',
        'h-[250px] w-[300px]': adSlot.size === 'rectangle',
        'min-h-[90px] w-full': adSlot.position === 'footer',
        'h-[600px] w-[160px]': adSlot.size === 'skyscraper',
      }
    ]"
  >
    <!-- Google AdSense Ad Container -->
    <div ref="adContainer" class="flex items-center justify-center h-full">
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
