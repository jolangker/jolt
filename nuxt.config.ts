// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@prisma/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    N8N_SECRET: process.env.N8N_SECRET,
    APP_BASE_URL: process.env.APP_BASE_URL
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      allowedHosts: true
    }
  },

  eslint: {
    config: {
      stylistic: true
    }
  }
})
