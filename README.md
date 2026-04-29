# CFX Servers - FiveM & RedM Server List

A modern web application to browse FiveM and RedM server lists with search, filtering, and real-time player statistics. Defaults to Thai 🇹🇭 servers.

## Tech Stack

- **Vite** + **Vue 3** + **TypeScript** — Frontend framework
- **Tailwind CSS 4.1** — Utility-first CSS (Vite plugin)
- **Vue Router 4** — Client-side routing with route-level code splitting
- **Bun** — JavaScript runtime & package manager
- **GitHub Pages** — Static hosting via GitHub Actions

## Features

- 🎮 Supports both FiveM and RedM
- 🇹🇭 Defaults to Thai servers with 17+ locale filters
- 🔍 Search by server name, gametype, or map
- 📊 Real-time online player statistics
- 🌙 Modern dark mode UI
- 📱 Fully responsive design
- 🌐 Multi-language support (English & Thai) with auto-detection
- 🔎 SEO optimized (meta tags, Open Graph, JSON-LD, sitemap)
- 📢 Adsterra ad integration (leaderboard, rectangle, banner)
- 🛡️ Ad blocker detection with user notification
- ♻️ Auto-refresh data every 60 seconds
- ⚡ Queue-based per-card detail loading with full skeleton UI (no viewport gating)
- 🔒 Rate-limit protection: max 3 concurrent requests, in-flight deduplication, 429 exponential backoff
- 🧩 Extensible architecture for future growth

## Getting Started

```bash
# Install dependencies
bun install

# Dev server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Performance & Configuration

Key constants in `src/constants/index.ts`:

| Constant | Default | Description |
|---|---|---|
| `DEFAULT_PER_PAGE` | `12` | Cards shown per page |
| `SINGLE_SERVER_MAX_CONCURRENT` | `3` | Max simultaneous detail-API requests |
| `INLINE_AD_INTERVAL` | `6` | Show inline ad every N cards |
| `CACHE_DURATION` | `5 min` | In-memory server detail cache TTL |
| `REFRESH_INTERVAL` | `60 s` | Server list auto-refresh interval |

**Loading strategy:** On each page navigation, all cards on the new page enter a concurrency queue immediately. Each card is staggered by `cardIndex × 100 ms` to smooth out insertions. Requests beyond the concurrency limit wait in queue. Cards display a skeleton row until their fetch resolves. Previously-fetched endpoints are served from the in-memory cache with zero network cost.

## Deployment

This project auto-deploys via GitHub Actions on every push to the `main` branch.

### Setting up GitHub Pages:
1. Go to **Settings → Pages**
2. Set Source to **GitHub Actions**
3. Push code to the `main` branch

### Changing the base path:
- Update `base` in `vite.config.ts` to match your repository name

## API Reference

| Endpoint | Description |
|---|---|
| `GET /api/servers/streamRedir` | All server data (msgpack stream) |
| `GET /api/servers/top/{locale}` | Top servers by locale |
| `GET /api/servers/single/{address}` | Single server details |
| `GET /runtime/counts.json` | FiveM player counts |
| `GET /runtime/counts_rdr3.json` | RedM player counts |

> Data sourced from [Cfx.re](https://cfx.re) API

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared UI (Loading, Pagination, StatsBar, AdBlockDetector)
│   ├── layout/          # Header, Footer, AdBanner
│   └── server/          # Server card, list, search, filters
├── composables/         # Vue composables
│   ├── useServers.ts    # Server data & filtering
│   ├── useServerIcon.ts # Lazy-load server icons
│   ├── useSeo.ts        # Dynamic SEO meta tags
│   └── useAdBlock.ts    # Ad blocker detection state
├── constants/           # Configuration & constants
├── i18n/                # Internationalization (EN/TH)
│   ├── locales/         # Translation files
│   └── types.ts         # Translation schema
├── pages/               # Page components
├── router/              # Vue Router config
├── services/            # API service layer
├── types/               # TypeScript type definitions
└── utils/               # Helper utilities
public/
├── robots.txt           # Search engine crawling rules
├── sitemap.xml          # Sitemap for SEO
└── images/              # Static images
```

## Ad Integration

Ads are powered by **Adsterra** and managed centrally through `AdBanner.vue`. Current ad slots:

| Slot | Size | Location | Type |
|---|---|---|---|
| `header-banner` | 728×90 | Top of page | Adsterra iframe |
| `inline-server-list` | 728×90 | Between server cards (every 5) | Adsterra iframe |
| `sidebar-rect` | 300×250 | Desktop sidebar | Adsterra iframe |
| `footer-banner` | 720×90 | Footer | Static banner |

### Configuring ads:
1. Edit `AdBanner.vue` — update Adsterra keys or replace with other ad code
2. Update Adsterra ad unit keys in `constants/index.ts` (`ADSTERRA.KEYS`)
3. Toggle ad positions on/off via `AD_ENABLED` in `constants/index.ts`
4. Ad blocker detection is handled by `AdBlockDetector.vue` with a modal notification

## SEO

- **Meta tags**: title, description, keywords (EN+TH), robots
- **Open Graph / Twitter**: sharing previews with image
- **JSON-LD**: WebSite (with SearchAction) + WebApplication structured data
- **Dynamic**: meta tags update automatically when language is switched
- **Sitemap & robots.txt**: located in `public/`
- **Hreflang**: `en`, `th`, `x-default` for multi-language support

## License

MIT
