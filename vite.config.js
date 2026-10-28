import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/TVShowList/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Codice aggiuntivo del service worker: mostra le notifiche push
      // (public/push-sw.js).
      workbox: {
        importScripts: ['push-sw.js'],
      },
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'TV ShowList',
        short_name: 'TV ShowList',
        description: 'Keep track of the TV shows and movies you have watched, are watching, or want to watch',
        start_url: '/TVShowList/',
        scope: '/TVShowList/',
        display: 'standalone',
        background_color: '#0c0d10',
        theme_color: '#0c0d10',
        icons: [
          {
            src: 'pwa/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa/maskable-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})