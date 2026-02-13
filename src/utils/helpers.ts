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
  const colorMap: Record<string, string> = {
    '0': '#FFFFFF', // White
    '1': '#FF0000', // Red
    '2': '#00FF00', // Green
    '3': '#FFFF00', // Yellow
    '4': '#0000FF', // Blue
    '5': '#00FFFF', // Cyan
    '6': '#FF00FF', // Magenta
    '7': '#FFFFFF', // White
    '8': '#FF8C00', // Orange
    '9': '#808080', // Grey
  }

  let result = ''
  let currentColor = '#FFFFFF'
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
      result += `<span style="color:${currentColor}">${escapeHtml(char)}</span>`
      i++
    }
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

  return {
    id: raw.EndPoint,
    endpoint: raw.EndPoint,
    hostname: data.hostname || '',
    hostnameClean: cleanHostname(data.hostname || ''),
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
    iconUrl: '',
    bannerUrl: '',
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

/** Get flag emoji from locale code */
export function getFlagFromLocale(locale: string): string {
  const countryCode = locale.split(/[-_]/)[1]?.toUpperCase()
  if (!countryCode || countryCode.length !== 2) return '🌐'
  const codePoints = [...countryCode].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  return String.fromCodePoint(...codePoints)
}

/** Format number with commas */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/** Generate cfx.re connect URL */
export function getConnectUrl(endpoint: string): string {
  return `https://cfx.re/join/${endpoint}`
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}
