<script setup lang="ts">
import { LazyTransactionDetails, LazyTransactionForm } from '#components'
import type { Transaction } from '~~/shared/types'

const props = defineProps<{ transaction: Transaction }>()

const overlay = useOverlay()

const transactionForm = overlay.create(LazyTransactionForm)
const transactionDetails = overlay.create(LazyTransactionDetails)

const openTransactionDetails = () => {
  transactionDetails.open({
    transaction: props.transaction,
    onEdit: () => {
      transactionDetails.close()
      transactionForm.open({
        transaction: props.transaction,
      })
    },
  })
}
</script>

<template>
  <UCard
    variant="subtle"
    class="cursor-pointer"
    @click="openTransactionDetails"
  >
    <div class="flex items-center gap-3">
      <UAvatar
        :icon="`${transaction.category.icon || 'i-solar:cash-out'}-outline`"
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
      <div
        class="shrink-0 text-sm font-semibold"
        :class="transaction.type === 'expense' ? 'text-error' : 'text-success'"
      >
        {{ formatCurrency(transaction.amount) }}
      </div>
    </div>
  </UCard>
</template>
