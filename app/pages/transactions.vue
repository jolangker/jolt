<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const type = ref('all')

const { data: transactions } = await useFetch('/api/transactions', {
  query: computed(() => ({
    type: type.value === 'all' ? undefined : type.value,
  })),
})

const types = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
]
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
            All Transactions
          </div>
        </template>
        <template #right>
          <USelect
            v-model="type"
            :items="types"
            class="w-40"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <template v-if="transactions?.data?.length">
        <TransactionCard
          v-for="transaction in transactions?.data"
          :key="transaction.id"
          :transaction="transaction"
        />
      </template>
      <UEmpty
        v-else
        icon="i-solar:wallet-2-outline"
        title="No transactions found"
        description="You have no transactions yet"
        variant="naked"
      />
    </template>
  </UDashboardPanel>
</template>
