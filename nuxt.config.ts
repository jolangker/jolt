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

  runtimeConfig: {
    // Server-side only (keep secret!)
    midtransServerKey: process.env.MIDTRANS_SERVER_KEY,
    proSubscriptionPrice: process.env.PRO_SUBSCRIPTION_PRICE,
    // Public (exposed to frontend)
    public: {
      midtransClientKey: process.env.MIDTRANS_CLIENT_KEY,
      midtransIsProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    },
  },

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
