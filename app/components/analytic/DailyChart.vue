<script setup lang="ts">
import { VisArea, VisAxis, VisCrosshair, VisLine, VisTooltip, VisXYContainer } from '@unovis/vue';

interface DataRecord {
    date: string;
    value: number;
}

const props = defineProps<{
    data: DataRecord[]
}>()

const x = (_d: DataRecord , i: number) => i
const y = (d: DataRecord) => d.value

const xFormat = (d: number, i: number) => {
    const date = dayjs(props.data[i]!.date)
    return date.format('DD MMM')
}
const yFormat = (d: number) => formatCurrency(d, true)

const template = (d: DataRecord) => {
  const date = dayjs(d.date).format('DD MMM')
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
    <UCard variant="subtle" class="mb-6">
        <div class="mb-4">
          <div class="text-sm font-semibold">
            Daily Spending Trend
          </div>
          <div class="text-xs text-dimmed">
            Track your spending over time
          </div>
        </div>
        <VisXYContainer :data="data" :height="300">
          <VisLine
            :x="x"
            :y="y"
            color="var(--ui-error)"
          />
          <VisArea
            :x="x"
            :y="y"
            :opacity="0.1"
            color="var(--ui-error)"
          />
          <VisTooltip />
          <VisAxis type="x" :grid-line="false" :tick-format="xFormat" />
          <VisAxis type="y" :grid-line="false" :tick-format="yFormat" />
          <VisCrosshair :template="template" color="var(--ui-error)" />
        </VisXYContainer>
      </UCard>
</template>