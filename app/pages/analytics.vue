<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const timePeriod = ref<'7d' | '30d' | '3m' | '6m' | 'all'>('30d')

const timePeriodOptions: { value: '7d' | '30d' | '3m' | '6m' | 'all'; label: string }[] = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: 'all', label: 'All Time' },
]

const dateRange = computed(() => {
  const now = dayjs()
  switch (timePeriod.value) {
    case '7d':
      return { start: now.subtract(7, 'day'), end: now }
    case '30d':
      return { start: now.subtract(30, 'day'), end: now }
    case '3m':
      return { start: now.subtract(3, 'month'), end: now }
    case '6m':
      return { start: now.subtract(6, 'month'), end: now }
    case 'all':
      return { start: null, end: null }
    default:
      return { start: now.subtract(30, 'day'), end: now }
  }
})

const { data: transactions } = await useFetch('/api/transactions', {
  query: computed(() => ({
    startDate: dateRange.value.start?.format('YYYY-MM-DD') ?? undefined,
    endDate: dateRange.value.end?.format('YYYY-MM-DD') ?? undefined,
  })),
})

const totalSpent = computed(() => {
  if (!transactions.value?.data) return 0
  return transactions.value.data.reduce((sum, e) => sum + parseFloat(e.amount), 0)
})

const transactionCount = computed(() => transactions.value?.data?.length ?? 0)

const averageTransaction = computed(() => {
  if (!transactionCount.value) return 0
  return totalSpent.value / transactionCount.value
})

const categoryData = computed(() => {
  if (!transactions.value?.data) return []
  
  const categoryMap = new Map<string, number>()
  
  transactions.value.data.forEach(transaction => {
    const current = categoryMap.get(transaction.category.name) || 0
    categoryMap.set(transaction.category.name, current + parseFloat(transaction.amount))
  })
  
  return Array.from(categoryMap.entries()).map(([category, value]) => ({
    category,
    value,
  }))
})

const dailyData = computed(() => {
  if (!transactions.value?.data || !dateRange.value.start) return []
  
  const dailyMap = new Map<string, number>()
  const start = dateRange.value.start
  const end = dateRange.value.end || dayjs()
  
  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dailyMap.set(current.format('YYYY-MM-DD'), 0)
    current = current.add(1, 'day')
  }
  
  transactions.value.data.forEach(transaction => {
    const date = dayjs(transaction.date).format('YYYY-MM-DD')
    const current = dailyMap.get(date) || 0
    dailyMap.set(date, current + parseFloat(transaction.amount))
  })
  
  return Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date: dayjs(date).format('DD MMM'),
      value,
    }))
})

const monthlyData = computed(() => {
  if (!transactions.value?.data) return []
  
  const monthlyMap = new Map<string, number>()
  const now = dayjs()
  
  for (let i = 5; i >= 0; i--) {
    const month = now.subtract(i, 'month').format('YYYY-MM')
    monthlyMap.set(month, 0)
  }
  
  transactions.value.data.forEach(transaction => {
    const month = dayjs(transaction.date).format('YYYY-MM')
    if (monthlyMap.has(month)) {
      const current = monthlyMap.get(month) || 0
      monthlyMap.set(month, current + parseFloat(transaction.amount))
    }
  })
  
  return Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({
      date: dayjs(month).format('MMM YY'),
      value,
    }))
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
            Analytics
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- Time Period Selector -->
      <div class="mb-6">
        <div class="flex gap-2 overflow-x-auto pb-2">
          <button
            v-for="option in timePeriodOptions"
            :key="option.value"
            type="button"
            class="px-4 py-2 text-sm rounded-lg border transition-colors whitespace-nowrap"
            :class="[
              timePeriod === option.value
                ? 'bg-primary text-white border-primary'
                : 'bg-background border-border text-dimmed hover:border-primary'
            ]"
            @click="timePeriod = option.value"
          >
            {{ option.label }}
          </button>
        </div>
      </div>

      <!-- Overview Metrics -->
      <div class="grid grid-cols-2 gap-4 mb-6">
        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Total Spent
            </div>
            <div class="text-2xl font-bold text-highlighted">
              {{ formatCurrency(totalSpent) }}
            </div>
          </div>
        </UCard>

        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Transactions
            </div>
            <div class="text-2xl font-bold text-highlighted">
              {{ transactionCount }}
            </div>
          </div>
        </UCard>

        <UCard variant="subtle" class="col-span-2">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Average per Transaction
            </div>
            <div class="text-2xl font-bold text-primary">
              {{ formatCurrency(averageTransaction) }}
            </div>
          </div>
        </UCard>
      </div>

      <AnalyticDailyChart :data="dailyData" />
      <AnalyticCategoryChart :data="categoryData" />
      <AnalyticMonthlyChart :data="monthlyData" />
    </template>
  </UDashboardPanel>
</template>
