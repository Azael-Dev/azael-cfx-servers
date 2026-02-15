<template>
  <div class="space-y-3">
    <!-- Skeleton cards -->
    <div
      v-for="i in 10"
      :key="i"
      class="rounded-xl border border-surface-800 bg-surface-900/60 px-4 py-3"
    >
      <div class="flex items-center gap-3">
        <!-- Icon skeleton -->
        <div class="h-10 w-10 flex-shrink-0 rounded-lg bg-surface-800 animate-pulse"></div>

        <!-- Server info skeleton -->
        <div class="min-w-0 flex-1 space-y-1">
          <div class="h-4 rounded bg-surface-800 animate-pulse" :style="{ width: `${50 + (i % 3) * 15}%` }"></div>
          <div class="h-3 rounded bg-surface-800/60 animate-pulse" :style="{ width: `${30 + (i % 4) * 10}%`, maxWidth: '260px' }"></div>
        </div>

        <!-- Tags skeleton (hidden on small screens) -->
        <div class="hidden md:flex flex-shrink-0 items-center gap-1.5">
          <div class="h-5 w-16 rounded-md bg-surface-800 animate-pulse"></div>
          <div class="h-5 w-16 rounded-md bg-surface-800 animate-pulse"></div>
          <div class="h-5 w-8 rounded-md bg-surface-800 animate-pulse"></div>
          <div class="h-4 w-5 rounded-xs bg-surface-800 animate-pulse"></div>
        </div>

        <!-- Player count skeleton -->
        <div class="flex-shrink-0 text-right space-y-1">
          <div class="flex items-center gap-1 justify-end">
            <div class="h-4 w-4 rounded bg-surface-800 animate-pulse"></div>
            <div class="h-4 w-10 rounded bg-surface-800 animate-pulse"></div>
            <div class="h-3 w-6 rounded bg-surface-800/60 animate-pulse"></div>
          </div>
          <div class="h-1 w-full rounded-full bg-surface-800 animate-pulse"></div>
        </div>

        <!-- Connect button skeleton (hidden on small screens) -->
        <div class="hidden md:flex flex-shrink-0">
          <div class="h-[30px] w-[72px] rounded-lg bg-surface-800 animate-pulse"></div>
        </div>
      </div>
    </div>
  </div>
</template>
