<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
import { LazyCategoryModal, LazyConfirmationModal } from '#components'

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
const confirmationModal = overlay.create(LazyConfirmationModal)

const openModal = (category?: any) => {
  categoryModal.open({
    category,
    onSuccess: refresh,
  })
}

const toast = useToast()

const deleteCategory = (id: number) => {
  confirmationModal.open({
    title: 'Hapus Kategori',
    description: 'Apakah kamu yakin ingin menghapus kategori ini?',
    onConfirm: async () => {
      await useFetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      refreshNuxtData()
      toast.add({
        title: 'Kategori berhasil dihapus',
        color: 'success',
        icon: 'i-solar:check-circle-outline',
      })
    },
  })
}

const typeItems = [
  { label: 'Semua', value: 'all' },
  { label: 'Pemasukan', value: 'income' },
  { label: 'Pengeluaran', value: 'expense' },
]

const sourceItems = [
  { label: 'Bawaan & Kustom', value: 'all' },
  { label: 'Bawaan', value: 'default' },
  { label: 'Kustom', value: 'custom' },
]
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        title="Sesuaikan Kategori"
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
      <div class="flex flex-col gap-2">
        <UInput
          v-model="search"
          icon="i-lucide:search"
          placeholder="Cari kategori..."
          class="w-full"
          size="lg"
        />
        <USelect
          v-model="typeFilter"
          :items="typeItems"
          class="w-full"
        />
        <USelect
          v-model="sourceFilter"
          :items="sourceItems"
          class="w-full"
        />
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
                label="Bawaan"
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
        No categories found.
      </div>
    </template>
  </UDashboardPanel>
</template>
