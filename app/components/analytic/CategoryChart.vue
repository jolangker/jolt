<script setup lang="ts">
import { Donut } from '@unovis/ts'
import { VisBulletLegend, VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue'

interface DataRecord {
  category: string
  sum: number
}

const props = defineProps<{
  startDate: string | undefined
  endDate: string | undefined
  isLocked?: boolean
}>()

const type = ref<'income' | 'expense'>('income')

// Mock data for locked state
const mockData: DataRecord[] = [
  { category: 'Gaji', sum: 15000000 },
  { category: 'Freelance', sum: 5000000 },
  { category: 'Investasi', sum: 3000000 },
  { category: 'Lainnya', sum: 2000000 },
]

// Only fetch if not locked
const { data } = props.isLocked
  ? { data: ref(null) }
  : await useFetch('/api/analytics/categories-breakdown', {
      query: computed(() => ({
        type: type.value,
        startDate: props.startDate,
        endDate: props.endDate,
      })),
    })

// Use mock data when locked, real data otherwise
const categories = computed(() => {
  if (props.isLocked) return mockData
  return data.value?.data ?? []
})

const total = computed(() => categories.value.reduce((sum, e) => sum + e.sum, 0))

const value = (d: DataRecord) => d.sum
const legends = computed(() => categories.value.map(d => ({ name: d.category })))

const getPercentage = (value: number) => {
  return (value / total.value) * 100
}

const triggers = {
  [Donut.selectors.segment]: (d: { data: DataRecord }) => {
    return `<div>
            <div class="text-xs">${d.data.category}</div>
            <div class="text-xs font-medium">${formatCurrency(d.data.sum)} (${getPercentage(d.data.sum).toFixed(2)}%)</div>
        </div>`
  },
}

const items = [
  { label: 'Pemasukan', value: 'income' as const },
  { label: 'Pengeluaran', value: 'expense' as const },
]
</script>

<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex justify-between items-start">
        <div class="flex items-center gap-2">
          <div>
            <div class="text-sm font-semibold capitalize">
              Pembagian per kategori
            </div>
            <div class="text-xs text-dimmed">
              Lihat pembagian pemasukan/pengeluaran per kategori
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
        <USelect
          v-model="type"
          class="w-40"
          :items="items"
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
        <VisSingleContainer
          :data="categories"
          :height="300"
        >
          <VisDonut
            :value="value"
            :arc-width="0"
          />
          <VisBulletLegend
            :items="legends"
            label-class-name="capitalize"
            class="mb-4"
          />
        </VisSingleContainer>
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
        v-if="!categories.length"
        icon="i-lucide-pie-chart"
        title="Tidak ada data"
        :description="`Tidak ada data ${type} untuk periode yang dipilih. Coba perbarui rentang tanggal.`"
        variant="naked"
        class="h-[300px]"
      />
      <VisSingleContainer
        v-else
        :data="categories"
        :height="300"
      >
        <VisDonut
          :value="value"
          :arc-width="0"
        />
        <VisBulletLegend
          :items="legends"
          label-class-name="capitalize"
          class="mb-4"
        />
        <VisTooltip :triggers="triggers" />
      </VisSingleContainer>
    </template>
  </UCard>
</template>
