<script setup lang="ts">
import z from 'zod'
import dayjs from 'dayjs'

const emit = defineEmits<{
  close: [boolean]
}>()

const toast = useToast()
const loading = ref(false)

const { data } = await useFetch('/api/categories')

const schema = z.object({
  type: z.enum(['all', 'income', 'expense']),
  categories: z.array(z.string()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  includeSummary: z.boolean(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  type: 'all',
  categories: undefined,
  startDate: undefined,
  endDate: undefined,
  includeSummary: true,
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
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

const handleExport = async () => {
  loading.value = true
  try {
    const query = {
      type: state.type === 'all' ? undefined : state.type,
      categories: state.categories?.join(','),
      startDate: state.startDate,
      endDate: state.endDate,
      includeSummary: state.includeSummary,
    }

    const response = await $fetch<Blob>('/api/transactions/export', {
      query,
      responseType: 'blob',
    })

    const url = window.URL.createObjectURL(response)
    const link = document.createElement('a')
    link.href = url

    // Create filename
    const date = dayjs().format('YYYY-MM-DD')
    link.setAttribute('download', `jolt-transactions-${date}.xlsx`)

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)

    toast.add({
      title: 'Export successful',
      description: 'Your transactions have been exported successfully',
      color: 'success',
      icon: 'i-solar:check-circle-outline',
    })

    emit('close', false)
  }
  catch {
    toast.add({
      title: 'Export failed',
      description: 'An error occurred while exporting transactions',
      color: 'error',
      icon: 'i-solar:close-circle-outline',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal title="Export Transactions">
    <template #body>
      <UForm
        :state="state"
        :schema="schema"
        class="flex flex-col gap-4"
        @submit="handleExport"
      >
        <UFormField
          name="type"
          label="Tipe"
        >
          <URadioGroup
            v-model="state.type"
            :items="typeItems"
            orientation="horizontal"
            variant="card"
            size="sm"
            @change="state.categories = undefined"
          />
        </UFormField>

        <UFormField
          name="categories"
          label="Kategori"
        >
          <USelectMenu
            v-model="state.categories"
            :items="categories"
            label-key="label"
            value-key="value"
            class="w-full"
            max-height="200"
            size="lg"
            multiple
            placeholder="Pilih kategori (opsional)"
          />
        </UFormField>

        <div class="flex gap-4">
          <UFormField
            name="startDate"
            label="Tanggal Mulai"
            class="flex-1"
          >
            <UInput
              v-model="state.startDate"
              class="w-full"
              size="lg"
              type="date"
            />
          </UFormField>
          <UFormField
            name="endDate"
            label="Tanggal Selesai"
            class="flex-1"
          >
            <UInput
              v-model="state.endDate"
              class="w-full"
              size="lg"
              type="date"
            />
          </UFormField>
        </div>

        <UFormField name="includeSummary">
          <UCheckbox
            v-model="state.includeSummary"
            label="Sertakan sheet ringkasan"
            size="lg"
          />
        </UFormField>

        <div class="flex justify-end gap-3 mt-4">
          <UButton
            label="Batal"
            color="neutral"
            variant="ghost"
            @click="emit('close', false)"
          />
          <UButton
            type="submit"
            label="Export"
            icon="i-solar:export-outline"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UModal>
</template>
