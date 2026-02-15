import { API } from '@/constants'
import type { CfxServer, Server, GameType } from '@/types'

/**
 * Strip FiveM color codes and HTML from hostname
 * FiveM uses ^1-^9 for colors and sometimes HTML entities
 */
export function cleanHostname(hostname: string): string {
  return hostname
    .replace(/\^[0-9]/g, '')        // Remove ^0 - ^9 color codes
    .replace(/~[a-zA-Z]~/g, '')     // Remove ~x~ style codes
    .replace(/<[^>]*>/g, '')        // Remove HTML tags
    .replace(/&[^;]+;/g, '')        // Remove HTML entities
    .trim()
}

/**
 * Render hostname with FiveM color codes as HTML spans
 */
export function renderHostname(hostname: string): string {
  // Official colors: docs.fivem.net/docs/server-manual/server-name-colors/#available-color-codes
  const colorMap: Record<string, string> = {
    '0': '#FFFFF0', // White
    '1': '#F44336', // Red
    '2': '#4CAF50', // Green
    '3': '#FFEB3B', // Yellow
    '4': '#42A5F5', // Blue
    '5': '#03A9F4', // Light Blue
    '6': '#9C27B0', // Purple
    '7': '#FFFFF0', // White
    '8': '#FF5722', // Orange
    '9': '#9E9E9E', // Grey
  }

  // Batch consecutive characters with the same color into a single <span>
  // to preserve complex script shaping (Thai, Arabic, etc.)
  let result = ''
  let currentColor = '#FFFFFF'
  let buffer = ''
  let bufferColor = currentColor
  let i = 0

  while (i < hostname.length) {
    const char = hostname[i]!
    const nextChar = hostname[i + 1]
    if (char === '^' && i + 1 < hostname.length && nextChar && colorMap[nextChar]) {
      currentColor = colorMap[nextChar]
      i += 2
    } else if (char === '~' && i + 2 < hostname.length && hostname[i + 2] === '~') {
      i += 3 // Skip ~x~ codes
    } else {
      if (currentColor !== bufferColor && buffer) {
        result += `<span style="color:${bufferColor}">${escapeHtml(buffer)}</span>`
        buffer = ''
      }
      bufferColor = currentColor
      buffer += char
      i++
    }
  }

  // Flush remaining buffer
  if (buffer) {
    result += `<span style="color:${bufferColor}">${escapeHtml(buffer)}</span>`
  }

  return result
}

/** Escape HTML special characters */
function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  return str.replace(/[&<>"']/g, (m) => map[m] || m)
}

/**
 * Normalize raw CFX server data to our Server type
 */
export function normalizeServer(raw: CfxServer): Server {
  const data = raw.Data
  const vars = data.vars || {}
  const displayName = vars['sv_projectName'] || vars['sv_projectDesc'] || data.hostname || ''
  const iconVersion = data.iconVersion || 0
  const iconUrl = iconVersion != 0 ? API.SERVER_ICON(raw.EndPoint, iconVersion) : ''

  return {
    id: raw.EndPoint,
    endpoint: raw.EndPoint,
    hostname: data.hostname || '',
    hostnameClean: cleanHostname(displayName),
    players: data.clients || data.selfReportedClients || 0,
    maxPlayers: data.sv_maxclients || 0,
    ping: 0,
    gametype: data.gametype || '',
    mapname: data.mapname || '',
    locale: vars['locale'] || '',
    tags: (vars['tags'] || '').split(',').filter(Boolean),
    gameType: detectGameType(data.gamename),
    upvotePower: data.upvotePower || 0,
    burstPower: data.burstPower || 0,
    ownerName: data.ownerName || '',
    ownerAvatar: data.ownerAvatar || '',
    ownerProfile: data.ownerProfile || '',
    private: data.private || false,
    scriptHookAllowed: vars['sv_scriptHookAllowed'] === 'true' || vars['sv_scriptHookAllowed'] === '1',
    enforceGameBuild: vars['sv_enforceGameBuild'] || '',
    onesyncEnabled: vars['onesync_enabled'] === 'true' || vars['onesync_enabled'] === '1',
    server: data.server || '',
    iconUrl,
    bannerUrl: vars['banner_connecting'] || vars['banner_detail'] || '',
    projectName: vars['sv_projectName'] || '',
    projectDescription: vars['sv_projectDesc'] || '',
    connectEndPoints: data.connectEndPoints || [],
    playerList: data.players || [],
    lastSeen: data.lastSeen || '',
    resources: data.resources || [],
  }
}

/** Detect game type from gamename string */
function detectGameType(gamename: string): GameType {
  if (gamename?.toLowerCase().includes('rdr3') || gamename?.toLowerCase().includes('redm')) {
    return 'redm'
  }
  return 'fivem'
}

/** Format player count as readable string */
export function formatPlayerCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}

