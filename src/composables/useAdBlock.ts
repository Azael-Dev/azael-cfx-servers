import { ref } from 'vue'

/**
 * Global reactive state for ad blocker detection.
 * Shared between AdBlockDetector (writes) and AdBanner (reads).
 */
export const adBlockDetected = ref(false)
