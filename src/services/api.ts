import { decodeMultiStream } from '@msgpack/msgpack'
import { API, CACHE_DURATION } from '@/constants'
import type { CfxServer, PlayerCounts } from '@/types'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const cache = new Map<string, CacheEntry<unknown>>()

function getCached<T>(key: string): T | null {
  const entry = cache.get(key) as CacheEntry<T> | undefined
  if (entry && Date.now() - entry.timestamp < CACHE_DURATION) {
    return entry.data
  }
  cache.delete(key)
  return null
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

/**
 * Fetch all servers via the streaming msgpack endpoint.
 * This streams server entries and decodes them using msgpack.
 */
export async function fetchAllServers(
  onProgress?: (count: number) => void
): Promise<CfxServer[]> {
  const cacheKey = 'all-servers'
  const cached = getCached<CfxServer[]>(cacheKey)
  if (cached) return cached

  const response = await fetch(API.STREAM_REDIR)
  if (!response.ok) {
    throw new Error(`Failed to fetch servers: ${response.status}`)
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported')
  }

  const servers: CfxServer[] = []

  try {
    for await (const entry of decodeMultiStream(response.body)) {
      const serverEntry = entry as Record<string, unknown>

      if (serverEntry && typeof serverEntry === 'object') {
        // The stream emits entries; we extract EndPoint and Data
        const endPoint = serverEntry['EndPoint'] as string | undefined
        const data = serverEntry['Data'] as CfxServer['Data'] | undefined

        if (endPoint && data) {
          servers.push({ EndPoint: endPoint, Data: data })
          if (onProgress && servers.length % 100 === 0) {
            onProgress(servers.length)
          }
        }
      }
    }
  } catch (err) {
    // Stream may end abruptly; if we have some servers, return them
    console.warn('Stream decode completed with:', servers.length, 'servers', err)
  }

  if (servers.length > 0) {
    setCache(cacheKey, servers)
  }

  return servers
}

/**
 * Fetch top servers for a given locale
 */
export async function fetchTopServers(locale: string): Promise<CfxServer[]> {
  const cacheKey = `top-${locale}`
  const cached = getCached<CfxServer[]>(cacheKey)
  if (cached) return cached

  const url = `${API.TOP_SERVERS}/${locale}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch top servers for ${locale}: ${response.status}`)
  }

  const rawData = await response.json()

  // The response could be an array or an object with a servers property
  let servers: CfxServer[] = []

  if (Array.isArray(rawData)) {
    servers = rawData
  } else if (rawData && typeof rawData === 'object') {
    // Try common response shapes
    const entries = Object.entries(rawData)
    servers = entries
      .filter(([, value]) => value && typeof value === 'object' && 'Data' in (value as Record<string, unknown>))
      .map(([key, value]) => {
        const v = value as Record<string, unknown>
        return {
          EndPoint: (v['EndPoint'] as string) || key,
          Data: v['Data'] as CfxServer['Data'],
        }
      })

    // If entries didn't map, the format might be { endpoint: serverData }
    if (servers.length === 0) {
      servers = entries.map(([key, v]) => ({
        EndPoint: key,
        Data: v as CfxServer['Data'],
      }))
    }
  }

  setCache(cacheKey, servers)
  return servers
}

/**
 * Fetch single server details
 */
export async function fetchSingleServer(address: string): Promise<CfxServer | null> {
  const cacheKey = `server-${address}`
  const cached = getCached<CfxServer>(cacheKey)
  if (cached) return cached

  try {
    const response = await fetch(`${API.SINGLE_SERVER}/${address}`)
    if (!response.ok) return null

    const data = await response.json()

    const server: CfxServer = {
      EndPoint: data.EndPoint || address,
      Data: data.Data || data,
    }

    setCache(cacheKey, server)
    return server
  } catch {
    return null
  }
}

/**
 * Fetch global player counts
 */
export async function fetchPlayerCounts(): Promise<PlayerCounts> {
  const cacheKey = 'player-counts'
  const cached = getCached<PlayerCounts>(cacheKey)
  if (cached) return cached

  try {
    const [fivemRes, redmRes] = await Promise.allSettled([
      fetch(API.COUNTS_FIVEM),
      fetch(API.COUNTS_REDM),
    ])

    let fivem = 0
    let redm = 0

    if (fivemRes.status === 'fulfilled' && fivemRes.value.ok) {
      const data = await fivemRes.value.json()
      fivem = data?.clients || data?.count || 0
    }

    if (redmRes.status === 'fulfilled' && redmRes.value.ok) {
      const data = await redmRes.value.json()
      redm = data?.clients || data?.count || 0
    }

    const counts = { fivem, redm }
    setCache(cacheKey, counts)
    return counts
  } catch {
    return { fivem: 0, redm: 0 }
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  cache.clear()
}
