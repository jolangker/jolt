<script setup lang="ts">
import { useScriptTag } from '@vueuse/core'

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  (e: 'close' | 'success'): void
}>()

const toast = useToast()

// Load Midtrans Snap.js based on environment
const isProduction = import.meta.env.NUXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true'
const clientKey = import.meta.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY as string
const snapUrl = isProduction
  ? 'https://app.midtrans.com/snap/snap.js'
  : 'https://app.sandbox.midtrans.com/snap/snap.js'

console.log('[Midtrans] Environment:', isProduction ? 'Production' : 'Sandbox')
console.log('[Midtrans] Snap URL:', snapUrl)

const isSnapLoaded = ref(false)

useScriptTag(snapUrl, () => {
  isSnapLoaded.value = true
  console.log('[Midtrans] Snap.js loaded')
}, {
  attrs: {
    'data-client-key': clientKey,
  },
})

const isLoading = ref(false)

const features = [
  { icon: 'i-lucide:mic', label: 'Voice input tanpa batas' },
  { icon: 'i-lucide:camera', label: 'Scan struk belanja' },
  { icon: 'i-lucide:sparkles', label: 'Jolt AI Insights' },
  { icon: 'i-lucide:bar-chart-3', label: 'Analitik lengkap' },
  { icon: 'i-lucide:tag', label: 'Kategori kustom' },
  { icon: 'i-lucide:download', label: 'Export data' },
]

async function handleUpgrade() {
  if (!isSnapLoaded.value) {
    toast.add({
      title: 'Mohon tunggu',
      description: 'Payment gateway sedang dimuat...',
      color: 'warning',
    })
    return
  }

  isLoading.value = true

  try {
    const response = await $fetch('/api/payments/create', {
      method: 'POST',
    })

    if (!response.success || !response.data?.token) {
      throw new Error('Failed to get payment token')
    }

    // Close our modal first to prevent z-index blocking
    emit('close')

    // Small delay to let modal close animation complete
    await new Promise(resolve => setTimeout(resolve, 200))

    // Open Snap popup
    // @ts-expect-error - Snap is loaded via script tag
    window.snap.pay(response.data.token, {
      onSuccess: async () => {
        toast.add({
          title: 'Pembayaran Berhasil! 🎉',
          description: 'Memperbarui status akun Anda...',
          color: 'success',
          icon: 'i-lucide:check-circle',
        })

        // Poll for tier update (webhook might take a moment)
        const maxRetries = 10
        const retryDelay = 1500 // 1.5 seconds

        for (let i = 0; i < maxRetries; i++) {
          try {
            const result = await $fetch('/api/auth/refresh', { method: 'POST' })

            // Check if tier is now PRO
            if (result.user?.tier === 'PRO') {
              const { fetch } = useUserSession()
              await fetch()

              toast.add({
                title: 'Selamat! 🎉',
                description: 'Anda sekarang adalah pengguna PRO!',
                color: 'success',
                icon: 'i-lucide:crown',
              })
              emit('success')
              return
            }
          }
          catch (e) {
            console.error('Refresh attempt failed:', e)
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, retryDelay))
        }

        // If still not PRO after retries, let user know
        toast.add({
          title: 'Pembayaran Diproses',
          description: 'Status akan diperbarui dalam beberapa saat. Silakan refresh halaman.',
          color: 'warning',
        })
        emit('success')
      },
      onPending: () => {
        toast.add({
          title: 'Menunggu Pembayaran',
          description: 'Silakan selesaikan pembayaran Anda.',
          color: 'warning',
          icon: 'i-lucide:clock',
        })
        emit('close')
      },
      onError: () => {
        toast.add({
          title: 'Pembayaran Gagal',
          description: 'Terjadi kesalahan. Silakan coba lagi.',
          color: 'error',
          icon: 'i-lucide:x-circle',
        })
      },
      onClose: () => {
        // User closed the popup without completing
      },
    })
  }
  catch (error) {
    console.error('Payment error:', error)
    toast.add({
      title: 'Error',
      description: 'Gagal memulai pembayaran. Silakan coba lagi.',
      color: 'error',
    })
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <UModal
    :open="open"
    @close="emit('close')"
  >
    <template #content>
      <div class="p-6">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <UIcon
              name="i-lucide:crown"
              class="w-8 h-8 text-primary"
            />
          </div>
          <h2 class="text-xl font-bold">
            Upgrade ke PRO
          </h2>
          <p class="text-dimmed text-sm mt-1">
            Nikmati semua fitur premium Jolt AI
          </p>
        </div>

        <!-- Price -->
        <div class="text-center mb-6">
          <div class="flex items-center justify-center gap-2">
            <span class="text-sm text-dimmed line-through">Rp 49.000</span>
            <UBadge
              label="61% OFF"
              color="success"
              size="xs"
            />
          </div>
          <div class="text-3xl font-bold text-primary">
            Rp 19.000
            <span class="text-sm font-normal text-dimmed">/bulan</span>
          </div>
        </div>

        <!-- Features -->
        <div class="space-y-3 mb-6">
          <div
            v-for="feature in features"
            :key="feature.label"
            class="flex items-center gap-3"
          >
            <div class="flex-shrink-0 w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <UIcon
                :name="feature.icon"
                class="w-4 h-4 text-success"
              />
            </div>
            <span class="text-sm">{{ feature.label }}</span>
          </div>
        </div>

        <!-- Upgrade Button -->
        <UButton
          label="Lanjutkan Pembayaran"
          icon="i-lucide:credit-card"
          size="lg"
          block
          :loading="isLoading"
          :disabled="!isSnapLoaded"
          @click="handleUpgrade"
        />

        <!-- Cancel -->
        <UButton
          label="Nanti saja"
          variant="ghost"
          color="neutral"
          size="lg"
          block
          class="mt-2"
          @click="emit('close')"
        />

        <!-- Payment badge -->
        <div class="flex items-center justify-center gap-2 mt-4 text-xs text-dimmed">
          <UIcon
            name="i-lucide:shield-check"
            class="w-4 h-4"
          />
          <span>Pembayaran aman via Midtrans</span>
        </div>
      </div>
    </template>
  </UModal>
</template>
