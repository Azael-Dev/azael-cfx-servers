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
}

export type Translations = Record<Locale, TranslationSchema>
