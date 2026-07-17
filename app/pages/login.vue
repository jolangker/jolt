<script setup lang="ts">
const route = useRoute()
const token = computed(() => typeof route.query.t === 'string' ? route.query.t : '')
const loading = ref(true)
const confirming = ref(false)
const error = ref('')
const user = ref('')
const linkUnavailableMessage = 'This dashboard link is no longer available. Please request a new one from Telegram.'

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
            Confirm dashboard sign-in
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
          title="Unable to sign in"
          :description="error"
        />
        <div
          v-else
          class="space-y-5"
        >
          <p>You are about to sign in to Jolt as <strong>{{ user }}</strong>.</p>
          <UButton
            block
            :loading="confirming"
            @click="confirm"
          >
            Confirm sign-in
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
