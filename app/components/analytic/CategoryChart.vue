<script setup lang="ts">
import { Donut } from '@unovis/ts';
import { VisBulletLegend, VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue';

interface DataRecord {
    category: string;
    value: number;
}

const props = defineProps<{
    data: DataRecord[]
}>()

const total = computed(() => props.data.reduce((sum, e) => sum + e.value, 0))

const value = (d: DataRecord) => d.value
const items = computed(() => props.data.map((d) => ({ name: d.category })))

const getPercentage = (value: number) => {
    return (value / total.value) * 100
}

const triggers = {
    [Donut.selectors.segment]: (d: { data: DataRecord }) => {
        return `<div>
            <div class="text-sm capitalize">${d.data.category}</div>
            <div class="font-semibold">${formatCurrency(d.data.value)} (${getPercentage(d.data.value).toFixed(2)}%)</div>
        </div>`
    }
}
</script>

<template>
    <UCard variant="subtle" class="mb-6">
        <div class="mb-4">
          <div class="text-sm font-semibold">
            Spending by Category
          </div>
          <div class="text-xs text-dimmed">
            See where your money goes
          </div>
        </div>
        <VisSingleContainer :data="data" :height="300">
          <VisDonut :value="value" :arc-width="0" />
          <VisBulletLegend :items="items" label-class-name="capitalize" class="mb-4" />
          <VisTooltip :triggers="triggers" />
        </VisSingleContainer>
    </UCard>
</template>