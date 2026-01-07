<script setup lang="ts">
const { isFree } = useAuth()

// Only fetch for PRO users to avoid 402 errors in console
const { data, pending } = isFree.value
  ? { data: ref(null), pending: ref(false) }
  : await useLazyFetch('/api/analytics/insights')

const insights = computed(() => data.value?.data ?? [])

// Mock insights for FREE users preview
const mockInsights = [
  'Pengeluaran bulan ini naik 15% dibanding bulan lalu...',
  'Kategori terbesar adalah Makanan dengan 45% dari total...',
  'Pemasukan rata-rata Rp 5.000.000 per bulan...',
]
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
            <div class="flex items-center gap-2">
              <div class="text-sm font-semibold">
                Jolt AI Insights
              </div>
              <UBadge
                v-if="isFree"
                label="PRO"
                color="primary"
                variant="subtle"
                size="xs"
              />
            </div>
            <div class="text-xs text-dimmed">
              Analisis keuangan yang disesuaikan secara pribadi
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- FREE User: Blurred Preview with Upgrade Prompt -->
    <div
      v-if="isFree"
      class="relative"
    >
      <!-- Blurred mock content -->
      <div class="blur-sm pointer-events-none select-none space-y-3">
        <div
          v-for="(insight, index) in mockInsights"
          :key="index"
          class="flex gap-3 items-start"
        >
          <div class="size-6 rounded-full bg-primary/10 text-primary text-xs font-semibold flex items-center justify-center shrink-0">
            {{ index + 1 }}
          </div>
          <p class="text-sm text-muted leading-relaxed">
            {{ insight }}
          </p>
        </div>
      </div>

      <!-- Upgrade overlay -->
      <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-elevated/60 backdrop-blur-[2px] rounded-lg">
        <div class="flex items-center gap-2">
          <UIcon
            name="i-lucide-lock"
            class="size-5 text-primary"
          />
          <span class="text-sm font-medium">Insights Terkunci</span>
        </div>
        <UButton
          label="Upgrade ke PRO"
          icon="i-lucide-sparkles"
          size="sm"
          to="/profile"
        />
      </div>
    </div>

    <!-- Loading State (PRO only) -->
    <div
      v-else-if="pending"
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

    <!-- Empty State (PRO only) -->
    <UEmpty
      v-else-if="!insights.length"
      icon="i-lucide-brain"
      title="No insights yet"
      description="Add more transactions to get personalized AI insights about your finances."
      variant="naked"
    />

    <!-- Insights List (PRO only) -->
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
