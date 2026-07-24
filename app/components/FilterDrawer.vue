<script setup lang="tsx">
import z from 'zod'

const emit = defineEmits<{
  close: [boolean]
  apply: [Schema]
}>()

const { data } = await useFetch('/api/categories')

const schema = z.object({
  type: z.enum(['all', 'income', 'expense']),
  categories: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  type: 'all',
  categories: undefined,
  startDate: undefined,
  endDate: undefined,
})

const categories = computed(() => {
  if (!data.value?.data) return []
  return data.value.data
    .filter((cat) => {
      if (state.type === 'all') return true
      return cat.type === state.type
    })
    .map((cat) => {
      return {
        label: cat.name,
        value: cat.id.toString(),
      }
    })
})

const typeItems = [
  {
    label: 'Semua',
    value: 'all',
  },
  {
    label: 'Pemasukan',
    value: 'income',
  },
  {
    label: 'Pengeluaran',
    value: 'expense',
  },
]

const handleReset = () => {
  state.type = 'all'
  state.categories = undefined
  state.startDate = undefined
  state.endDate = undefined
}

const handleApply = () => {
  emit('apply', state)
  emit('close', false)
}
</script>

<template>
  <UDrawer title="Terapkan Filter">
    <template #body>
      <UForm
        :state="state"
        :schema="schema"
        class="flex flex-col gap-4 min-h-[calc(100vh-12rem)]"
        @submit="handleApply"
      >
        <UFormField
          name="type"
          label="Jenis"
        >
          <URadioGroup
            v-model="state.type"
            :items="typeItems"
            orientation="horizontal"
            variant="card"
            @change="state.categories = undefined"
          />
        </UFormField>
        <UFormField
          name="categoryId"
          label="Kategori"
        >
          <USelectMenu
            v-model="state.categories"
            :items="categories"
            label-key="label"
            value-key="value"
            class="w-full"
            size="xl"
            multiple
          />
        </UFormField>
        <div class="flex gap-4 *:flex-1">
          <UFormField
            name="startDate"
            label="Tanggal Mulai"
          >
            <UInput
              v-model="state.startDate"
              class="w-full"
              size="xl"
              type="date"
            />
          </UFormField>
          <UFormField
            name="startDate"
            label="Tanggal Selesai"
          >
            <UInput
              v-model="state.endDate"
              class="w-full"
              size="xl"
              type="date"
            />
          </UFormField>
        </div>
        <div class="mt-auto flex gap-4">
          <UButton
            label="Reset"
            variant="subtle"
            color="neutral"
            size="xl"
            block
            @click="handleReset"
          />
          <UButton
            type="submit"
            label="Terapkan"
            variant="solid"
            size="xl"
            block
          />
        </div>
      </UForm>
    </template>
  </UDrawer>
</template>
