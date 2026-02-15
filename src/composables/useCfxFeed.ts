import { ref, onMounted } from 'vue'
import { API, CACHE_DURATION } from '@/constants'
import type { CfxTweet } from '@/types'

const tweets = ref<CfxTweet[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
let lastFetch = 0

async function fetchTweets(limit = 5): Promise<void> {
    // Skip if cached
    if (tweets.value.length > 0 && Date.now() - lastFetch < CACHE_DURATION) return

    loading.value = true
    error.value = null

    try {
        const res = await fetch(API.TWEETS)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data: CfxTweet[] = await res.json()
        tweets.value = data.slice(0, limit)
        lastFetch = Date.now()
    } catch (e) {
        error.value = e instanceof Error ? e.message : 'Unknown error'
    } finally {
        loading.value = false
    }
}


/**
 * Strip t.co URLs from tweet text (they appear at the end for media)
 * and replace inline t.co URLs with their display_url
 */
export function cleanTweetText(tweet: CfxTweet): string {
    let text = tweet.full_text

    // Remove trailing media URLs
    if (tweet.extended_entities?.media) {
        for (const m of tweet.extended_entities.media) {
            text = text.replace(m.url, '')
        }
    }

    // Replace t.co URLs with display_url
    if (tweet.extended_entities?.urls) {
        for (const u of tweet.extended_entities.urls) {
            text = text.replace(u.url, u.display_url)
        }
    }

    return text.trim()
}

export function useCfxFeed() {
    onMounted(() => fetchTweets())

    return {
        tweets,
        loading,
        error,
        fetchTweets,
    }
}
