export type Locale = 'th' | 'en'

export interface TranslationSchema {
  // Header
  siteTitle: string
  siteSubtitle: string
  online: string

  // Footer
  footerAbout: string
  relatedLinks: string
  copyright: string
  disclaimer: string
  adSpace: string

  // Search
  searchPlaceholder: string
  serversUnit: string

  // Filters
  hideEmpty: string
  hideFull: string
  hidePrivate: string
  refresh: string
  allLocales: string

  // Sort options
  sortPlayersDesc: string
  sortPlayersAsc: string
  sortNameAsc: string
  sortNameDesc: string
  sortUpvotesDesc: string
  sortSlotsDesc: string

  // Server card
  connect: string

  // Server detail
  serverDetail: string
  detailPlayers: string
  detailResources: string
  detailTags: string
  detailOwner: string
  detailGameBuild: string
  detailOneSync: string
  detailServerVersion: string
  detailScriptHook: string
  detailPrivate: string
  detailEndpoint: string
  detailNoPlayers: string
  detailNoResources: string
  detailNoTags: string
  detailLoading: string
  detailShowAll: string
  detailShowLess: string
  detailEnabled: string
  detailDisabled: string
  detailYes: string
  detailNo: string
  detailPlayerName: string
  detailPlayerPing: string
  detailPureLevel: string
  detailLoadFailed: string

  // Server card (connect button states)
  connectUnavailable: string
  connectPrivate: string

  // Server list
  noServersFound: string
  noServersSuggestion: string

  // Stats
  statsServers: string
  statsPlayers: string
  statsTotalSlots: string
  statsLastUpdated: string

  // Loading
  loadingServers: string
  loadedServers: string

  // Errors
  errorOccurred: string
  tryAgain: string

  // Sidebar
  about: string
  aboutDescription: string
  downloadFiveM: string
  downloadRedM: string

  // Footer links
  fivemOfficial: string
  redmOfficial: string
  cfxForum: string

  // Cfx.re Feed
  cfxFeed: string
  cfxFeedEmpty: string
  cfxFeedError: string

  // Ad blocker
  adBlockTitle: string
  adBlockMessage: string
  adBlockDismiss: string
}

export type Translations = Record<Locale, TranslationSchema>
