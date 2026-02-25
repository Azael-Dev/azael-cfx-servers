<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'
import type { AdSlot } from '@/types'
import { adBlockDetected } from '@/composables/useAdBlock'
import { ADSTERRA } from '@/constants'
import { useI18n } from '@/i18n'

const { t, tt } = useI18n()

const props = defineProps<{
  adSlot: AdSlot
}>()

const adContainer = ref<HTMLDivElement | null>(null)
const adLoaded = ref(false)
const adFailed = ref(false)

/**
 * Load a single Adsterra ad inside a sandboxed iframe to prevent page redirects.
 * Each iframe has its own isolated window, so ads load in parallel safely.
 * The sandbox omits allow-top-navigation so ad scripts cannot redirect the main page.
 */
const loadAd = (container: HTMLElement, key: string, width: number, height: number): Promise<void> => {
  return new Promise((resolve) => {
    if (!container.isConnected) {
      resolve()
      return
    }

    const timeout = setTimeout(() => {
      adFailed.value = true
      resolve()
    }, 10_000)

    const srcdoc = `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>html,body{margin:0;padding:0;overflow:hidden;background:transparent;}</style>
</head>
<body>
<script>var atOptions={key:'${key}',format:'iframe',height:${height},width:${width},params:{}}<\/script>
<script src="${ADSTERRA.INVOKE_BASE}/${key}/invoke.js"><\/script>
</body>
</html>`

    const iframe = document.createElement('iframe')
    // Sandbox: allow scripts, same-origin (for cookies), popups (new tab), but NOT allow-top-navigation → no redirects
    iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox')
    iframe.style.width = `${width}px`
    iframe.style.height = `${height}px`
    iframe.style.maxWidth = '100%'
    iframe.style.border = 'none'
    iframe.style.display = 'block'
    iframe.srcdoc = srcdoc

    const done = () => {
      clearTimeout(timeout)
      adLoaded.value = true
      resolve()
    }

    // Delay to give invoke.js time to fetch and render the ad creative
    iframe.onload = () => setTimeout(done, 1500)
    iframe.onerror = () => {
      clearTimeout(timeout)
      adFailed.value = true
      resolve()
    }

    container.appendChild(iframe)
  })
}

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
    case 'banner':      return tt('adSizeInfo', { width: 720, height: 90 })
    case 'skyscraper':  return tt('adSizeInfo', { width: 160, height: 600 })
    default:            return ''
  }
})

/**
 * Load Adsterra ad into the container.
 * Footer uses a static referral banner; other slots use Adsterra iframe ads.
 * Ads are queued globally to prevent atOptions race conditions.
 */
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
    link.href = ADSTERRA.REFERRAL.URL
    link.target = '_blank'
    link.rel = 'nofollow noopener noreferrer'

    const img = document.createElement('img')
    img.alt = 'banner'
    img.src = ADSTERRA.REFERRAL.BANNER
    img.style.maxWidth = '100%'
    img.style.height = 'auto'
    img.style.display = 'block'

    img.onerror = () => { adFailed.value = true }
    link.appendChild(img)
    adContainer.value.appendChild(link)
    adLoaded.value = true
    return
  }

  // Leaderboard ads (728×90) for header-banner and inline-server-list
  if (
    props.adSlot.size === 'leaderboard' &&
    (props.adSlot.id === 'header-banner' || props.adSlot.id === 'inline-server-list')
  ) {
    key = ADSTERRA.KEYS.LEADERBOARD
    width = 728
    height = 90
  }
  // Rectangle ads (300×250) for sidebar
  else if (props.adSlot.size === 'rectangle' && props.adSlot.id.startsWith('sidebar-rect')) {
    key = ADSTERRA.KEYS.RECTANGLE
    width = 300
    height = 250
  }

  if (!key) return

  // Each ad is in its own sandboxed iframe (isolated window), safe to load in parallel
  loadAd(adContainer.value, key, width, height)
}

onMounted(() => {
  loadAdsterraScript()
})
</script>

<template>
  <div
    v-if="adSlot.enabled && !adBlockDetected && !adFailed"
    :class="[
      'relative rounded-lg border border-dashed border-surface-700 bg-surface-900/50 overflow-hidden',
      {
        'h-[90px] w-full mb-6': adSlot.size === 'leaderboard' && adSlot.id === 'header-banner',
        'h-[90px] w-full': adSlot.size === 'leaderboard' && adSlot.id !== 'header-banner',
        'h-[250px] w-[300px]': adSlot.size === 'rectangle',
        'min-h-[90px] w-full': adSlot.position === 'footer' && !adLoaded,
        'w-full': adSlot.position === 'footer' && adLoaded,
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

    <!-- Adsterra Ad Container -->
    <div ref="adContainer" :class="[
      'relative z-10',
      adSlot.position === 'footer' ? '' : 'flex items-center justify-center h-full'
    ]" />
  </div>
</template>
