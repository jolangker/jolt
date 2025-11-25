<script setup lang="ts">
import { VisLine, VisDonut, VisStackedBar, VisArea, VisXYContainer, VisAxis, VisSingleContainer, VisCrosshair, VisTooltip } from '@unovis/vue'
import { colors } from '@unovis/ts'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

// Time period selector
const timePeriod = ref<'7d' | '30d' | '3m' | '6m' | 'all'>('30d')

const timePeriodOptions = [
  { value: '7d', label: 'Last 7 Days' },
  { value: '30d', label: 'Last 30 Days' },
  { value: '3m', label: 'Last 3 Months' },
  { value: '6m', label: 'Last 6 Months' },
  { value: 'all', label: 'All Time' },
]

// Calculate date range based on selected period
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

// Fetch all expenses
const { data: allExpenses } = await useFetch('/api/expenses', {
  query: computed(() => ({
    startDate: dateRange.value.start?.format('YYYY-MM-DD') ?? undefined,
    endDate: dateRange.value.end?.format('YYYY-MM-DD') ?? undefined,
  })),
})

// Calculate metrics
const totalSpent = computed(() => {
  if (!allExpenses.value?.data) return 0
  return allExpenses.value.data.reduce((sum, e) => sum + parseFloat(e.amount), 0)
})

const transactionCount = computed(() => allExpenses.value?.data?.length ?? 0)

const averageTransaction = computed(() => {
  if (!transactionCount.value) return 0
  return totalSpent.value / transactionCount.value
})

// Category breakdown
const categoryData = computed(() => {
  if (!allExpenses.value?.data) return []
  
  const categoryMap = new Map<string, number>()
  
  allExpenses.value.data.forEach(expense => {
    const current = categoryMap.get(expense.category) || 0
    categoryMap.set(expense.category, current + parseFloat(expense.amount))
  })
  
  return Array.from(categoryMap.entries()).map(([category, value]) => ({
    category,
    value,
  }))
})

// Daily spending trend
const dailyData = computed(() => {
  if (!allExpenses.value?.data || !dateRange.value.start) return []
  
  const dailyMap = new Map<string, number>()
  const start = dateRange.value.start
  const end = dateRange.value.end || dayjs()
  
  // Initialize all days with 0
  let current = start
  while (current.isBefore(end) || current.isSame(end, 'day')) {
    dailyMap.set(current.format('YYYY-MM-DD'), 0)
    current = current.add(1, 'day')
  }
  
  // Fill in actual spending
  allExpenses.value.data.forEach(expense => {
    const date = dayjs(expense.transactionDate).format('YYYY-MM-DD')
    const current = dailyMap.get(date) || 0
    dailyMap.set(date, current + parseFloat(expense.amount))
  })
  
  return Array.from(dailyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, value]) => ({
      date: dayjs(date).format('DD MMM'),
      value,
    }))
})

// Monthly comparison (last 6 months)
const monthlyData = computed(() => {
  if (!allExpenses.value?.data) return []
  
  const monthlyMap = new Map<string, number>()
  const now = dayjs()
  
  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = now.subtract(i, 'month').format('YYYY-MM')
    monthlyMap.set(month, 0)
  }
  
  // Fill in actual spending
  allExpenses.value.data.forEach(expense => {
    const month = dayjs(expense.transactionDate).format('YYYY-MM')
    if (monthlyMap.has(month)) {
      const current = monthlyMap.get(month) || 0
      monthlyMap.set(month, current + parseFloat(expense.amount))
    }
  })
  
  return Array.from(monthlyMap.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([month, value]) => ({
      date: dayjs(month).format('MMM YY'),
      value,
    }))
})

// Cumulative spending
const cumulativeData = computed(() => {
  let cumulative = 0
  return dailyData.value.map(item => {
    cumulative += item.value
    return {
      date: item.date,
      value: cumulative,
    }
  })
})

// Chart configurations
const lineX = (d: any, i: number) => i
const lineY = (d: any) => d.value
const barX = (d: any, i: number) => i
const barY = (d: any) => d.value
const donutValue = (d: any) => d.value

const currencyFormat = (d: any) => formatCurrency(d)

const lineXFormat = (d: any, i: number) => {
  return dailyData.value[i]!.date
}

const barXFormat = (d: any, i: number) => {
  const date = dayjs(monthlyData.value[i]!.date, "MMM DD")
  return date.format('MMM')
}

const template = (d: any) => {
  const date = dayjs(d.date).format('MMM DD')
  const value = formatCurrency(d.value)

  return `
    <div>
      <div class="text-sm">${date}</div>
      <div class="text-lg font-medium">${value}</div>
    </div>
  `
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

      <!-- Daily Spending Trend -->
      <UCard variant="subtle" class="mb-6">
        <div class="mb-4">
          <div class="text-sm font-semibold">
            Daily Spending Trend
          </div>
          <div class="text-xs text-dimmed">
            Track your spending over time
          </div>
        </div>
        <VisXYContainer :data="dailyData" :height="300">
          <VisLine
            :x="lineX"
            :y="lineY"
            color="var(--ui-primary)"
          />
          <VisArea
            :x="lineX"
            :y="lineY"
            :opacity="0.1"
            color="var(--ui-primary)"
          />
          <VisTooltip />
          <VisAxis type="x" :grid-line="false" :tick-format="lineXFormat" />
          <VisAxis type="y" :grid-line="false" :tick-format="currencyFormat" />
          <VisCrosshair :template="template" color="var(--ui-primary)" />
        </VisXYContainer>
      </UCard>

      <!-- Category Breakdown -->
      <UCard variant="subtle" class="mb-6">
        <div class="mb-4">
          <div class="text-sm font-semibold">
            Spending by Category
          </div>
          <div class="text-xs text-dimmed">
            See where your money goes
          </div>
        </div>
        <VisSingleContainer :data="categoryData" :height="300">
          <VisDonut :value="donutValue" :arc-width="0" />
        </VisSingleContainer>
        <div v-if="categoryData.length > 0" class="mt-4 space-y-2">
          <div
            v-for="(item, index) in categoryData"
            :key="item.category"
            class="flex items-center justify-between text-sm"
          >
            <div class="flex items-center gap-2">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: colors[index % colors.length] }"
              />
              <span>{{ item.category }}</span>
            </div>
            <span class="font-semibold">{{ formatCurrency(item.value) }}</span>
          </div>
        </div>
      </UCard>

      <!-- Monthly Comparison -->
      <UCard variant="subtle" class="mb-6">
        <div class="mb-4">
          <div class="text-sm font-semibold">
            Monthly Comparison
          </div>
          <div class="text-xs text-dimmed">
            Last 6 months spending
          </div>
        </div>
        <VisXYContainer :data="monthlyData" :height="300">
          <VisStackedBar
            :x="barX"
            :y="barY"
            color="var(--ui-primary)"
          />
          <VisAxis type="x" :grid-line="false" :tick-format="barXFormat" />
          <VisAxis type="y" :grid-line="false" :tick-format="currencyFormat" />
        </VisXYContainer>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
