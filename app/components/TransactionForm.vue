<script setup lang="ts">
import z from 'zod'
import type { Transaction } from '~~/shared/types'

const props = defineProps<{
  transaction?: Transaction
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const loading = ref(false)

const toast = useToast()

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number(),
  date: z.string(),
  note: z.string(),
  categoryId: z.number(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Partial<Schema>>({
  type: 'income',
  amount: undefined,
  date: undefined,
  note: undefined,
  categoryId: undefined,
})

const { data } = await useFetch('/api/categories')
const categories = computed(() => {
  if (!data.value) return []
  return data.value.data
    .filter(category => category.type === state.type)
    .map(category => ({
      label: category.name,
      value: category.id,
    }))
})

const onSubmit = async () => {
  loading.value = true
  const payload = {
    ...state,
    amount: state.amount?.toString(),
  }
  try {
    if (props.transaction) {
      await $fetch(`/api/transactions/${props.transaction.id}`, {
        method: 'PUT',
        body: payload,
      })
    }
    else {
      await $fetch('/api/transactions', {
        method: 'POST',
        body: payload,
      })
    }
    refreshNuxtData()
    emit('close', false)
    toast.add({
      title: 'Transaction saved successfully',
      description: 'Your transaction has been saved successfully',
      color: 'success',
      icon: 'i-solar:check-circle-outline',
    })
  }
  catch {
    toast.add({
      title: 'Transaction saved failed',
      description: 'Your transaction has been saved failed',
      color: 'error',
      icon: 'i-solar:close-circle-outline',
    })
  }
  finally {
    loading.value = false
  }
}

const onOpen = (val: boolean) => {
  emit('close', val)
  if (!val) {
    state.type = 'income'
    state.amount = undefined
    state.date = undefined
    state.note = undefined
    state.categoryId = undefined
  }

  if (val && props.transaction) {
    state.type = props.transaction.type
    state.amount = parseFloat(props.transaction.amount)
    state.date = dayjs(props.transaction.date).format('YYYY-MM-DD')
    state.note = props.transaction.note
    state.categoryId = props.transaction.categoryId
  }
}
</script>

<template>
  <UDrawer
    :title="props.transaction ? 'Edit Transaction' : 'Add Transaction'"
    @update:open="onOpen"
  >
    <template #body>
      <UForm
        :state="state"
        :schema="schema"
        class="min-h-[calc(100vh-10rem)] flex flex-col gap-y-4"
        @submit="onSubmit"
      >
        <UFormField
          size="lg"
          name="type"
          label="Type"
        >
          <USelect
            v-model="state.type"
            :items="['income', 'expense']"
            class="w-full capitalize"
            :ui="{ item: 'capitalize' }"
            @change="state.categoryId = undefined"
          />
        </UFormField>
        <UFormField
          size="lg"
          name="categoryId"
          label="Category"
        >
          <USelect
            v-model="state.categoryId"
            :items="categories"
            class="w-full"
          />
        </UFormField>
        <div class="flex gap-4">
          <UFormField
            class="flex-1"
            size="lg"
            name="amount"
            label="Amount"
          >
            <UInput
              v-model="state.amount"
              type="number"
              placeholder="Amount"
              class="w-full"
            />
          </UFormField>
          <UFormField
            class="flex-1"
            size="lg"
            name="date"
            label="Date"
          >
            <UInput
              v-model="state.date"
              type="date"
              placeholder="Date"
              class="w-full"
            />
          </UFormField>
        </div>
        <UFormField
          size="lg"
          name="note"
          label="Note"
        >
          <UTextarea
            v-model="state.note"
            placeholder="Note"
            class="w-full"
            :rows="4"
          />
        </UFormField>
        <UButton
          :loading="loading"
          class="mt-auto"
          type="submit"
          size="xl"
          block
        >
          Save Transaction
        </UButton>
      </UForm>
    </template>
  </UDrawer>
</template>
