<script setup lang="ts">
const { data, pending } = await useLazyFetch('/api/analytics/insights')

const insights = computed(() => data.value?.data ?? [])
</script>

<template>
  <UCard variant="subtle">
    <template #header>
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <div class="rounded-md bg-primary/10 size-10 flex items-center justify-center">
            <UIcon
              name="i-lucide-sparkles"
              class="text-primary size-5"
            />
          </div>
          <div>
            <div class="text-sm font-semibold">
              Jolt AI Insights
            </div>
            <div class="text-xs text-dimmed">
              Analisis keuangan yang disesuaikan secara pribadi
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Loading State -->
    <div
      v-if="pending"
      class="space-y-3"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="flex gap-3 items-start"
      >
        <USkeleton class="size-6 rounded-full shrink-0" />
        <div class="flex-1 space-y-2">
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <UEmpty
      v-else-if="!insights.length"
      icon="i-lucide-brain"
      title="No insights yet"
      description="Add more transactions to get personalized AI insights about your finances."
      variant="naked"
    />

    <!-- Insights List -->
    <div
      v-else
      class="space-y-3"
    >
      <div
        v-for="(insight, index) in insights"
        :key="index"
        class="flex gap-3 items-start group"
      >
        <div class="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
          {{ index + 1 }}
        </div>
        <p class="text-sm text-muted leading-relaxed">
          {{ insight }}
        </p>
      </div>
    </div>
  </UCard>
</template>
