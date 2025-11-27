// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
  ],

  ssr: false,

  devtools: {
    enabled: true,
  },

  app: {
    head: {
      title: 'Jolt',
    },
  },

  css: ['~/assets/css/main.css'],

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      allowedHosts: true,
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },
})
