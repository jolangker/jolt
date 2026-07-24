<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { LazyCategoryModal } from '#components'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const { data: response, refresh } = await useFetch('/api/categories')
const categories = computed(() => response.value?.data || [])

const search = ref('')
const typeFilter = ref<'all' | 'income' | 'expense'>('all')
const sourceFilter = ref<'all' | 'default' | 'custom'>('all')

const filteredCategories = computed(() => {
  return categories.value.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.value.toLowerCase())
    const matchesType = typeFilter.value === 'all' || c.type === typeFilter.value
    const matchesSource = sourceFilter.value === 'all'
      || (sourceFilter.value === 'default' && c.isDefault)
      || (sourceFilter.value === 'custom' && !c.isDefault)

    return matchesSearch && matchesType && matchesSource
  })
})

const overlay = useOverlay()
const categoryModal = overlay.create(LazyCategoryModal)

const openModal = (category?: any) => {
  categoryModal.open({
    category,
    onSuccess: refresh,
  })
}

const toast = useToast()

interface ApiError {
  data?: {
    statusMessage?: string
  }
}

const deleteCategory = async (id: number) => {
  if (!confirm('Yakin mau hapus kategori ini?')) return

  try {
    await $fetch(`/api/categories/${id}`, { method: 'DELETE' })
    toast.add({ title: 'Kategori dihapus', color: 'success', icon: 'i-solar:check-circle-outline' })
    refresh()
  }
  catch (err: unknown) {
    const error = err as ApiError
    toast.add({
      title: 'Gagal',
      description: error.data?.statusMessage || 'Gagal menghapus kategori',
      color: 'error',
      icon: 'i-solar:close-circle-outline',
    })
  }
}

const typeItems = [
  { label: 'Semua Jenis', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

const sourceItems = [
  { label: 'Semua Sumber', value: 'all' },
  { label: 'Default', value: 'default' },
  { label: 'Kustom', value: 'custom' },
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        title="Kelola Kategori"
        :toggle="false"
      >
        <template #leading>
          <UButton
            icon="i-lucide:arrow-left"
            variant="ghost"
            color="neutral"
            @click="$router.back"
          />
        </template>
        <template #right>
          <UButton
            label="Tambah Kategori"
            icon="i-lucide:plus"
            @click="openModal()"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 mb-6">
        <UInput
          v-model="search"
          icon="i-lucide:search"
          placeholder="Cari kategori..."
          class="w-full"
          size="lg"
        />
        <div class="flex flex-col sm:flex-row gap-4">
          <USelect
            v-model="typeFilter"
            :items="typeItems"
            class="w-full sm:w-48"
          />
          <USelect
            v-model="sourceFilter"
            :items="sourceItems"
            class="w-full sm:w-48"
          />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <UCard
          v-for="cat in filteredCategories"
          :key="cat.id"
          variant="subtle"
        >
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <UAvatar
                :icon="cat.icon"
                :class="cat.type === 'income' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'"
                size="lg"
              />
              <div>
                <div class="font-bold">
                  {{ cat.name }}
                </div>
                <div class="text-xs text-dimmed line-clamp-1">
                  {{ cat.description }}
                </div>
              </div>
            </div>
            <div
              v-if="!cat.isDefault"
              class="flex gap-1"
            >
              <UButton
                icon="i-lucide:edit-2"
                color="neutral"
                variant="ghost"
                size="xs"
                @click="openModal(cat)"
              />
              <UButton
                icon="i-lucide:trash"
                color="error"
                variant="ghost"
                size="xs"
                @click="deleteCategory(cat.id)"
              />
            </div>
            <div v-else>
              <UBadge
                label="Default"
                color="neutral"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>
        </UCard>
      </div>

      <div
        v-if="filteredCategories.length === 0"
        class="text-center py-12 text-dimmed"
      >
        Kategori tidak ditemukan.
      </div>
    </template>
  </UDashboardPanel>
</template>
