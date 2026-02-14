<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { AdSlot } from '@/types'

const props = defineProps<{
  adSlot: AdSlot
}>()

const adContainer = ref<HTMLDivElement | null>(null)

// Unique instance ID to prevent browser script caching
const instanceId = Date.now() + Math.random().toString(36).substring(2, 9)

// Function to load Adsterra script
const loadAdsterraScript = async () => {
  await nextTick()
  
  if (!adContainer.value) return

  // Clear previous content
  adContainer.value.innerHTML = ''

  // Leaderboard ads (728x90) for header-banner and inline-server-list
  if (props.adSlot.size === 'leaderboard' && 
      (props.adSlot.id === 'header-banner' || props.adSlot.id === 'inline-server-list')) {
    
    // Set atOptions globally before loading the script
    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    configScript.textContent = `
      atOptions = {
        'key' : 'b8125a056372ff94d6b97e54f84d4f62',
        'format' : 'iframe',
        'height' : 90,
        'width' : 728,
        'params' : {}
      };
    `
    adContainer.value.appendChild(configScript)

    // Load the invoke script with unique query param to prevent caching
    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.src = `https://www.highperformanceformat.com/b8125a056372ff94d6b97e54f84d4f62/invoke.js?t=${instanceId}`
    adContainer.value.appendChild(invokeScript)
  }
  // Rectangle ads (300x250) for sidebar
  else if (props.adSlot.size === 'rectangle' && props.adSlot.id === 'sidebar-rect') {
    
    // Set atOptions globally before loading the script
    const configScript = document.createElement('script')
    configScript.type = 'text/javascript'
    configScript.textContent = `
      atOptions = {
        'key' : '9a262d58d722a366f3ae4b3b4ae408d4',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `
    adContainer.value.appendChild(configScript)

    // Load the invoke script with unique query param to prevent caching
    const invokeScript = document.createElement('script')
    invokeScript.type = 'text/javascript'
    invokeScript.src = `https://www.highperformanceformat.com/9a262d58d722a366f3ae4b3b4ae408d4/invoke.js?t=${instanceId}`
    adContainer.value.appendChild(invokeScript)
  }
}

onMounted(() => {
  loadAdsterraScript()
})
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
    <!-- Adsterra Ad Container -->
    <div ref="adContainer" class="flex items-center justify-center h-full"></div>

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
