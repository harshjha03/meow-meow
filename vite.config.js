import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'favicon-64x64.png'],
      manifest: {
        name: 'Meow Meow — CAT Prep Tracker',
        short_name: 'Meow Meow',
        description: 'Offline-first tracker for CAT exam preparation: log practice, mocks, targets and streaks.',
        theme_color: '#6C4DF6',
        background_color: '#F1EBDF',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity'],
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // Cache Google Calendar + Supabase responses at runtime (network-first so data stays fresh).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://www.googleapis.com',
            handler: 'NetworkFirst',
            options: { cacheName: 'google-api', expiration: { maxEntries: 50, maxAgeSeconds: 86400 } },
          },
          {
            // Google Fonts stylesheet
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            // Google Fonts files — cache hard so fonts work fully offline
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-files',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false, // keep SW off in dev to avoid stale-cache confusion; it builds for prod
      },
    }),
  ],
  server: { port: 5173, open: false },
})
