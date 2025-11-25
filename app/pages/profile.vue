<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

// Fetch user data - assuming there's a user endpoint
const { user } = useUserSession()

// Fetch user statistics
const { data: allExpenses } = await useFetch('/api/expenses')

const totalTransactions = computed(() => allExpenses.value?.data?.length ?? 0)

const totalSpent = computed(() => {
  if (!allExpenses.value?.data) return 0
  return allExpenses.value.data.reduce((sum, e) => sum + parseFloat(e.amount), 0)
})

const memberSince = computed(() => {
  if (!user.value?.createdAt) return 'N/A'
  return formatDate(user.value.createdAt)
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :toggle="false"
        :ui="{ root: 'border-b-0' }"
      >
        <template #left>
          <div class="font-bold text-xl">
            Profile
          </div>
        </template>
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- Profile Header -->
      <div class="flex flex-col items-center mb-8">
        <UAvatar
          icon="i-lucide:user"
          size="3xl"
          :ui="{ root: 'bg-primary' }"
          class="mb-4"
        />
        <div class="text-xl font-bold text-highlighted">
          {{ user?.telegramUsername || 'User' }}
        </div>
        <div class="text-sm text-dimmed">
          @{{ user?.telegramUsername || 'username' }}
        </div>
      </div>

      <!-- User Information -->
      <div class="space-y-4 mb-6">
        <div class="text-sm font-semibold mb-3">
          Account Information
        </div>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide:user" class="w-5 h-5 text-primary" />
              <div>
                <div class="text-xs text-dimmed">
                  Username
                </div>
                <div class="text-sm font-medium">
                  {{ user?.telegramUsername || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide:hash" class="w-5 h-5 text-primary" />
              <div>
                <div class="text-xs text-dimmed">
                  Telegram ID
                </div>
                <div class="text-sm font-medium font-mono">
                  {{ user?.telegramUserId || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide:calendar" class="w-5 h-5 text-primary" />
              <div>
                <div class="text-xs text-dimmed">
                  Member Since
                </div>
                <div class="text-sm font-medium">
                  {{ memberSince }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Statistics -->
      <div class="space-y-4">
        <div class="text-sm font-semibold mb-3">
          Your Statistics
        </div>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide:receipt" class="w-5 h-5 text-primary" />
              <div>
                <div class="text-xs text-dimmed">
                  Total Transactions
                </div>
                <div class="text-2xl font-bold text-highlighted">
                  {{ totalTransactions }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide:wallet" class="w-5 h-5 text-primary" />
              <div>
                <div class="text-xs text-dimmed">
                  Total Spent (All Time)
                </div>
                <div class="text-2xl font-bold text-error">
                  {{ formatCurrency(totalSpent) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon name="i-lucide:trending-up" class="w-5 h-5 text-primary" />
              <div>
                <div class="text-xs text-dimmed">
                  Average per Transaction
                </div>
                <div class="text-2xl font-bold text-primary">
                  {{ formatCurrency(totalTransactions > 0 ? totalSpent / totalTransactions : 0) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
