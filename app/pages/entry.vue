<script setup lang="ts">
const route = useRoute()

const isValidating = ref(true)
const validationError = ref<string | null>(null)
const isValid = ref(false)

const token = computed(() => route.query.token as string)

async function validateToken() {
  if (!token.value) {
    validationError.value = 'No token provided in URL'
    isValidating.value = false
    return
  }

  if (token.value.length < 8) {
    validationError.value = 'Invalid token format'
    isValidating.value = false
    return
  }

  try {
    await $fetch('/api/shortlink/consume', {
      method: 'GET',
      query: { token: token.value },
    })

    isValid.value = true

    setTimeout(() => {
      location.href = '/'
    }, 2000)
  }
  catch (error: any) {
    validationError.value = error.data?.message || 'Invalid or expired token'
    isValid.value = false
  }
  finally {
    isValidating.value = false
  }
}

onMounted(() => {
  validateToken()
})

watch(() => route.query.token, () => {
  if (route.query.token) {
    isValidating.value = true
    validationError.value = null
    isValid.value = false
    validateToken()
  }
})
</script>

<template>
  <UDashboardPanel :ui="{ body: 'flex items-center justify-center' }">
    <template #body>
      <UCard class="w-full max-w-md">
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              :name="isValidating ? 'i-lucide-loader-circle' : isValid ? 'i-lucide-shield-check' : 'i-lucide-shield-alert'"
              class="size-6"
              :class="{
                'animate-spin text-primary': isValidating,
                'text-success': isValid,
                'text-error': !isValidating && !isValid,
              }"
            />
            <h2 class="text-xl font-semibold">
              {{ isValidating ? 'Validating Token' : isValid ? 'Token Valid' : 'Validation Failed' }}
            </h2>
          </div>
        </template>

        <!-- Loading state -->
        <div
          v-if="isValidating"
          class="space-y-4"
        >
          <div class="space-y-2">
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>

          <div class="flex items-center gap-2 text-sm text-muted">
            <span>Verifying your access token...</span>
          </div>

          <UProgress animation="carousel" />
        </div>

        <!-- Success state -->
        <div
          v-else-if="isValid"
          class="space-y-4"
        >
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            title="Access Granted"
            description="Token validated successfully. Redirecting to dashboard..."
          />

          <div class="flex items-center justify-center">
            <UIcon
              name="i-lucide-loader-circle"
              class="size-5 animate-spin text-success"
            />
          </div>
        </div>

        <!-- Error state -->
        <div
          v-else
          class="space-y-4"
        >
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-circle-x"
            title="Access Denied"
            :description="validationError || 'Unable to validate token'"
          />

          <div class="space-y-3">
            <p class="text-sm text-muted">
              The token in your URL is invalid or has expired. Please check your link or request a new one.
            </p>
          </div>
        </div>

        <template #footer>
          <div class="text-xs text-muted">
            <p>Token: <code class="text-highlighted">{{ token || 'Not provided' }}</code></p>
          </div>
        </template>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
