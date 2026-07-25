// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-07-25',
  devtools: { enabled: true },
  srcDir: '.',
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'EthChess League | Official Leaderboard',
      meta: [
        { name: 'description', content: 'Official automatic leaderboard system for EthChess League tournaments on Chess.com' }
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }
      ]
    }
  },
  runtimeConfig: {
    tursoUrl: process.env.TURSO_DATABASE_URL || '',
    tursoAuthToken: process.env.TURSO_AUTH_TOKEN || ''
  }
})
