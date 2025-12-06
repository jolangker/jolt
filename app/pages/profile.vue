<script setup lang="ts">
import { LazyExportModal } from '#components'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const { user } = useUserSession()
const { data: summary } = await useFetch('/api/analytics/summary')

const memberSince = computed(() => {
  if (!user.value?.createdAt) return 'N/A'
  return formatDate(user.value.createdAt)
})

const overlay = useOverlay()
const exportModal = overlay.create(LazyExportModal)

const openExportModal = () => {
  exportModal.open()
}
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
      <div class="flex flex-col items-center mb-8">
        <UAvatar
          icon="i-lucide:user"
          size="3xl"
          class="mb-4"
        />
        <div class="text-xl font-bold text-highlighted">
          {{ user?.telegramUsername || 'User' }}
        </div>
        <div class="text-sm text-dimmed mb-4">
          @{{ user?.telegramUsername || 'username' }}
        </div>
        <UButton
          label="Export Data"
          icon="i-solar:export-outline"
          color="neutral"
          variant="outline"
          size="md"
          @click="openExportModal"
        />
      </div>

      <div class="space-y-4 mb-6">
        <div class="text-sm font-semibold mb-3">
          Account Information
        </div>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide:user"
                class="w-5 h-5 text-primary"
              />
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
              <UIcon
                name="i-lucide:hash"
                class="w-5 h-5 text-primary"
              />
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
              <UIcon
                name="i-lucide:calendar"
                class="w-5 h-5 text-primary"
              />
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

      <div class="space-y-4 mb-6">
        <div class="text-sm font-semibold mb-3">
          Settings
        </div>

        <UCard
          variant="subtle"
          class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          @click="navigateTo('/categories')"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide:tag"
                class="w-5 h-5 text-primary"
              />
              <div>
                <div class="text-sm font-medium">
                  Manage Categories
                </div>
                <div class="text-xs text-dimmed">
                  Customize your income and expense categories
                </div>
              </div>
            </div>
            <UIcon
              name="i-lucide:chevron-right"
              class="w-5 h-5 text-dimmed"
            />
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
              <UIcon
                name="i-lucide:receipt"
                class="w-5 h-5 text-primary"
              />
              <div>
                <div class="text-xs text-dimmed">
                  Total Transactions
                </div>
                <div class="text-2xl font-bold text-highlighted">
                  {{ summary?.data.count }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide:wallet"
                class="w-5 h-5 text-primary"
              />
              <div>
                <div class="text-xs text-dimmed">
                  Total Spent (All Time)
                </div>
                <div class="text-2xl font-bold text-error">
                  {{ formatCurrency(summary?.data.expense) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
        <UCard variant="subtle">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide:wallet"
                class="w-5 h-5 text-primary"
              />
              <div>
                <div class="text-xs text-dimmed">
                  Total Income (All Time)
                </div>
                <div class="text-2xl font-bold text-success">
                  {{ formatCurrency(summary?.data.income) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
