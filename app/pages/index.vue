<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

// Get current month start and end dates
const now = dayjs()
const startOfMonth = now.startOf('month').format('YYYY-MM-DD')
const endOfMonth = now.endOf('month').format('YYYY-MM-DD')

// Fetch current month expenses
const { data: expenses } = useFetch('/api/expenses', {
  query: {
    startDate: startOfMonth,
    endDate: endOfMonth,
  },
})

// Calculate metrics
const totalSpent = computed<number>(() => {
  if (!expenses.value?.data) return 0
  let amount = 0
  for (const expense of expenses.value.data) {
    amount += parseFloat(expense.amount)
  }
  return amount
})

const transactionCount = computed(() => {
  return expenses.value?.data?.length ?? 0
})

const averagePerTransaction = computed(() => {
  if (!transactionCount.value) return 0
  return totalSpent.value / transactionCount.value
})

const highestExpense = computed(() => {
  if (!expenses.value?.data?.length) return 0
  return Math.max(...expenses.value.data.map(e => parseFloat(e.amount)))
})

// Get recent 5 transactions
const recentTransactions = computed(() => {
  return expenses.value?.data?.slice(0, 5) ?? []
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
          <div class="font-bold text-2xl tracking-wider text-highlighted">
            Jolt
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- This Month Header -->
      <div class="mx-auto w-full max-w-2xl flex flex-col items-center gap-1 mb-6">
        <div class="text-dimmed">
          This Month Spend
        </div>
        <div class="text-4xl font-bold text-highlighted">
          {{ formatCurrency(totalSpent) }}
        </div>
        <div class="text-xs text-dimmed">
          {{ now.format('MMMM YYYY') }}
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Transactions
            </div>
            <div class="text-2xl font-semibold text-highlighted">
              {{ transactionCount }}
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Average
            </div>
            <div class="text-2xl font-semibold text-highlighted">
              {{ formatCurrency(averagePerTransaction) }}
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Highest
            </div>
            <div class="text-2xl font-semibold text-error">
              {{ formatCurrency(highestExpense) }}
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Daily Avg
            </div>
            <div class="text-2xl font-semibold text-primary">
              {{ formatCurrency(totalSpent / now.date()) }}
            </div>
          </div>
        </UCard>
      </div>

      <!-- Recent Transactions -->
      <div class="mt-6">
        <div class="flex justify-between items-center mb-3">
          <div class="text-lg font-semibold">
            Recent Transactions
          </div>
          <NuxtLink
            to="/transactions"
            class="text-sm text-primary hover:underline"
          >
            View All
          </NuxtLink>
        </div>
        
        <div v-if="recentTransactions.length === 0" class="text-center py-8 text-dimmed">
          No transactions this month
        </div>
        
        <div v-else class="flex flex-col gap-3">
          <UCard
            v-for="expense in recentTransactions"
            :key="expense.id"
            variant="subtle"
          >
            <div class="flex items-center gap-3">
              <UAvatar
                icon="i-solar:cash-out-bold"
                size="2xl"
                :ui="{ root: 'bg-accented' }"
              />
              <div class="flex-1 overflow-hidden">
                <div class="text-sm font-medium text-ellipsis whitespace-nowrap">
                  {{ expense.note }}
                </div>
                <div class="text-xs text-dimmed">
                  {{ formatDate(expense.transactionDate) }} • {{ expense.category }}
                </div>
              </div>
              <div class="shrink-0 text-error text-sm font-semibold">
                {{ formatCurrency(expense.amount) }}
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
