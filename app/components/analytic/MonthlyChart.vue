<script setup lang="ts">
import { VisAxis, VisStackedBar, VisXYContainer } from '@unovis/vue'

interface DataRecord {
  date: string
  value: number
}

const props = defineProps<{
  data: DataRecord[]
}>()

const x = (_d: DataRecord, i: number) => i
const y = (d: DataRecord) => d.value

const xFormat = (d: number, i: number) => {
  const date = dayjs(props.data[i]!.date)
  return date.format('MMM')
}
const yFormat = (d: number) => formatCurrency(d, true)
</script>

<template>
  <UCard
    variant="subtle"
    class="mb-6"
  >
    <div class="mb-4">
      <div class="text-sm font-semibold">
        Perbandingan Bulanan
      </div>
      <div class="text-xs text-dimmed">
        Pengeluaran 6 bulan terakhir
      </div>
    </div>
    <UEmpty
      v-if="!data?.length"
      icon="i-lucide-bar-chart-3"
      title="Data tidak tersedia"
      description="Belum ada data pengeluaran 6 bulan terakhir. Mulai catat pengeluaran untuk melihat perbandingan."
      variant="naked"
      class="h-[300px]"
    />
    <VisXYContainer
      v-else
      :data="data"
      :height="300"
    >
      <VisStackedBar
        :x="x"
        :y="y"
        color="var(--ui-error)"
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
  </UCard>
</template>
