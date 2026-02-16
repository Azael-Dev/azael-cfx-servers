<script setup lang="ts">
import { ref, onBeforeUnmount } from 'vue'

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
let timer: ReturnType<typeof setTimeout> | null = null

function show() {
  if (!props.text) return
  timer = setTimeout(() => { visible.value = true }, props.delay)
}

function hide() {
  if (timer) { clearTimeout(timer); timer = null }
  visible.value = false
}

onBeforeUnmount(() => {
  if (timer) { clearTimeout(timer); timer = null }
})

const positionClasses: Record<string, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
  left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  right: 'left-full top-1/2 -translate-y-1/2 ml-2',
}

const arrowClasses: Record<string, string> = {
  top: 'top-full left-1/2 -translate-x-1/2 border-t-surface-700 border-x-transparent border-b-transparent',
  bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-surface-700 border-x-transparent border-t-transparent',
  left: 'left-full top-1/2 -translate-y-1/2 border-l-surface-700 border-y-transparent border-r-transparent',
  right: 'right-full top-1/2 -translate-y-1/2 border-r-surface-700 border-y-transparent border-l-transparent',
}
</script>

<template>
  <div class="relative inline-flex" @mouseenter="show" @mouseleave="hide">
    <slot />
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible && text"
        class="absolute z-[100] pointer-events-none whitespace-nowrap rounded-lg border border-surface-700 bg-surface-800 px-2.5 py-1.5 text-xs font-medium text-gray-200 shadow-xl shadow-black/30"
        :class="positionClasses[position]"
      >
        {{ text }}
        <!-- Arrow -->
        <span
          class="absolute border-4"
          :class="arrowClasses[position]"
        />
      </div>
    </Transition>
  </div>
</template>
