/** Represents game type for the CFX platform */
export type GameType = 'fivem' | 'redm'

/** Locale/country filter options */
export interface LocaleOption {
  code: string
  label: string
  flag: string
}

/** Server data returned from the CFX API */
export interface CfxServer {
  EndPoint: string
  Data: CfxServerData
}

export interface CfxServerData {
  clients: number
  gamename: string
  gametype: string
  hostname: string
  mapname: string
  sv_maxclients: number
  enhancedHostSupport: boolean
  resources: string[]
  server: string
  vars: Record<string, string>
  selfReportedClients: number
  players: CfxPlayer[]
  ownerID: string
  private: boolean
  fallback: boolean
  connectEndPoints: string[]
  upvotePower: number
  burstPower: number
  support_status: string
  ownerName: string
  ownerProfile: string
  ownerAvatar: string
  lastSeen: string
  iconVersion: number
}

export interface CfxPlayer {
  endpoint: string
  id: number
  identifiers: string[]
  name: string
  ping: number
}

/** Normalized server data for UI display */
export interface Server {
  id: string
  endpoint: string
  hostname: string
  hostnameClean: string
  players: number
  maxPlayers: number
  ping: number
  gametype: string
  mapname: string
  locale: string
  tags: string[]
  gameType: GameType
  upvotePower: number
  burstPower: number
  ownerName: string
  ownerAvatar: string
  ownerProfile: string
  private: boolean
  scriptHookAllowed: boolean
  enforceGameBuild: string
  onesyncEnabled: boolean
  server: string
  iconUrl: string
  bannerUrl: string
  projectName: string
  projectDescription: string
  connectEndPoints: string[]
  playerList: CfxPlayer[]
  lastSeen: string
  resources: string[]
}

/** Sort options */
export type SortField = 'players' | 'name' | 'upvotes' | 'maxPlayers'
export type SortOrder = 'asc' | 'desc'

export interface SortOption {
  field: SortField
  order: SortOrder
  labelKey: string
}

/** Filter state */
export interface FilterState {
  search: string
  locale: string
  gameType: GameType
  hideEmpty: boolean
  hideFull: boolean
  sortBy: SortField
  sortOrder: SortOrder
  currentPage: number
  perPage: number
}

/** Player count stats */
export interface PlayerCounts {
  fivem: number
  redm: number
}

/** Ad slot configuration */
export interface AdSlot {
  id: string
  position: 'header' | 'sidebar' | 'inline' | 'footer'
  size: 'banner' | 'leaderboard' | 'rectangle' | 'skyscraper'
  enabled: boolean
}