/** Calculate player fill percentage */
export function getPlayerFillPercent(players: number, maxPlayers: number): number {
  if (maxPlayers === 0) return 0
  return Math.min(100, Math.round((players / maxPlayers) * 100))
}

/** Debounce utility */
export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>
  return ((...args: unknown[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }) as T
}

/** Get country code (lowercase) from locale string e.g. 'en-US' → 'us' */
export function getCountryCode(locale: string): string {
  const cc = locale.split(/[-_]/)[1]?.toLowerCase()
  return cc && cc.length === 2 ? cc : ''
}

/** Get flag image URL from locale code via flagcdn.com CDN */
export function getFlagUrl(locale: string): string {
  const cc = getCountryCode(locale)
  if (!cc) return ''
  return `https://flagcdn.com/w40/${cc}.png`
}

/** Format number with commas */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/** Generate cfx.re connect URL */
export function getConnectUrl(gameType: GameType, endpoint: string): string {
  return `${gameType}://connect/cfx.re/join/${endpoint}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

/**
 * Generate a deterministic gradient from a string (like servers.fivem.net).
 * Same endpoint always produces the same gradient.
 */
export function getServerGradient(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue1 = ((hash % 360) + 360) % 360
  const hue2 = (hue1 + 40 + ((hash >> 8) % 80)) % 360
  const angle = ((hash >> 16) % 360 + 360) % 360
  return `linear-gradient(${angle}deg, hsl(${hue1}, 60%, 40%), hsl(${hue2}, 50%, 50%))`
}

/**
 * Format ISO date string as relative time (e.g. "5 minutes ago" or "5 นาทีที่แล้ว")
 * Uses Intl.RelativeTimeFormat for proper localization.
 * @param dateStr - ISO date string or parseable date string
 * @param locale - BCP 47 locale tag (e.g. 'en', 'th')
 */
export function formatRelativeTime(dateStr: string, locale = 'en'): string {
  const date = new Date(dateStr)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr / 24)
  const diffMo = Math.floor(diffDay / 30)
  const diffYr = Math.floor(diffDay / 365)

  try {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto', style: 'long' })

    if (diffYr > 0) return rtf.format(-diffYr, 'year')
    if (diffMo > 0) return rtf.format(-diffMo, 'month')
    if (diffDay > 0) return rtf.format(-diffDay, 'day')
    if (diffHr > 0) return rtf.format(-diffHr, 'hour')
    if (diffMin > 0) return rtf.format(-diffMin, 'minute')
    return rtf.format(-diffSec, 'second')
  } catch {
    // Fallback if Intl.RelativeTimeFormat fails
    if (diffYr > 0) return `${diffYr} year${diffYr > 1 ? 's' : ''} ago`
    if (diffMo > 0) return `${diffMo} month${diffMo > 1 ? 's' : ''} ago`
    if (diffDay > 0) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
    if (diffHr > 0) return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`
    return `${diffSec} second${diffSec > 1 ? 's' : ''} ago`
  }
}
