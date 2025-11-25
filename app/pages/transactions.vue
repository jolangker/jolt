<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const { data: transactions } = await useFetch('/api/transactions')
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
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- Transactions List -->
      <div>
        <div class="flex flex-col gap-3">
          <UCard
            v-for="transaction in transactions?.data"
            :key="transaction.id"
            variant="subtle"
          >
            <div class="flex items-center gap-3">
              <UAvatar
                icon="i-solar:cash-out-bold"
                size="2xl"
                :ui="{ root: 'bg-accented' }"
              />
              <div class="flex-1 overflow-hidden">
                <div class="text-sm font-medium">
                  {{ transaction.note }}
                </div>
                <div class="text-xs text-dimmed">
                  {{ formatDate(transaction.date) }} • {{ transaction.category.name }}
                </div>
              </div>
              <div class="shrink-0 text-error text-sm font-semibold">
                {{ formatCurrency(transaction.amount) }}
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
