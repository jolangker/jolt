<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const { data: expenses } = useFetch('/api/expenses/list')

const total = computed<number>(() => {
  if (!expenses.value?.data) return 0
  let amount = 0
  for (const expense of expenses.value.data) {
    amount += parseFloat(expense.amount)
  }
  return amount
})

const averagePerDay = computed(() => {
  if (!expenses.value?.data) return 0
  const start = dayjs(expenses.value.data[expenses.value.data.length - 1]!.transactionDate)
  const end = dayjs(expenses.value.data[0]!.transactionDate)
  const duration = end.diff(start, 'day')
  return total.value / duration
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
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="mx-auto w-max flex flex-col items-center gap-1">
        <div class="text-dimmed">
          Total Spent
        </div>
        <div class="text-3xl font-semibold text-highlighted">
          {{ formatCurrency(total) }}
        </div>
        <div class="text-primary">
          {{ formatCurrency(averagePerDay) }}/day
        </div>
      </div>
      <div class="mt-6">
        <div class="flex justify-between items-center">
          <div class="text-lg font-medium">
            Transactions
          </div>
        </div>
        <div class="mt-2 flex flex-col gap-4">
          <UCard
            v-for="expense in expenses?.data ?? []"
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
                  {{ formatDate(expense.transactionDate) }}
                </div>
              </div>
              <div class="shrink-0 text-error text-sm">
                {{ formatCurrency(expense.amount) }}
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
