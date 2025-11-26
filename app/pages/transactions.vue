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
          <USelect v-model="type" :items="types" class="w-40"  />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- Transactions List -->
      <div>
        <div class="flex flex-col gap-3">
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
