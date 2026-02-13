import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/cfx-servers.azael/' : '/',
  plugins: [
    vue(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      // Proxy /cfx-api to the FiveM servers API (bypasses CORS during dev)
      '/cfx-api': {
        target: 'https://servers-frontend.fivem.net/api',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cfx-api/, ''),
        followRedirects: true,
      },
    },
  },
})
