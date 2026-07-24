<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const timePeriod = ref<'7d' | '30d' | '3m' | '6m' | 'all'>('30d')

const timePeriodOptions: { value: '7d' | '30d' | '3m' | '6m' | 'all', label: string }[] = [
  { value: '7d', label: '7 Hari Terakhir' },
  { value: '30d', label: '30 Hari Terakhir' },
  { value: '3m', label: '3 Bulan Terakhir' },
  { value: '6m', label: '6 Bulan Terakhir' },
  { value: 'all', label: 'Semua Waktu' },
]

const dateRange = computed(() => {
  const now = dayjs()
  switch (timePeriod.value) {
    case '7d':
      return { start: now.subtract(7, 'day').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD') }
    case '30d':
      return { start: now.subtract(30, 'day').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD') }
    case '3m':
      return { start: now.subtract(3, 'month').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD') }
    case '6m':
      return { start: now.subtract(6, 'month').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD') }
    case 'all':
      return { start: undefined, end: undefined }
    default:
      return { start: now.subtract(30, 'day').format('YYYY-MM-DD'), end: now.format('YYYY-MM-DD') }
  }
})

const { data: summary } = await useFetch('/api/analytics/summary', {
  query: computed(() => ({
    startDate: dateRange.value.start,
    endDate: dateRange.value.end,
  })),
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
            Analitik
          </div>
        </template>
        <template #right>
          <USelectMenu
            v-model="timePeriod"
            :items="timePeriodOptions"
            class="w-40"
            value-key="value"
            label-key="label"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="grid grid-cols-2 gap-4">
        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Pemasukan
            </div>
            <div class="text-2xl font-semibold text-success">
              {{ formatCurrency(summary?.data.income) }}
            </div>
          </div>
        </UCard>
        <UCard variant="subtle">
          <div class="flex flex-col gap-1">
            <div class="text-xs text-dimmed">
              Pengeluaran
            </div>
            <div class="text-2xl font-semibold text-error">
              {{ formatCurrency(summary?.data.expense) }}
            </div>
          </div>
        </UCard>
      </div>

      <div>
        <AnalyticDailyChart
          :start-date="dateRange.start"
          :end-date="dateRange.end"
        />
      </div>
      <div>
        <AnalyticCategoryChart
          :start-date="dateRange.start"
          :end-date="dateRange.end"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
