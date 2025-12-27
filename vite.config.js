import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/blazing-defense/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-512x512.png'],
      manifest: {
        name: 'BLAZING DEFENSE - 設備士の決断',
        short_name: 'BLAZING DEFENSE',
        description: '消防設備の知識を学習できる教育的なタワーディフェンスゲーム',
        theme_color: '#ff4400',
        background_color: '#0a0a0a',
        display: 'standalone',
        scope: '/blazing-defense/',
        start_url: '/blazing-defense/',
        orientation: 'portrait',
        icons: [
          {
            src: '/blazing-defense/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['education', 'games'],
        lang: 'ja',
        dir: 'ltr'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],
})
