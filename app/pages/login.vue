<script setup lang="ts">
const route = useRoute()

const isValidating = ref(false)
const tokenValid = ref(false)
const tokenError = ref<string | null>(null)

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
    setTimeout(() => {
      location.href = '/'
    }, 1500)
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
      <UCard class="w-full max-w-md">
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
            to="/login"
            variant="soft"
            block
            icon="i-lucide-arrow-left"
          >
            Login dengan OTP
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
