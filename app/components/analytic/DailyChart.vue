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
  isLocked?: boolean
}>()

// Mock data for locked state
const mockData: DataRecord[] = [
  { date: '2024-01-01', income: '2500000', expense: '1800000' },
  { date: '2024-01-02', income: '3200000', expense: '2100000' },
  { date: '2024-01-03', income: '1800000', expense: '2500000' },
  { date: '2024-01-04', income: '4100000', expense: '1900000' },
  { date: '2024-01-05', income: '2900000', expense: '3200000' },
  { date: '2024-01-06', income: '3500000', expense: '2400000' },
  { date: '2024-01-07', income: '2100000', expense: '2800000' },
]

const { data: categories } = await useFetch('/api/categories')
const categoriesData = computed(() => {
  if (!categories.value) return []
  return categories.value.data.map(category => ({
    label: category.name,
    value: category.id,
  }))
})

const category = ref<number[]>(categoriesData.value.map(category => category.value))

// Only fetch if not locked
const { data } = props.isLocked
  ? { data: ref(null) }
  : await useFetch('/api/analytics/daily', {
      query: computed(() => ({
        categories: category.value.join(','),
        startDate: props.startDate,
        endDate: props.endDate,
      })),
    })

// Use mock data when locked, real data otherwise
const daily = computed<DataRecord[]>(() => {
  if (props.isLocked) return mockData
  return data.value?.data ?? []
})

const x = (_d: DataRecord, i: number) => i
const y = [
  (d: DataRecord) => parseFloat(d.income),
  (d: DataRecord) => parseFloat(d.expense),
]

const xFormat = (i: number) => daily.value[i]?.date || ''
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
        <div class="flex items-center gap-2">
          <div>
            <div class="text-sm font-semibold">
              Grafik Pemasukan & Pengeluaran
            </div>
            <div class="text-xs text-dimmed">
              Lihat pemasukan dan pengeluaran Anda sepanjang waktu
            </div>
          </div>
          <UBadge
            v-if="isLocked"
            label="PRO"
            color="primary"
            variant="subtle"
            size="xs"
          />
        </div>
        <USelectMenu
          v-model="category"
          class="w-40"
          :items="categoriesData"
          multiple
          value-key="value"
          :search-input="{ placeholder: 'Search category' }"
          :disabled="isLocked"
        />
      </div>
    </template>

    <!-- Locked state with blurred chart -->
    <div
      v-if="isLocked"
      class="relative"
    >
      <div class="blur-sm pointer-events-none select-none">
        <VisXYContainer
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
        </VisXYContainer>
      </div>
      <!-- Upgrade overlay -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-elevated/60 backdrop-blur-[2px] rounded-lg">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-lock"
            class="size-5 text-primary"
          />
          <span class="text-sm font-medium">Data Historis Terkunci</span>
        </div>
        <p class="text-xs text-dimmed text-center max-w-xs">
          Upgrade ke PRO untuk melihat data lebih dari 7 hari
        </p>
        <UButton
          label="Upgrade ke PRO"
          icon="i-lucide-sparkles"
          size="sm"
          to="/profile"
        />
      </div>
    </div>

    <!-- Normal unlocked state -->
    <template v-else>
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
    </template>
  </UCard>
</template>
