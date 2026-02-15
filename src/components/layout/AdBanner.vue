<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { AdSlot } from '@/types'
import { adBlockDetected } from '@/composables/useAdBlock'

const props = defineProps<{
  adSlot: AdSlot
}>()

const adContainer = ref<HTMLDivElement | null>(null)

// Global queue to serialize ad loading (prevent atOptions race condition)
declare global {
  interface Window {
    __adQueue?: Promise<void>
  }
}

/**
 * Load a single Adsterra ad: set atOptions, then load invoke.js and wait for it.
 * Returns a promise that resolves when invoke.js has executed.
 */
const loadAd = (container: HTMLElement, key: string, width: number, height: number): Promise<void> => {
  return new Promise((resolve) => {
    // Set atOptions globally (Adsterra reads this)
    ;(window as any).atOptions = {
      key,
      format: 'iframe',
      height,
      width,
      params: {},
    }

    // Load invoke.js
    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.src = `https://www.highperformanceformat.com/${key}/invoke.js`

    invokeScript.onload = () => {
      // Small delay to let Adsterra finish rendering the iframe
      setTimeout(resolve, 200)
    }
    invokeScript.onerror = () => resolve()

    container.appendChild(invokeScript)
  })
}

const loadAdsterraScript = async () => {
  await nextTick()
  if (!adContainer.value) return

  // Clear previous content
  adContainer.value.innerHTML = ''

  let key = ''
  let width = 0
  let height = 0

  // Footer banner (static image link)
  if (props.adSlot.position === 'footer' && props.adSlot.id === 'footer-banner') {
    const link = document.createElement('a')
    link.href = 'https://beta.publishers.adsterra.com/referral/cYffQLq5Qy'
    link.target = '_blank'
    link.rel = 'nofollow noopener noreferrer'

    const img = document.createElement('img')
    img.alt = 'banner'
    img.src = 'https://landings-cdn.adsterratech.com/referralBanners/gif/720x90_adsterra_reff.gif'
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'

    link.appendChild(img)
    adContainer.value.appendChild(link)
    return
  }

  // Leaderboard ads (728x90) for header-banner and inline-server-list
  if (
    props.adSlot.size === 'leaderboard' &&
    (props.adSlot.id === 'header-banner' || props.adSlot.id === 'inline-server-list')
  ) {
    key = 'b8125a056372ff94d6b97e54f84d4f62'
    width = 728
    height = 90
  }
  // Rectangle ads (300x250) for sidebar
  else if (props.adSlot.size === 'rectangle' && props.adSlot.id === 'sidebar-rect') {
    key = '9a262d58d722a366f3ae4b3b4ae408d4'
    width = 300
    height = 250
  }

  if (!key) return

  const container = adContainer.value

  // Chain onto the global queue so ads load one at a time
  const prev = window.__adQueue ?? Promise.resolve()
  window.__adQueue = prev.then(() => loadAd(container, key, width, height))
}

onMounted(() => {
  loadAdsterraScript()
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
    <!-- Adsterra Ad Container -->
    <div ref="adContainer" :class="adSlot.position === 'footer' ? '' : 'flex items-center justify-center h-full'"></div>

    <!-- OLD CODE - Placeholder (commented out)
    <div class="flex items-center justify-center h-full text-gray-600">
      <div class="text-center">
        <p class="text-xs">{{ adSlot.position.toUpperCase() }} AD</p>
        <p class="text-[10px] mt-1 text-gray-700">{{ adSlot.size }} ({{ adSlot.id }})</p>
      </div>
    </div>
    -->
  </div>
</template>
