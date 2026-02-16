<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { CfxPlayer } from '@/types'
import { fetchSingleServer } from '@/services/api'
import { useI18n } from '@/i18n'
import { formatNumber } from '@/utils/helpers'

const { t } = useI18n()

const props = defineProps<{
    endpoint: string
    gameType: 'fivem' | 'redm'
    serverId: string
}>()

const emit = defineEmits<{
    (e: 'loaded', payload: { loadFailed: boolean; isPrivate: boolean }): void
}>()

const loading = ref(true)
const detailResources = ref<string[]>([])
const detailPlayers = ref<CfxPlayer[]>([])
const detailTags = ref<string[]>([])
const detailVars = ref<Record<string, string>>({})
const serverVersion = ref('')
const ownerName = ref('')
const ownerAvatar = ref('')
const gameBuild = ref('')
const onesync = ref(false)
const scriptHook = ref(false)
const isPrivate = ref(false)
const pureLevel = ref(0)
const ownerProfile = ref('')

/** Expand toggles */
const showAllResources = ref(false)
const showAllPlayers = ref(false)

const RESOURCE_LIMIT = 20
const PLAYER_LIMIT = 20

const visibleResources = computed(() =>
    showAllResources.value ? detailResources.value : detailResources.value.slice(0, RESOURCE_LIMIT)
)

const visiblePlayers = computed(() =>
    showAllPlayers.value ? detailPlayers.value : detailPlayers.value.slice(0, PLAYER_LIMIT)
)

/** Extract short version like "v1.0.0.25770" from "FXServer-master SERVER v1.0.0.25770 win32" */
const shortServerVersion = computed(() => {
    const match = serverVersion.value.match(/v[\d.]+/)
    return match ? match[0] : serverVersion.value
})

const loadFailed = ref(false)

