<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const AdBlockDetector = defineAsyncComponent(() => import('@/components/common/AdBlockDetector.vue'))
</script>

<template>
  <AdBlockDetector />
  <router-view />
</template>

