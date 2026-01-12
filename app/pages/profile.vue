<script setup lang="ts">
import { LazyConfirmationModal, LazyExportModal } from '#components'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const { user } = useUserSession()
const { tier, isPro } = useAuth()

const memberSince = computed(() => {
  if (!user.value?.createdAt) return 'N/A'
  return formatDate(user.value.createdAt)
})

const toast = useToast()

const overlay = useOverlay()
const exportModal = overlay.create(LazyExportModal)
const confirmModal = overlay.create(LazyConfirmationModal)

const openExportModal = () => {
  exportModal.open()
}

const openResetConfirmModal = () => {
  confirmModal.open({
    title: 'Hapus Seluruh Data',
    description: 'Apakah Anda yakin ingin menghapus seluruh data Anda? Aksi ini tidak dapat diurungkan.',
    confirmText: 'Ya, Hapus Semua',
    countdown: 3,
    onConfirm: async () => {
      await useFetch(`/api/transactions/reset`, {
        method: 'POST',
      })
      refreshNuxtData()
      toast.add({
        title: 'Data berhasil dihapus',
        description: 'Semua data berhasil dihapus',
        color: 'success',
        icon: 'i-solar:check-circle-outline',
      })
    },
  })
}

const fileInput = ref<HTMLInputElement | null>(null)

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files || target.files.length === 0) return

  const file = target.files[0]
  const formData = new FormData()
  formData.append('file', file)

  const loadingToast = toast.add({
    title: 'Mengimport data...',
    description: 'Mohon tunggu sebentar',
    loading: true,
  })

  try {
    const { data } = await $fetch('/api/transactions/import', {
      method: 'POST',
      body: formData,
    })

    toast.remove(loadingToast.id)
    toast.add({
      title: 'Import Berhasil',
      description: `${data.imported} transaksi berhasil diimport. ${data.createdCategories} kategori baru dibuat.`,
      color: 'success',
      icon: 'i-solar:check-circle-outline',
    })
    
    // Refresh data if needed, or maybe just let user navigate
    refreshNuxtData()
  } catch (error: any) {
    toast.remove(loadingToast.id)
    toast.add({
      title: 'Import Gagal',
      description: error.statusMessage || 'Terjadi kesalahan saat mengimport data',
      color: 'error',
      icon: 'i-solar:danger-circle-outline',
    })
  } finally {
    // Reset input
    target.value = ''
  }
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :toggle="false"
        :ui="{ root: 'border-b-0' }"
      >
        <template #left>
          <div class="font-bold text-xl">
            Profil
          </div>
        </template>
        <template #right>
          <UColorModeButton />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div class="flex flex-col items-center">
        <input
          ref="fileInput"
          type="file"
          class="hidden"
          accept=".xlsx"
          @change="handleFileImport"
        >
        <UAvatar
          icon="i-lucide:user"
          size="3xl"
        />
        <UBadge
          :label="tier"
          :color="isPro ? 'primary' : 'neutral'"
          :variant="isPro ? 'solid' : 'subtle'"
          class="mt-2"
        />
        <div
          v-if="isPro && user?.subscriptionEndsAt"
          class="text-xs text-dimmed mt-1"
        >
          Berakhir {{ formatDate(user.subscriptionEndsAt) }}
        </div>
        <UButton
          v-if="!isPro"
          label="Upgrade ke PRO"
          icon="i-lucide-sparkles"
          class="mt-3"
        />
      </div>

      <div class="flex flex-col gap-6">
        <div class="space-y-4">
          <div class="text-sm font-semibold mb-3">
            Informasi Akun
          </div>

          <UCard variant="subtle">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide:user"
                  class="w-5 h-5 text-primary"
                />
                <div>
                  <div class="text-xs text-dimmed">
                    Nomor Telepon
                  </div>
                  <div class="text-sm font-medium">
                    {{ user?.phoneNumber }}
                  </div>
                </div>
              </div>
            </div>
          </UCard>

          <UCard variant="subtle">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide:calendar"
                  class="w-5 h-5 text-primary"
                />
                <div>
                  <div class="text-xs text-dimmed">
                    Member Sejak
                  </div>
                  <div class="text-sm font-medium">
                    {{ memberSince }}
                  </div>
                </div>
              </div>
            </div>
          </UCard>
        </div>

        <div class="space-y-4">
          <div class="text-sm font-semibold mb-3">
            Aksi
          </div>

          <UCard
            variant="subtle"
            class="cursor-pointer"
            @click="navigateTo('/categories')"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-lucide:tag"
                  class="w-5 h-5 text-primary"
                />
                <div>
                  <div class="text-sm font-medium">
                    Sesuaikan Kategori
                  </div>
                  <div class="text-xs text-dimmed">
                    Sesuaikan kategori pemasukan dan pengeluaran
                  </div>
                </div>
              </div>
              <UIcon
                name="i-lucide:chevron-right"
                class="w-5 h-5 text-dimmed"
              />
            </div>
          </UCard>
          <UCard
            variant="subtle"
            class="cursor-pointer"
            @click="openExportModal"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-solar:export-outline"
                  class="w-5 h-5 text-primary"
                />
                <div>
                  <div class="text-sm font-medium">
                    Export Data
                  </div>
                  <div class="text-xs text-dimmed">
                    Unduh dan simpan seluruh riwayat transaksi Anda
                  </div>
                </div>
              </div>
              <UIcon
                name="i-lucide:chevron-right"
                class="w-5 h-5 text-dimmed"
              />
            </div>
          </UCard>
          <UCard
            variant="subtle"
            class="cursor-pointer"
            @click="triggerFileInput"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-solar:import-outline"
                  class="w-5 h-5 text-primary"
                />
                <div>
                  <div class="text-sm font-medium">
                    Import Data
                  </div>
                  <div class="text-xs text-dimmed">
                    Import riwayat transaksi dari file Excel
                  </div>
                </div>
              </div>
              <UIcon
                name="i-lucide:chevron-right"
                class="w-5 h-5 text-dimmed"
              />
            </div>
          </UCard>
          <USeparator />
          <UCard
            variant="subtle"
            class="cursor-pointer"
            :ui="{
              root: 'ring-error/50 bg-error/10',
            }"
            @click="openResetConfirmModal"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <UIcon
                  name="i-solar:restart-outline"
                  class="w-5 h-5 text-error"
                />
                <div>
                  <div class="text-sm font-medium text-error">
                    Hapus Seluruh Data
                  </div>
                  <div class="text-xs text-dimmed">
                    Tindakan ini permanen dan tidak dapat dibatalkan
                  </div>
                </div>
              </div>
              <UIcon
                name="i-lucide:chevron-right"
                class="w-5 h-5 text-error"
              />
            </div>
          </UCard>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
