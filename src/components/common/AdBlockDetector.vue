<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/i18n'
import { adBlockDetected as globalAdBlockDetected } from '@/composables/useAdBlock'

const { t } = useI18n()

const dismissed = ref(false)

/**
 * Detect ad blockers by creating a bait element that mimics an ad.
 * Ad blockers typically hide/remove elements with ad-related class names.
 */
async function detectAdBlock(): Promise<boolean> {
    // Method 1: Bait element with ad-related class names & attributes
    // Ad blockers typically hide/remove elements matching ad filter lists
    const bait = document.createElement('div')
    bait.className = 'ad ads adsbox ad-banner textads banner-ads'
    bait.setAttribute('data-ad-slot', 'test')
    bait.style.cssText =
        'position:absolute;top:-1000px;left:-1000px;width:300px;height:250px;'
    bait.innerHTML = '&nbsp;'
    document.body.appendChild(bait)

    // Wait for ad blocker to act (some need multiple frames)
    await new Promise((r) => requestAnimationFrame(r))
    await new Promise((r) => setTimeout(r, 150))

    const isRemoved = !bait.parentNode
    const baitBlocked = isRemoved ||
        bait.offsetHeight === 0 ||
        bait.offsetWidth === 0 ||
        bait.clientHeight === 0 ||
        getComputedStyle(bait).display === 'none' ||
        getComputedStyle(bait).visibility === 'hidden'

    if (!isRemoved) bait.remove()

    if (baitBlocked) return true

    // Method 2: Try loading a script from a known ad domain
    // Ad blockers block network requests to ad domains
    try {
        await fetch(
            'https://www.highperformanceformat.com/b8125a056372ff94d6b97e54f84d4f62/invoke.js',
            {
                method: 'HEAD',
                mode: 'no-cors',
                cache: 'no-store',
            },
        )
        // no-cors fetch: opaque response (status 0, type "opaque") means it succeeded
        // If we reach here without throwing, no ad blocker is blocking network requests
        return false
    } catch {
        // fetch threw → blocked by ad blocker
        return true
    }
}

function dismiss() {
    dismissed.value = true
    try {
        sessionStorage.setItem('adblock-dismissed', '1')
    } catch {
        // ignore
    }
}

onMounted(async () => {
    // Always run detection first
    globalAdBlockDetected.value = await detectAdBlock()

    // Check if already dismissed this session (only hide modal, keep ads hidden)
    try {
        if (sessionStorage.getItem('adblock-dismissed') === '1') {
            dismissed.value = true
        }
    } catch {
        // ignore
    }
})
</script>

<template>
    <!-- Ad Block Warning Modal -->
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-300 ease-out" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200 ease-in"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="globalAdBlockDetected && !dismissed"
                class="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                <!-- Backdrop -->
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" />

                <!-- Modal -->
                <Transition appear enter-active-class="transition-all duration-300 ease-out delay-100"
                    enter-from-class="opacity-0 scale-95 translate-y-4"
                    enter-to-class="opacity-100 scale-100 translate-y-0">
                    <div
                        class="relative w-full max-w-md rounded-2xl border border-surface-700 bg-surface-900 shadow-2xl overflow-hidden">
                        <!-- Top accent bar -->
                        <div class="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500" />

                        <div class="px-6 pt-6 pb-8">
                            <!-- Icon -->
                            <div
                                class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 ring-1 ring-amber-500/20">
                                <svg class="h-7 w-7 text-amber-400" fill="none" stroke="currentColor" stroke-width="1.5"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                </svg>
                            </div>

                            <!-- Title -->
                            <h2 class="text-center text-lg font-semibold text-white">
                                {{ t.adBlockTitle }}
                            </h2>

                            <!-- Message -->
                            <p class="mt-3 text-center text-sm leading-relaxed text-gray-400">
                                {{ t.adBlockMessage }}
                            </p>

                            <!-- Button -->
                            <button @click="dismiss"
                                class="mt-6 w-full rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-400 active:bg-amber-600 transition-colors cursor-pointer">
                                {{ t.adBlockDismiss }}
                            </button>
                        </div>
                    </div>
                </Transition>
            </div>
        </Transition>
    </Teleport>
</template>
