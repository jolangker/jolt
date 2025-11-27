<script setup lang="ts">
import type { Transaction } from '~~/shared/types'

const props = defineProps<{
  transaction: Transaction
}>()

const emit = defineEmits<{
  close: [boolean]
  edit: [Transaction]
}>()

const onEdit = () => {
  emit('edit', props.transaction)
}
</script>

<template>
  <UDrawer
    @update:open="(value) => emit('close', value)"
  >
    <template #body>
      <div class="flex flex-col gap-6">
        <!-- Amount Section -->
        <div class="flex flex-col items-center justify-center py-8 gap-2">
          <div class="text-sm text-muted uppercase tracking-wider font-medium">
            Amount
          </div>
          <div
            class="text-4xl font-bold"
            :class="transaction.type === 'expense' ? 'text-error' : 'text-success'"
          >
            {{ formatCurrency(transaction.amount) }}
          </div>
        </div>

        <!-- Details Grid -->
        <div class="grid gap-4">
          <div class="flex items-center gap-4 p-4 rounded-xl bg-elevated">
            <UIcon
              :name="`${transaction.category.icon || 'i-solar:bill-list'}-outline`"
              :size="32"
              class="text-muted"
            />
            <div>
              <div class="text-xs text-muted mb-0.5">
                Category
              </div>
              <div class="font-medium">
                {{ transaction.category.name }}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-4 p-4 rounded-xl bg-elevated">
            <UIcon
              name="i-solar:calendar-outline"
              :size="32"
              class="text-muted"
            />
            <div>
              <div class="text-xs text-muted mb-0.5">
                Date
              </div>
              <div class="font-medium">
                {{ formatDate(transaction.date) }}
              </div>
            </div>
          </div>

          <div
            v-if="transaction.note"
            class="flex items-start gap-4 p-4 rounded-xl bg-elevated"
          >
            <UIcon
              name="i-solar:notes-outline"
              :size="32"
              class="text-muted"
            />
            <div>
              <div class="text-xs text-muted mb-0.5">
                Note
              </div>
              <div class="font-medium break-all">
                {{ transaction.note }}
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="mt-auto pt-6 flex gap-2">
          <UButton
            size="xl"
            block
            color="error"
            variant="subtle"
            icon="i-solar:trash-bin-2-outline"
          >
            Delete
          </UButton>
          <UButton
            size="xl"
            block
            color="primary"
            variant="solid"
            icon="i-solar:pen-new-square-outline"
            @click="onEdit"
          >
            Edit Transaction
          </UButton>
        </div>
      </div>
    </template>
  </UDrawer>
</template>
