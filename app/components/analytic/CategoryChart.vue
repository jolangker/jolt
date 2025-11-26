<script setup lang="ts">
import { Donut } from '@unovis/ts';
import { VisBulletLegend, VisDonut, VisSingleContainer, VisTooltip } from '@unovis/vue';

interface DataRecord {
    category: string;
    sum: number;
}

const props = defineProps<{
    startDate: string | undefined;
    endDate: string | undefined;
}>()

const type = ref<'income' | 'expense'>('income')

const { data } = await useFetch('/api/analytics/categories-breakdown', {
    query: computed(() => ({
        type: type.value,
        startDate: props.startDate,
        endDate: props.endDate,
    }))
})

const categories = computed(() => data.value?.data ?? [])

const total = computed(() => categories.value.reduce((sum, e) => sum + e.sum, 0))

const value = (d: DataRecord) => d.sum
const legends = computed(() => categories.value.map((d) => ({ name: d.category })))

const getPercentage = (value: number) => {
    return (value / total.value) * 100
}

const triggers = {
    [Donut.selectors.segment]: (d: { data: DataRecord }) => {
        return `<div>
            <div class="text-xs">${d.data.category}</div>
            <div class="text-xs font-medium">${formatCurrency(d.data.sum)} (${getPercentage(d.data.sum).toFixed(2)}%)</div>
        </div>`
    }
}
    
const items = [
    { label: 'Income', value: 'income' as const },
    { label: 'Expense', value: 'expense' as const },
]
</script>

<template>
    <UCard variant="subtle">
        <template #header>
            <div class="flex justify-between items-start">
                <div>
                    <div class="text-sm font-semibold capitalize">
                        {{ type }} Breakdown
                    </div>
                    <div class="text-xs text-dimmed">
                        See the breakdown of your {{ type }}
                    </div>
                </div>
                <USelect v-model="type" class="w-40" :items="items" />
            </div>
        </template>
        <VisSingleContainer :data="categories" :height="300">
          <VisDonut :value="value" :arc-width="0" />
          <VisBulletLegend :items="legends" label-class-name="capitalize" class="mb-4" />
          <VisTooltip :triggers="triggers" />
        </VisSingleContainer>
    </UCard>
</template>