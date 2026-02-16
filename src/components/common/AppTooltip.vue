<script setup lang="ts">
import { ref, computed, onBeforeUnmount } from 'vue'

const props = withDefaults(defineProps<{
    text?: string
    position?: 'top' | 'bottom' | 'left' | 'right'
    delay?: number
}>(), {
    text: '',
    position: 'top',
    delay: 400,
})

const visible = ref(false)
const triggerEl = ref<HTMLElement | null>(null)
const tooltipStyle = ref<Record<string, string>>({})
let timer: ReturnType<typeof setTimeout> | null = null

function updatePosition() {
    if (!triggerEl.value) return

    const rect = triggerEl.value.getBoundingClientRect()
    const gap = 8 // spacing between trigger and tooltip

    switch (props.position) {
        case 'top':
            tooltipStyle.value = {
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.top - gap}px`,
                transform: 'translate(-50%, -100%)',
            }
            break
        case 'bottom':
            tooltipStyle.value = {
                left: `${rect.left + rect.width / 2}px`,
                top: `${rect.bottom + gap}px`,
                transform: 'translate(-50%, 0)',
            }
            break
        case 'left':
            tooltipStyle.value = {
                left: `${rect.left - gap}px`,
                top: `${rect.top + rect.height / 2}px`,
                transform: 'translate(-100%, -50%)',
            }
            break
        case 'right':
            tooltipStyle.value = {
                left: `${rect.right + gap}px`,
                top: `${rect.top + rect.height / 2}px`,
                transform: 'translate(0, -50%)',
            }
            break
    }
}

function show() {
    if (!props.text) return
    timer = setTimeout(() => {
        updatePosition()
        visible.value = true
    }, props.delay)
}

function hide() {
    if (timer) { clearTimeout(timer); timer = null }
    visible.value = false
}

onBeforeUnmount(() => {
    if (timer) { clearTimeout(timer); timer = null }
})

const arrowClasses = computed(() => {
    switch (props.position) {
        case 'top':
            return 'left-1/2 -translate-x-1/2 top-full border-t-surface-700 border-x-transparent border-b-transparent'
        case 'bottom':
            return 'left-1/2 -translate-x-1/2 bottom-full border-b-surface-700 border-x-transparent border-t-transparent'
        case 'left':
            return 'top-1/2 -translate-y-1/2 left-full border-l-surface-700 border-y-transparent border-r-transparent'
        case 'right':
            return 'top-1/2 -translate-y-1/2 right-full border-r-surface-700 border-y-transparent border-l-transparent'
        default:
            return ''
    }
})
</script>

<template>
    <div ref="triggerEl" class="relative inline-flex" @mouseenter="show" @mouseleave="hide">
        <slot />
    </div>

    <!-- Tooltip portal (rendered in body via Teleport) -->
    <Teleport to="body">
        <Transition enter-active-class="transition duration-150 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-100 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="visible && text"
                class="fixed z-[9999] pointer-events-none whitespace-nowrap rounded-lg border border-surface-700 bg-surface-800 px-2.5 py-1.5 text-xs font-medium text-gray-200 shadow-xl shadow-black/30"
                :style="tooltipStyle">
                {{ text }}
                <!-- Arrow -->
                <span class="absolute border-4" :class="arrowClasses" />
            </div>
        </Transition>
    </Teleport>
</template>
