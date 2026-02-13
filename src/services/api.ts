import { API, CACHE_DURATION } from '@/constants'
import type { CfxServer, CfxServerData, PlayerCounts } from '@/types'

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Lightweight protobuf helpers (no external dependency)
// ---------------------------------------------------------------------------

const textDecoder = new TextDecoder('utf-8', { fatal: false })

/** Read a varint from `data` at `pos`. Returns [value, newPos]. */
function readVarint(data: Uint8Array, pos: number): [number, number] {
  let val = 0
  let shift = 0
  while (pos < data.length) {
    const b = data[pos++]!
    val |= (b & 0x7f) << shift
    if ((b & 0x80) === 0) break
    shift += 7
  }
  return [val, pos]
}

/** Read a length-delimited field from `data` at `pos`. Returns [bytes, newPos]. */
function readLengthDelimited(data: Uint8Array, pos: number): [Uint8Array, number] {
  const [len, p] = readVarint(data, pos)
  return [data.subarray(p, p + len), p + len]
}

/** Decode a single string from `data` at `pos`. */
function readString(data: Uint8Array, pos: number): [string, number] {
  const [bytes, newPos] = readLengthDelimited(data, pos)
  return [textDecoder.decode(bytes), newPos]
}

// ---------------------------------------------------------------------------
// Stream protobuf decoder
//
// The FiveM /api/servers/stream/ endpoint returns a sequence of
// length-prefixed protobuf messages:
//
//   [ 4-byte LE uint32 length ][ protobuf message of that length ] …
//
// Each message has this schema:
//   message ServerEntry {
//     string EndPoint = 1;
//     ServerData Data  = 2; // length-delimited nested message
//   }
//
// ServerData schema (relevant fields):
//   message ServerData {
//     uint32 sv_maxclients = 1;
//     uint32 clients       = 2;
//     string hostname      = 4;
//     string gametype      = 5;
//     string mapname       = 6;
//     string server        = 9;
//     repeated Var vars    = 12;
//     uint32 upvotePower   = 16;
//   }
//
//   message Var {
//     string key   = 1;
//     string value = 2;
//   }
// ---------------------------------------------------------------------------

/** Parse a single Var message (key = field 1, value = field 2). */
function parseVar(data: Uint8Array): [string, string] {
  let pos = 0
  let key = ''
  let value = ''

  while (pos < data.length) {
    const tag = data[pos++]!
    const fieldNum = tag >> 3
    const wireType = tag & 0x07

    if (wireType !== 2) break // only expect length-delimited strings
    const [str, np] = readString(data, pos)
    pos = np
    if (fieldNum === 1) key = str
    else if (fieldNum === 2) value = str
  }

  return [key, value]
}

/** Parse the nested ServerData protobuf message. */
function parseServerData(data: Uint8Array): CfxServerData {
  const vars: Record<string, string> = {}
  let maxClients = 0
  let clients = 0
  let hostname = ''
  let gametype = ''
  let mapname = ''
  let serverVersion = ''
  let upvotePower = 0

  let pos = 0
  while (pos < data.length) {
    const tag = data[pos]!
    const fieldNum = tag >> 3
    const wireType = tag & 0x07
    pos++

    if (fieldNum === 0 || fieldNum > 30) break

    if (wireType === 0) {
      // varint
      const [val, np] = readVarint(data, pos)
      pos = np
      if (fieldNum === 1) maxClients = val
      else if (fieldNum === 2) clients = val
      else if (fieldNum === 16) upvotePower = val
    } else if (wireType === 2) {
      // length-delimited
      const [bytes, np] = readLengthDelimited(data, pos)
      pos = np
      if (fieldNum === 4) hostname = textDecoder.decode(bytes)
      else if (fieldNum === 5) gametype = textDecoder.decode(bytes)
      else if (fieldNum === 6) mapname = textDecoder.decode(bytes)
      else if (fieldNum === 9) serverVersion = textDecoder.decode(bytes)
      else if (fieldNum === 12) {
        const [k, v] = parseVar(bytes)
        if (k) vars[k] = v
      }
    } else if (wireType === 5) {
      pos += 4 // fixed32
    } else if (wireType === 1) {
      pos += 8 // fixed64
    } else {
      break // unknown wire type
    }
  }

  return {
    clients,
    gamename: vars['gamename'] || 'gta5',
    gametype,
    hostname,
    mapname,
    sv_maxclients: maxClients,
    enhancedHostSupport: false,
    resources: [],
    server: serverVersion,
    vars,
    selfReportedClients: clients,
    players: [],
    ownerID: '',
    private: false,
    fallback: false,
    connectEndPoints: [],
    upvotePower,
    burstPower: 0,
    support_status: vars['support_status'] || '',
    ownerName: vars['ownerName'] || '',
    ownerProfile: vars['ownerProfile'] || '',
    ownerAvatar: vars['ownerAvatar'] || '',
    lastSeen: '',
    iconVersion: parseInt(vars['iconVersion'] || '0', 10) || 0,
  }
}

