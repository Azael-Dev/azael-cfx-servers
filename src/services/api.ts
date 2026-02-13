import { decodeMultiStream, type DecoderOptions } from '@msgpack/msgpack'
import { API, CACHE_DURATION } from '@/constants'
import type { CfxServer, PlayerCounts } from '@/types'

/**
 * The FiveM streaming API may use binary (Uint8Array) map keys.
 * The default decoder rejects anything that isn't string | number,
 * so we coerce unknown keys to their string representation.
 */
const msgpackOptions: DecoderOptions = {
  mapKeyConverter: (key: unknown): string | number => {
    if (typeof key === 'string' || typeof key === 'number') return key
    if (key instanceof Uint8Array) return new TextDecoder().decode(key)
    return String(key)
  },
}

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
 * Decode a msgpack stream body into CfxServer[] entries.
 */
async function decodeMsgpackStream(
  body: ReadableStream<Uint8Array>,
  onProgress?: (count: number) => void
): Promise<CfxServer[]> {
  const servers: CfxServer[] = []

  for await (const entry of decodeMultiStream(body, msgpackOptions)) {
    const serverEntry = entry as Record<string, unknown>

    if (serverEntry && typeof serverEntry === 'object') {
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

  return servers
}

/**
 * Fetch all servers via the streaming msgpack endpoint.
 *
 * The `streamRedir` endpoint may:
 *   a) HTTP 302 → browser follows redirect to the real msgpack stream, or
 *   b) HTTP 200 with a URL in the body that we must fetch ourselves.
 *
 * We detect case (b) by peeking at the first bytes: if the body looks like
 * a URL (starts with "http"), we fetch that URL and decode its stream instead.
 *
 * Falls back to the top-servers JSON API when streaming fails entirely.
 */
export async function fetchAllServers(
  onProgress?: (count: number) => void
): Promise<CfxServer[]> {
  const cacheKey = 'all-servers'
  const cached = getCached<CfxServer[]>(cacheKey)
  if (cached) return cached

  try {
    const servers = await fetchViaStream(onProgress)
    if (servers.length > 0) {
      setCache(cacheKey, servers)
      return servers
    }
  } catch (err) {
    console.warn('[cfx] Streaming fetch failed, falling back to JSON API:', err)
  }

  // Fallback: aggregate top servers from multiple locales
  const servers = await fetchViaTopServers(onProgress)
  if (servers.length > 0) {
    setCache(cacheKey, servers)
  }
  return servers
}

/**
 * Primary path — msgpack stream via streamRedir
 */
async function fetchViaStream(
  onProgress?: (count: number) => void
): Promise<CfxServer[]> {
  const response = await fetch(API.STREAM_REDIR)
  if (!response.ok) {
    throw new Error(`streamRedir responded with ${response.status}`)
  }

  if (!response.body) {
    throw new Error('ReadableStream not supported')
  }

  // --- Peek at the first chunk to decide if it's a URL or raw msgpack ----
  const reader = response.body.getReader()
  const { value: firstChunk, done } = await reader.read()

  if (done || !firstChunk || firstChunk.length === 0) {
    reader.releaseLock()
    throw new Error('Empty response body')
  }

  // Check if the response looks like a plain-text URL (starts with "http")
  const headStr = new TextDecoder().decode(firstChunk.slice(0, 10))

  if (headStr.startsWith('http')) {
    // Case (b): body is a URL string — read the rest and fetch it
    reader.releaseLock()
    const fullBody = await response.text()
    // The first chunk was already consumed by the reader, but text() may
    // still return the remainder. Safeguard: rebuild the URL from what we have.
    const streamUrl = (new TextDecoder().decode(firstChunk) + fullBody).trim()
      // strip surrounding quotes if present
      .replace(/^["']|["']$/g, '')

    if (!streamUrl.startsWith('http')) {
      throw new Error(`Unexpected streamRedir body: ${streamUrl.slice(0, 120)}`)
    }

    const streamRes = await fetch(streamUrl)
    if (!streamRes.ok) throw new Error(`Stream URL responded with ${streamRes.status}`)
    if (!streamRes.body) throw new Error('ReadableStream not supported for stream URL')

    return decodeMsgpackStream(streamRes.body, onProgress)
  }

  // Case (a): body is already the msgpack stream — re-assemble the stream
  // from the chunk we already read + the remaining data.
  const reassembled = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(firstChunk)
    },
    async pull(controller) {
      const { value, done: readerDone } = await reader.read()
      if (readerDone) {
        controller.close()
      } else if (value) {
        controller.enqueue(value)
      }
    },
    cancel() {
      reader.cancel()
    },
  })

  return decodeMsgpackStream(reassembled, onProgress)
}

/**
 * Fallback — aggregate servers from the top-servers JSON API for all locales.
 * This is slower but avoids the msgpack stream entirely.
 */
async function fetchViaTopServers(
  onProgress?: (count: number) => void
): Promise<CfxServer[]> {
  // Fetch a broad set of locales to get maximum coverage
  const locales = [
    'th_TH', 'en_US', 'en_GB', 'de_DE', 'fr_FR', 'pt_BR', 'es_ES',
    'pl_PL', 'ru_RU', 'it_IT', 'nl_NL', 'tr_TR', 'ar_SA', 'zh_TW',
    'ja_JP', 'ko_KR',
  ]

  const seen = new Set<string>()
  const servers: CfxServer[] = []

  // Fetch in parallel batches of 4
  for (let i = 0; i < locales.length; i += 4) {
    const batch = locales.slice(i, i + 4)
    const results = await Promise.allSettled(
      batch.map(locale => fetchTopServers(locale))
    )

    for (const res of results) {
      if (res.status === 'fulfilled') {
        for (const srv of res.value) {
          if (!seen.has(srv.EndPoint)) {
            seen.add(srv.EndPoint)
            servers.push(srv)
          }
        }
      }
    }

    onProgress?.(servers.length)
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
