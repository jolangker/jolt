<script setup lang="ts">
const route = useRoute()
const token = computed(() => typeof route.query.t === 'string' ? route.query.t : '')
const loading = ref(true)
const confirming = ref(false)
const error = ref('')
const user = ref('')
const linkUnavailableMessage = 'Link dashboard ini sudah tidak tersedia. Minta link baru lewat Telegram.'
const { fetch: fetchUserSession } = useUserSession()

async function inspect() {
  if (!token.value) {
    error.value = linkUnavailableMessage
    loading.value = false
    return
  }
  try {
    const response = await $fetch('/api/auth/dashboard-link', { params: { token: token.value } })
    user.value = response.data.user.telegramUsername
  }
  catch { error.value = linkUnavailableMessage }
  finally { loading.value = false }
}

async function confirm() {
  confirming.value = true
  try {
    await $fetch('/api/auth/dashboard-link', { method: 'POST', body: { token: token.value } })
    await fetchUserSession()
    await navigateTo('/')
  }
  catch { error.value = linkUnavailableMessage }
  finally { confirming.value = false }
}

onMounted(inspect)
</script>

<template>
  <UDashboardPanel :ui="{ body: 'flex items-center justify-center' }">
    <template #body>
      <UCard class="w-full max-w-md">
        <template #header>
          <h1 class="text-xl font-semibold">
            Konfirmasi masuk dashboard
          </h1>
        </template>
        <div
          v-if="loading"
          class="space-y-3"
        >
          <USkeleton class="h-5 w-full" /><UProgress animation="carousel" />
        </div>
        <UAlert
          v-else-if="error"
          color="error"
          variant="soft"
          title="Gagal masuk"
          :description="error"
        />
        <div
          v-else
          class="space-y-5"
        >
          <p>Kamu akan masuk ke Jolt sebagai <strong>{{ user }}</strong>.</p>
          <UButton
            block
            :loading="confirming"
            @click="confirm"
          >
            Konfirmasi masuk
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
