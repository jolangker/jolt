<script setup lang="ts">
import { z } from 'zod'

const props = defineProps<{
  category?: {
    id: number
    name: string
    description: string
    type: 'income' | 'expense'
    icon?: string | null
  }
}>()

const emit = defineEmits<{
  close: [boolean]
  success: []
}>()

const toast = useToast()
const loading = ref(false)
const isEdit = computed(() => !!props.category)

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(50, 'Nama terlalu panjang'),
  description: z.string().max(200, 'Deskripsi terlalu panjang').default(''),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
})

type Schema = z.infer<typeof schema>

const state = reactive<Schema>({
  name: props.category?.name || '',
  description: props.category?.description || '',
  type: props.category?.type || 'expense',
  icon: props.category?.icon || undefined,
})

const typeItems = [
  { label: 'Pengeluaran', value: 'expense' },
  { label: 'Pemasukan', value: 'income' },
]

interface ApiError {
  data?: {
    statusMessage?: string
  }
}

const onSubmit = async () => {
  loading.value = true
  try {
    if (isEdit.value) {
      await $fetch(`/api/categories/${props.category!.id}`, {
        method: 'PUT',
        body: state,
      })
      toast.add({
        title: 'Kategori diperbarui',
        color: 'success',
        icon: 'i-solar:check-circle-outline',
      })
    }
    else {
      await $fetch('/api/categories', {
        method: 'POST',
        body: state,
      })
      toast.add({
        title: 'Kategori dibuat',
        color: 'success',
        icon: 'i-solar:check-circle-outline',
      })
    }
    emit('success')
    emit('close', true)
  }
  catch (err: unknown) {
    const error = err as ApiError
    toast.add({
      title: 'Gagal',
      description: error.data?.statusMessage || 'Terjadi kesalahan',
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
  <UDrawer :title="isEdit ? 'Ubah Kategori' : 'Kategori Baru'">
    <template #body>
      <UForm
        :state="state"
        :schema="schema"
        class="flex flex-col gap-4 h-full"
        @submit="onSubmit"
      >
        <div class="flex-1 space-y-4">
          <UFormField
            name="name"
            label="Nama"
            required
          >
            <UInput
              v-model="state.name"
              placeholder="mis. Langganan Online"
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="description"
            label="Deskripsi"
            required
          >
            <UTextarea
              v-model="state.description"
              placeholder="Deskripsi singkat..."
              size="xl"
              class="w-full"
            />
          </UFormField>

          <UFormField
            name="type"
            label="Jenis"
            required
          >
            <URadioGroup
              v-model="state.type"
              :items="typeItems"
              orientation="horizontal"
              variant="card"
              :disabled="isEdit"
            />
          </UFormField>

          <UFormField
            name="icon"
            label="Ikon"
          >
            <div
              v-if="state.icon"
              class="mb-2"
            >
              <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-800">
                <UIcon
                  :name="state.icon"
                  class="w-5 h-5"
                />
                <span class="text-sm">{{ state.icon }}</span>
                <UButton
                  icon="i-lucide:x"
                  size="xs"
                  color="neutral"
                  variant="ghost"
                  @click="state.icon = undefined"
                />
              </div>
            </div>
            <IconPicker v-model="state.icon" />
          </UFormField>
        </div>

        <div class="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
          <UButton
            label="Batal"
            color="neutral"
            variant="ghost"
            @click="emit('close', false)"
          />
          <UButton
            type="submit"
            :label="isEdit ? 'Simpan Perubahan' : 'Buat Kategori'"
            :loading="loading"
          />
        </div>
      </UForm>
    </template>
  </UDrawer>
</template>