/** Parse a single length-prefixed entry from the stream buffer. */
function parseEntry(
  buf: Uint8Array,
  offset: number,
): { server: CfxServer; nextOffset: number } | null {
  if (offset + 4 > buf.length) return null

  const dv = new DataView(buf.buffer, buf.byteOffset)
  const entryLen = dv.getUint32(offset, true) // little-endian
  offset += 4

  if (entryLen === 0 || offset + entryLen > buf.length) return null

  const entry = buf.subarray(offset, offset + entryLen)
  let pos = 0

  // Field 1: EndPoint (string)
  pos++ // skip tag byte (0x0a)
  const [endPoint, p1] = readString(entry, pos)
  pos = p1

  // Field 2: Data (nested message)
  pos++ // skip tag byte (0x12)
  const [dataBytes] = readLengthDelimited(entry, pos)
  const data = parseServerData(dataBytes)

  return {
    server: { EndPoint: endPoint, Data: data },
    nextOffset: offset + entryLen,
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all servers from the FiveM streaming API.
 *
 * Downloads the full ~19 MB response buffer, then parses length-prefixed
 * protobuf entries. Uses STREAM_REDIR first, then STREAM_DIRECT as fallback.
 */
export async function fetchAllServers(
  onProgress?: (count: number) => void
): Promise<CfxServer[]> {
  const cacheKey = 'all-servers'
  const cached = getCached<CfxServer[]>(cacheKey)
  if (cached) return cached

  const urls = [API.STREAM_REDIR, API.STREAM_DIRECT]

  for (const url of urls) {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        console.warn(`[cfx] ${url} responded with ${response.status}`)
        continue
      }

      const arrayBuf = await response.arrayBuffer()
      const buf = new Uint8Array(arrayBuf)

      const servers: CfxServer[] = []
      let offset = 0

      while (offset < buf.length) {
        const result = parseEntry(buf, offset)
        if (!result) break
        servers.push(result.server)
        offset = result.nextOffset

        if (onProgress && servers.length % 500 === 0) {
          onProgress(servers.length)
        }
      }

      if (servers.length > 0) {
        console.info(`[cfx] Loaded ${servers.length} servers from ${url}`)
        setCache(cacheKey, servers)
        onProgress?.(servers.length)
        return servers
      }
    } catch (err) {
      console.warn(`[cfx] Failed to fetch from ${url}:`, err)
    }
  }

  console.error('[cfx] All server fetch endpoints failed')
  return []
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
 * Fetch global player counts.
 *
 * The counts endpoints return a JSON array: [players, unknown, maxSlots]
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
      // Response is [players, unknown, maxSlots]
      fivem = Array.isArray(data) ? (data[0] ?? 0) : (data?.clients ?? data?.count ?? 0)
    }

    if (redmRes.status === 'fulfilled' && redmRes.value.ok) {
      const data = await redmRes.value.json()
      redm = Array.isArray(data) ? (data[0] ?? 0) : (data?.clients ?? data?.count ?? 0)
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
