<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const { data: transactions } = await useFetch('/api/transactions', {
  query: {
    limit: 5,
  },
})

const { data: summary } = await useFetch('/api/analytics/summary')
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
      <div class="mb-6 mx-auto w-full max-w-2xl flex flex-col items-center gap-1">
        <div class="text-dimmed">
          Nett Balance
        </div>
        <div class="text-4xl font-bold text-primary">
          {{ formatCurrency(summary?.data?.nett) }}
        </div>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Total Income
            </div>
            <div class="text-xl font-semibold text-success">
              {{ formatCurrency(summary?.data.income) }}
            </div>
          </div>
        </UCard>
        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Total Expense
            </div>
            <div class="text-xl font-semibold text-error">
              {{ formatCurrency(summary?.data.expense) }}
            </div>
          </div>
        </UCard>
      </div>

      <div>
        <div class="flex justify-between items-center mb-2">
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

        <div
          v-if="transactions?.data?.length === 0"
          class="text-center py-8 text-dimmed"
        >
          No transactions this month
        </div>

        <div
          v-else
          class="flex flex-col gap-3"
        >
          <TransactionCard
            v-for="transaction in transactions?.data"
            :key="transaction.id"
            :transaction="transaction"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
