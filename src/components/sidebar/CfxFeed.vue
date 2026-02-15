<script setup lang="ts">
import { useCfxFeed, cleanTweetText } from '@/composables/useCfxFeed'
import { formatRelativeTime } from '@/utils/helpers'
import { useI18n } from '@/i18n'

const { t, currentLocale } = useI18n()
const { tweets, loading, error } = useCfxFeed()

function getTweetUrl(screenName: string, idStr: string): string {
    return `https://x.com/${screenName}/status/${idStr}`
}
</script>

<template>
    <div class="rounded-xl border border-surface-800 bg-surface-900/60 p-5">
        <!-- Header -->
        <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
                <svg class="h-4 w-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path
                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <h3 class="text-sm font-semibold text-white">{{ t.cfxFeed }}</h3>
            </div>
            <a href="https://x.com/FiveM" target="_blank" rel="noopener noreferrer"
                class="text-xs text-gray-500 hover:text-primary-400 transition-colors">
                @FiveM
            </a>
        </div>

        <!-- Loading skeleton -->
        <div v-if="loading" class="space-y-3">
            <div v-for="i in 3" :key="i" class="space-y-2">
                <div class="h-3 w-3/4 rounded bg-surface-800 relative overflow-hidden">
                    <div
                        class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-surface-600/40 to-transparent">
                    </div>
                </div>
                <div class="h-3 w-1/2 rounded bg-surface-800 relative overflow-hidden">
                    <div
                        class="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-surface-600/40 to-transparent">
                    </div>
                </div>
                <div v-if="i < 3" class="border-t border-surface-800 mt-3"></div>
            </div>
        </div>

        <!-- Error -->
        <p v-else-if="error" class="text-xs text-red-400">{{ t.cfxFeedError }}</p>

        <!-- Empty -->
        <p v-else-if="tweets.length === 0" class="text-xs text-gray-500">{{ t.cfxFeedEmpty }}</p>

        <!-- Tweets -->
        <div v-else class="space-y-0 divide-y divide-surface-800">
            <a v-for="tweet in tweets" :key="tweet.id_str" :href="getTweetUrl(tweet.user.screen_name, tweet.id_str)"
                target="_blank" rel="noopener noreferrer"
                class="block py-3 first:pt-0 last:pb-0 group transition-colors">
                <!-- User row -->
                <div class="flex items-center gap-2 mb-1.5">
                    <img :src="tweet.user.profile_image_url_https" :alt="tweet.user.name" class="h-5 w-5 rounded-full"
                        loading="lazy" />
                    <span class="text-xs font-medium text-gray-300 truncate">{{ tweet.user.name }}</span>
                    <span class="text-xs text-gray-600">·</span>
                    <span class="text-xs text-gray-500 flex-shrink-0">{{ formatRelativeTime(tweet.created_at, currentLocale) }}</span>
                </div>

                <!-- Content -->
                <p
                    class="text-xs text-gray-400 leading-relaxed line-clamp-3 group-hover:text-gray-300 transition-colors">
                    {{ cleanTweetText(tweet) }}
                </p>

                <!-- Media -->
                <div v-if="tweet.extended_entities?.media?.[0]?.media_url_https" class="mt-2">
                    <img :src="tweet.extended_entities.media[0].media_url_https" :alt="tweet.user.name" class="w-full rounded-lg" />
                </div>

                <!-- Engagement -->
                <div class="flex items-center gap-3 mt-2">
                    <!-- Likes -->
                    <span class="flex items-center gap-1 text-xs text-gray-600">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                        </svg>
                        {{ tweet.favorite_count }}
                    </span>
                    <!-- Retweets -->
                    <span class="flex items-center gap-1 text-xs text-gray-600">
                        <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                            <path stroke-linecap="round" stroke-linejoin="round"
                                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                        </svg>
                        {{ tweet.retweet_count }}
                    </span>
                </div>
            </a>
        </div>
    </div>
</template>
