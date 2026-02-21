<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { AdSlot } from '@/types'
import { adBlockDetected } from '@/composables/useAdBlock'
import { ADSENSE } from '@/constants'
import { useI18n } from '@/i18n'

const { t, tt } = useI18n()

const props = defineProps<{
  adSlot: AdSlot
}>()

const adContainer = ref<HTMLDivElement | null>(null)
const adLoaded = ref(false)

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

/** Localized label for the ad position */
const positionLabel = computed(() => {
  switch (props.adSlot.position) {
    case 'header':  return t.value.adLabelHeader
    case 'inline':  return t.value.adLabelInline
    case 'sidebar': return t.value.adLabelSidebar
    case 'footer':  return t.value.adLabelFooter
    default:        return t.value.adLabelHeader
  }
})

/** Human-readable size string (e.g. "728 × 90") */
const sizeLabel = computed(() => {
  switch (props.adSlot.size) {
    case 'leaderboard': return tt('adSizeInfo', { width: 728, height: 90 })
    case 'rectangle':   return tt('adSizeInfo', { width: 300, height: 250 })
    case 'banner':      return tt('adSizeInfo', { width: 'Auto', height: 90 })
    case 'skyscraper':  return tt('adSizeInfo', { width: 160, height: 600 })
    default:            return ''
  }
})

/**
 * Push ad request to Google AdSense after the <ins> element is rendered.
 * Sets adLoaded = true so the placeholder text is hidden once a real ad fills.
 */
const initAdSense = async () => {
  await nextTick()
  if (!adContainer.value) return

  try {
    ;(window.adsbygoogle = window.adsbygoogle || []).push({})
  } catch {
    // AdSense may throw if the ad slot is invalid or already filled
  }

  // Watch for AdSense filling the <ins> element (it gets a child iframe/div)
  const ins = adContainer.value.querySelector('ins.adsbygoogle')
  if (ins) {
    const observer = new MutationObserver(() => {
      if (ins.childElementCount > 0) {
        adLoaded.value = true
        observer.disconnect()
      }
    })
    observer.observe(ins, { childList: true })

    // Fallback: hide placeholder after 5s regardless
    // setTimeout(() => {
    //   adLoaded.value = true
    //   observer.disconnect()
    // }, 5000)
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
      'relative rounded-lg border border-dashed border-surface-700 bg-surface-900/50 overflow-hidden',
      {
        'h-[90px] w-full mb-6': adSlot.size === 'leaderboard' && adSlot.id === 'header-banner',
        'h-[90px] w-full': adSlot.size === 'leaderboard' && adSlot.id !== 'header-banner',
        'h-[250px] w-[300px]': adSlot.size === 'rectangle',
        'min-h-[90px] w-full': adSlot.position === 'footer',
        'h-[600px] w-[160px]': adSlot.size === 'skyscraper',
      }
    ]"
  >
    <!-- Placeholder text (shown until ad loads) -->
    <div
      v-if="!adLoaded"
      class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none z-0"
    >
      <p class="text-base font-medium text-gray-600">{{ positionLabel }}</p>
      <p class="text-sm mt-0.5 text-gray-700">{{ sizeLabel }}</p>
    </div>

    <!-- Google AdSense Ad Container -->
    <div ref="adContainer" class="relative z-10 flex items-center justify-center h-full">
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
