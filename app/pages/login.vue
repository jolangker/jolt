<script setup lang="ts">
const route = useRoute()

const isValidating = ref(false)
const tokenValid = ref(false)
const tokenError = ref<string | null>(null)

const handleRedirect = () => {
  setTimeout(() => {
    location.href = '/'
  }, 500)
}

async function validateToken() {
  const token = route.query.t as string
  if (!token || token.length < 8) {
    tokenError.value = 'Invalid token format'
    return
  }

  isValidating.value = true
  tokenError.value = null

  try {
    await $fetch('/api/auth/login-with-token', {
      method: 'POST',
      body: { token },
    })

    tokenValid.value = true
    handleRedirect()
  }
  catch (error: any) {
    tokenError.value = error.data?.message || 'Invalid or expired token'
  }
  finally {
    isValidating.value = false
  }
}

onMounted(() => {
  validateToken()
})
</script>

<template>
  <UDashboardPanel :ui="{ body: 'flex items-center justify-center' }">
    <template #body>
      <UCard
        v-if="route.query.t"
        class="w-full max-w-md"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              :name="isValidating ? 'i-lucide-loader-circle' : tokenValid ? 'i-lucide-shield-check' : 'i-lucide-shield-alert'"
              class="size-6"
              :class="{
                'animate-spin text-primary': isValidating,
                'text-success': tokenValid,
                'text-error': !isValidating && !tokenValid && tokenError,
              }"
            />
            <h2 class="text-xl font-semibold">
              {{ isValidating ? 'Memvalidasi Token' : tokenValid ? 'Token Valid' : 'Validasi Gagal' }}
            </h2>
          </div>
        </template>

        <div
          v-if="isValidating"
          class="space-y-4"
        >
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
          <UProgress animation="carousel" />
        </div>

        <div
          v-else-if="tokenValid"
          class="space-y-4"
        >
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            title="Akses Diberikan"
            description="Token berhasil divalidasi. Mengalihkan ke dashboard..."
          />
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-circle-x"
            title="Akses Ditolak"
            :description="tokenError || 'Token tidak valid'"
          />
          <UButton
            label="Masuk dengan Telegram"
            color="primary"
            variant="solid"
            block
            @click="navigateTo('/login', { replace: true })"
          />
        </div>
      </UCard>
      <UCard
        v-else
        class="w-full max-w-md"
      >
        <div class="space-y-6">
          <div class="text-center space-y-2">
            <div class="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
              <UIcon
                name="i-lucide-wallet"
                class="size-8 text-primary"
              />
            </div>
            <h1 class="text-2xl font-bold text-typography">
              Wuzz AI
            </h1>
            <p class="text-sm text-dimmed">
              Kelola keuangan Anda dengan mudah dan efisien
            </p>
          </div>

          <div class="h-px bg-gray-200 dark:bg-gray-800" />

          <div class="text-center space-y-3">
            <p class="text-sm text-typography">
              Masuk untuk melanjutkan
            </p>
            <div class="flex items-center justify-center">
              <TelegramLoginWidget @callback="handleRedirect" />
            </div>
            <p class="text-xs text-dimmed">
              Login aman dan terenkripsi dengan Telegram
            </p>
          </div>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
