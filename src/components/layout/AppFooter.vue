<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from '@/i18n'

const { t, tt } = useI18n()

const copyrightYear = computed(() => {
    return new Date().getFullYear()
})

const copyrightOwner = computed(() => {
    const host = window.location.hostname

    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
        return host
    }

    const parts = host.split('.')
    if (parts.length < 2) return host

    const name = parts[parts.length - 2]
    const tld  = parts[parts.length - 1]

    const titleName = name
        .split(/[-_]/)
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')

    if (tld === 'dev') {
        return `${titleName} ${tld.charAt(0).toUpperCase() + tld.slice(1)}`
    }

    return titleName
})
</script>

<template>
  <footer class="border-t border-surface-800 bg-surface-950 mt-auto">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        <!-- About -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-3">{{ t.siteTitle }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed">
            {{ t.footerAbout }}
          </p>
        </div>

        <!-- Links -->
        <div>
          <h3 class="text-sm font-semibold text-white mb-3">{{ t.relatedLinks }}</h3>
          <ul class="space-y-2 text-sm">
            <li>
              <a href="https://fivem.net" target="_blank" rel="noopener noreferrer"
                 class="text-gray-500 hover:text-primary-400 transition-colors">
                {{ t.fivemOfficial }}
              </a>
            </li>
            <li>
              <a href="https://redm.net" target="_blank" rel="noopener noreferrer"
                 class="text-gray-500 hover:text-primary-400 transition-colors">
                {{ t.redmOfficial }}
              </a>
            </li>
            <li>
              <a href="https://forum.cfx.re" target="_blank" rel="noopener noreferrer"
                 class="text-gray-500 hover:text-primary-400 transition-colors">
                {{ t.cfxForum }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Ad Slot: Footer -->
        <div>
          <!-- <div class="rounded-lg border border-dashed border-surface-700 bg-surface-900/50 p-4 text-center">
            <p class="text-xs text-gray-600">{{ t.adSpace }}</p>
            <slot name="footer-ad"></slot>
          </div> -->
          <div class="rounded-lg border border-dashed border-surface-700 bg-surface-900/50 text-center">
            <a href="https://beta.publishers.adsterra.com/referral/cYffQLq5Qy" target="_blank" rel="noopener noreferrer nofollow sponsored">
              <img alt="banner" src="https://landings-cdn.adsterratech.com/referralBanners/gif/720x90_adsterra_reff.gif" class="rounded-lg" />
              <slot name="footer-ad"></slot>
            </a>
          </div>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-surface-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-gray-600">
          &copy;{{ tt('copyright', { year: copyrightYear, owner: copyrightOwner }) }}
        </p>
        <p class="text-xs text-gray-600">
          {{ t.disclaimer }}
        </p>
      </div>
    </div>
  </footer>
</template>
