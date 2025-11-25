<script setup lang="ts">
import { VisAxis, VisStackedBar, VisXYContainer } from '@unovis/vue';

interface DataRecord {
    date: string;
    value: number;
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
    <UCard variant="subtle" class="mb-6">
        <div class="mb-4">
          <div class="text-sm font-semibold">
            Monthly Comparison
          </div>
          <div class="text-xs text-dimmed">
            Last 6 months spending
          </div>
        </div>
        <VisXYContainer :data="data" :height="300">
          <VisStackedBar
            :x="x"
            :y="y"
            color="var(--ui-error)"
          />
          <VisAxis type="x" :grid-line="false" :tick-format="xFormat" />
          <VisAxis type="y" :grid-line="false" :tick-format="yFormat" />
        </VisXYContainer>
    </UCard>
</template>