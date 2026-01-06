<script setup lang="ts">
import { VisArea, VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/vue'

interface DataRecord {
  date: string
  income: string
  expense: string
}

const props = defineProps<{
  startDate?: string
  endDate?: string
}>()

const { data: categories } = await useFetch('/api/master/categories')
const categoriesData = computed(() => {
  if (!categories.value) return []
  return categories.value.data.map(category => ({
    label: category.name,
    value: category.id,
  }))
})

const category = ref<number[]>(categoriesData.value.map(category => category.value))

const { data } = await useFetch('/api/analytics/daily', {
  query: computed(() => ({
    categories: category.value.join(','),
    startDate: props.startDate,
    endDate: props.endDate,
  })),
})
const daily = computed<DataRecord[]>(() => data.value?.data ?? [])

const x = (_d: DataRecord, i: number) => i
const y = [
  (d: DataRecord) => parseFloat(d.income),
  (d: DataRecord) => parseFloat(d.expense),
]

const xFormat = (i: number) => daily.value[i]!.date
const yFormat = (d: number) => formatCurrency(d, true)

const template = (d: DataRecord) => {
  const date = dayjs(d.date).format('DD MMM')
  const income = formatCurrency(d.income)
  const expense = formatCurrency(d.expense)
  return `
    <div>
      <div class="text-xs">${date}</div>
      <div class="text-xs font-medium flex items-center gap-1">
        <div class="w-2 h-2 rounded-[2px] bg-success"></div>
        <div>${income}</div>
      </div>
      <div class="text-xs font-medium flex items-center gap-1">
        <div class="w-2 h-2 rounded-[2px] bg-error"></div>
        <div>${expense}</div>
      </div>
    </div>
  `
}

const colors = (d: undefined, i: number) => ['var(--ui-success)', 'var(--ui-error)'][i]
</script>

<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex justify-between items-start">
        <div>
          <div class="text-sm font-semibold">
            Grafik Pemasukan & Pengeluaran
          </div>
          <div class="text-xs text-dimmed">
            Lihat pemasukan dan pengeluaran Anda sepanjang waktu
          </div>
        </div>
        <USelectMenu
          v-model="category"
          class="w-40"
          :items="categoriesData"
          multiple
          value-key="value"
          :search-input="{ placeholder: 'Search category' }"
        />
      </div>
    </template>
    <UEmpty
      v-if="!daily.length"
      icon="i-lucide-chart-line"
      title="Tidak ada data"
      description="Tidak ada data pemasukan atau pengeluaran untuk periode yang dipilih. Coba perbarui rentang tanggal atau kategori."
      variant="naked"
      class="h-[300px]"
    />
    <VisXYContainer
      v-else
      :data="daily"
      :height="300"
    >
      <VisLine
        :x="x"
        :y="y"
        :color="colors"
      />
      <VisArea
        v-for="(yAxis, i) in y"
        :key="yAxis"
        :x="x"
        :y="yAxis"
        :opacity="0.1"
        :color="colors(undefined, i)"
      />
      <VisTooltip />
      <VisAxis
        type="x"
        :grid-line="false"
        :tick-format="xFormat"
      />
      <VisAxis
        type="y"
        :grid-line="false"
        :tick-format="yFormat"
      />
      <VisCrosshair
        :template="template"
        :color="colors"
      />
    </VisXYContainer>
  </UCard>
</template>
