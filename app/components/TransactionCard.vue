<script setup lang="ts">
import type { Transaction } from '~~/shared/types';

defineProps<{ transaction: Transaction }>()
</script>

<template>
  <UCard variant="subtle">
    <div class="flex items-center gap-3">
      <UAvatar
        icon="i-solar:cash-out-bold"
        size="2xl"
        :ui="{ root: 'bg-accented' }"
      />
      <div class="flex-1 overflow-hidden">
        <div class="text-sm font-medium text-ellipsis whitespace-nowrap">
          {{ transaction.note }}
        </div>
        <div class="text-xs text-dimmed">
          {{ formatDate(transaction.date) }} • {{ transaction.category.name }}
        </div>
      </div>
      <div class="shrink-0 text-sm font-semibold" :class="transaction.type === 'expense' ? 'text-error' : 'text-success'">
        {{ formatCurrency(transaction.amount) }}
      </div>
    </div>
  </UCard>
</template>