onMounted(async () => {
    try {
        const server = await fetchSingleServer(props.endpoint)
        if (!server) {
            loadFailed.value = true
            emit('loaded', { loadFailed: true, isPrivate: false })
            return
        }

        const data = server.Data
        const vars = data.vars || {}

        detailResources.value = data.resources || []
        detailPlayers.value = data.players || []
        detailTags.value = (vars['tags'] || '').split(',').filter(Boolean)
        detailVars.value = vars
        serverVersion.value = data.server || ''
        ownerName.value = data.ownerName || vars['ownerName'] || ''
        ownerAvatar.value = data.ownerAvatar || vars['ownerAvatar'] || ''
        gameBuild.value = vars['sv_enforceGameBuild'] || ''
        onesync.value = vars['onesync_enabled'] === 'true' || vars['onesync_enabled'] === '1'
        scriptHook.value = vars['sv_scriptHookAllowed'] === 'true' || vars['sv_scriptHookAllowed'] === '1'
        isPrivate.value = data.private || false
        pureLevel.value = parseInt(vars['sv_pureLevel'] || '0', 10) || 0
        ownerProfile.value = data.ownerProfile || vars['ownerProfile'] || ''

        emit('loaded', { loadFailed: false, isPrivate: isPrivate.value })
    } catch {
        loadFailed.value = true
        emit('loaded', { loadFailed: true, isPrivate: false })
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <div class="relative z-10 border-t border-surface-800/60 pt-3 mt-3">
        <!-- Loading -->
        <div v-if="loading" class="flex items-center justify-center gap-2 py-6 text-gray-500">
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span class="text-xs">{{ t.detailLoading }}</span>
        </div>

        <!-- Load Failed -->
        <div v-else-if="loadFailed" class="flex items-center justify-center gap-2 py-6 text-red-400/80">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span class="text-xs">{{ t.detailLoadFailed }}</span>
        </div>

        <!-- Detail Content -->
        <div v-else class="space-y-3">
            <!-- Server Info Grid -->
            <div>
                <h4 class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ t.serverDetail }}
                </h4>
                <div class="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs sm:grid-cols-3 lg:grid-cols-4">
                    <!-- Owner -->
                    <div v-if="ownerName" class="flex items-center gap-1.5">
                        <span class="text-gray-500">{{ t.detailOwner }}:</span>
                        <div class="flex items-center gap-1 min-w-0">
                            <img v-if="ownerAvatar" :src="ownerAvatar" class="h-4 w-4 rounded-full flex-shrink-0"
                                loading="lazy" />
                            <a v-if="ownerProfile" :href="ownerProfile" target="_blank" rel="noopener noreferrer"
                                class="truncate text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                                @click.stop>{{ ownerName }}</a>
                            <span v-else class="truncate text-gray-300">{{ ownerName }}</span>
                        </div>
                    </div>

                    <!-- Endpoint -->
                    <div class="flex items-center gap-1.5">
                        <span class="text-gray-500 flex-shrink-0">{{ t.detailEndpoint }}:</span>
                        <a :href="`https://cfx.re/join/${endpoint}`" target="_blank" rel="noopener noreferrer"
                            class="truncate font-mono text-primary-400 hover:text-primary-300 hover:underline transition-colors"
                            @click.stop>{{ endpoint }}</a>
                    </div>

                    <!-- Server Version -->
                    <div v-if="serverVersion" class="flex items-center gap-1.5">
                        <span class="text-gray-500 flex-shrink-0">{{ t.detailServerVersion }}:</span>
                        <span class="truncate text-gray-300">{{ shortServerVersion }}</span>
                    </div>

                    <!-- Game Build -->
                    <div v-if="gameBuild" class="flex items-center gap-1.5">
                        <span class="text-gray-500 flex-shrink-0">{{ t.detailGameBuild }}:</span>
                        <span class="text-gray-300">{{ gameBuild }}</span>
                    </div>

                    <!-- Feature Labels -->
                    <div class="col-span-full mt-1 flex flex-wrap items-center gap-x-4 gap-y-1.5">
                        <div class="flex items-center gap-1.5">
                            <span class="text-gray-500 text-xs">{{ t.detailPrivate }}:</span>
                            <span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] border"
                                :class="isPrivate ? 'bg-red-900/30 text-red-400 border-red-800/50' : 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50'">{{
                                    isPrivate ? t.detailYes : t.detailNo }}</span>
                        </div>
                        <div class="flex items-center gap-1.5">
                            <span class="text-gray-500 text-xs">{{ t.detailOneSync }}:</span>
                            <span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] border"
                                :class="onesync ? 'bg-emerald-900/30 text-emerald-400 border-emerald-800/50' : 'bg-red-900/30 text-red-400 border-red-800/50'">{{
                                    onesync ? t.detailEnabled : t.detailDisabled }}</span>
                        </div>
                        <div v-if="pureLevel > 0" class="flex items-center gap-1.5">
                            <span class="text-gray-500 text-xs">{{ t.detailPureLevel }}:</span>
                            <span class="inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] border" :class="{
                                'bg-amber-900/30 text-amber-400 border-amber-800/50': pureLevel === 1,
                                'bg-emerald-900/30 text-emerald-400 border-emerald-800/50': pureLevel >= 2,
                            }">
                                Level {{ pureLevel }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tags -->
            <div v-if="detailTags.length > 0">
                <h4 class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {{ t.detailTags }}
                </h4>
                <div class="flex flex-wrap gap-1.5">
                    <span v-for="tag in detailTags" :key="tag"
                        class="inline-flex items-center rounded-md bg-surface-800/80 px-2 py-0.5 text-xs text-gray-400 border border-surface-700/50">
                        {{ tag }}
                    </span>
                </div>
            </div>

            <!-- Players -->
            <div>
                <h4 class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <svg class="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                    </svg>
                    {{ t.detailPlayers }}
                    <span class="text-gray-500 font-normal normal-case tracking-normal">({{
                        formatNumber(detailPlayers.length) }})</span>
                </h4>

                <div v-if="detailPlayers.length === 0" class="text-xs text-gray-600 italic py-1">
                    {{ t.detailNoPlayers }}
                </div>

                <div v-else>
                    <div class="flex flex-wrap gap-1">
                        <span v-for="player in visiblePlayers" :key="player.id"
                            class="inline-flex items-center rounded-md bg-surface-800/60 px-1.5 py-0.5 text-xs text-gray-400 border border-surface-700/30">
                            {{ player.name || `Player ${player.id}` }}
                            <span class="ml-1 text-gray-600">({{ player.ping }}ms)</span>
                        </span>
                    </div>

                    <!-- Show all / show less toggle -->
                    <button v-if="detailPlayers.length > PLAYER_LIMIT"
                        class="mt-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        @click.stop="showAllPlayers = !showAllPlayers">
                        {{ showAllPlayers ? t.detailShowLess : t.detailShowAll.replace('{count}',
                            String(detailPlayers.length)) }}
                    </button>
                </div>
            </div>

            <!-- Resources -->
            <div>
                <h4 class="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-400">
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    {{ t.detailResources }}
                    <span class="text-gray-500 font-normal normal-case tracking-normal">({{
                        formatNumber(detailResources.length) }})</span>
                </h4>

                <div v-if="detailResources.length === 0" class="text-xs text-gray-600 italic py-1">
                    {{ t.detailNoResources }}
                </div>

                <div v-else>
                    <div class="flex flex-wrap gap-1">
                        <span v-for="resource in visibleResources" :key="resource"
                            class="inline-flex items-center rounded bg-surface-800/60 px-1.5 py-0.5 font-mono text-[11px] text-gray-500 border border-surface-700/30">
                            {{ resource }}
                        </span>
                    </div>

                    <!-- Show all / show less toggle -->
                    <button v-if="detailResources.length > RESOURCE_LIMIT"
                        class="mt-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        @click.stop="showAllResources = !showAllResources">
                        {{ showAllResources ? t.detailShowLess : t.detailShowAll.replace('{count}',
                            String(detailResources.length)) }}
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>
