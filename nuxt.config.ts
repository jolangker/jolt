// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    'nuxt-auth-utils',
    '@vueuse/nuxt',
  ],

  ssr: false,

  devtools: {
    enabled: false,
  },

  app: {
    head: {
      title: 'Jolt',
    },
  },

  css: ['~/assets/css/main.css'],

  routeRules: {
    '/api/**': {
      cors: true,
    },
  },

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
