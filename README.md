# CFX Servers - FiveM & RedM Server List

A modern web application to browse FiveM and RedM server lists with search, filtering, and real-time player statistics. Defaults to Thai 🇹🇭 servers.

## Tech Stack

- **Vite** + **Vue 3** + **TypeScript** — Frontend framework
- **Tailwind CSS 4.1** — Utility-first CSS (Vite plugin)
- **Vue Router 4** — Client-side routing
- **@msgpack/msgpack** — Decode FiveM streaming server data
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
- 📢 Google AdSense ad integration (leaderboard, rectangle, banner)
- 🛡️ Ad blocker detection with user notification
- ♻️ Auto-refresh data every 60 seconds
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

Ads are powered by **Google AdSense** and managed centrally through `AdBanner.vue`. Current ad slots:

| Slot | Size | Location | Type | AdSense Slot Key |
|---|---|---|---|---|
| `header-banner` | 728×90 | Top of page | AdSense responsive | `HEADER` |
| `inline-server-list` | 728×90 | Between server cards (every 10) | AdSense responsive | `INLINE` |
| `sidebar-rect` | 300×250 | Desktop sidebar | AdSense fixed | `SIDEBAR` |
| `footer-banner` | Responsive horizontal | Footer (grid column) | AdSense responsive | `FOOTER` |

### Configuring ads:
1. Update your **Publisher ID** (`ca-pub-XXXXXXXXXXXXXXXX`) in `index.html` and `constants/index.ts` (`ADSENSE.CLIENT_ID`)
2. Update **ad unit slot IDs** in `constants/index.ts` (`ADSENSE.SLOTS`) — each position has its own key (`HEADER`, `INLINE`, `SIDEBAR`, `FOOTER`)
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
