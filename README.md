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
- 📢 Built-in ad slot support (Google AdSense, etc.)
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
│   ├── common/          # Shared UI components
│   ├── layout/          # Header, Footer, Ad components
│   └── server/          # Server-specific components
├── composables/         # Vue composables (state management)
├── constants/           # Configuration & constants
├── pages/               # Page components
├── router/              # Vue Router config
├── services/            # API service layer
├── types/               # TypeScript type definitions
└── utils/               # Helper utilities
```

## Adding Ads

1. Edit `index.html` — add your AdSense script in `<head>`
2. Edit `AdBanner.vue` — replace the placeholder with real ad code
3. Configure ad slots in `HomePage.vue` (header, sidebar, inline, footer)

## License

MIT

