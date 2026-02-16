/**
 * Dynamically resolve country flag SVG URLs from `country-flag-icons` package.
 * Uses Vite's import.meta.glob to bundle all 3×2 SVG flags at build time.
 */

const flagModules = import.meta.glob<string>(
    '/node_modules/country-flag-icons/3x2/*.svg',
    { eager: true, import: 'default', query: '?url' }
)

/** Pre-built map: country code (uppercase) → resolved SVG URL */
const flagMap = new Map<string, string>()

for (const [path, url] of Object.entries(flagModules)) {
    // path = "/node_modules/country-flag-icons/3x2/TH.svg"
    const match = path.match(/\/([A-Z]{2})\.svg$/)
    if (match) {
        flagMap.set(match[1]!, url)
    }
}

/**
 * Common non-standard region codes used by FiveM servers
 * mapped to their ISO 3166-1 alpha-2 equivalents.
 */
const REGION_ALIASES: Record<string, string> = {
    // --- Common mistakes ---
    UK: 'GB', // United Kingdom
    EL: 'GR', // Greece (Hellenic Republic)

    // --- Legacy / deprecated ---
    YU: 'RS', // Yugoslavia (deprecated)
    CS: 'RS', // Czechoslovakia (deprecated)
    SU: 'RU', // Soviet Union (deprecated)
    TP: 'TL', // East Timor (old → Timor-Leste)
    ZR: 'CD', // Zaire → DR Congo
    BU: 'MM', // Burma → Myanmar

    // --- Common confusion ---
    FX: 'FR', // Metropolitan France (obsolete)
}

/** Resolve a country code to its canonical form. */
function resolveCode(code: string): string {
    const upper = code.toUpperCase()
    return REGION_ALIASES[upper] || upper
}

/**
 * Get the flag SVG URL for a given ISO 3166-1 alpha-2 country code.
 * Also handles common aliases (e.g. 'UK' → 'GB').
 * Returns empty string if the country code has no flag.
 */
export function getCountryFlagUrl(countryCode: string): string {
    return flagMap.get(resolveCode(countryCode)) || ''
}

/**
 * Check whether a flag exists for the given country code.
 */
export function hasCountryFlag(countryCode: string): boolean {
    return flagMap.has(resolveCode(countryCode))
}
