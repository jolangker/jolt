<script setup lang="ts">
const route = useRoute()
const toast = useToast()

// Mode: 'token' when ?t=xxx in URL, 'otp' otherwise
const mode = computed(() => route.query.t ? 'token' : 'otp')

// ============ TOKEN LOGIN ============
const isValidating = ref(false)
const tokenValid = ref(false)
const tokenError = ref<string | null>(null)

async function validateToken() {
  const token = route.query.t as string
  if (!token || token.length < 8) {
    tokenError.value = 'Invalid token format'
    return
  }

  isValidating.value = true
  tokenError.value = null

  try {
    await $fetch('/api/auth/login-with-token', {
      method: 'POST',
      body: { token },
    })

    tokenValid.value = true
    setTimeout(() => {
      location.href = '/'
    }, 1500)
  }
  catch (error: any) {
    tokenError.value = error.data?.message || 'Invalid or expired token'
  }
  finally {
    isValidating.value = false
  }
}

// ============ OTP LOGIN ============
type OtpStep = 'phone' | 'code'
const otpStep = ref<OtpStep>('phone')
const phoneNumber = ref('')
const otpCode = ref<string[]>([])
const isLoading = ref(false)
const otpError = ref<string | null>(null)
const resendTimer = ref(0)

let resendInterval: ReturnType<typeof setInterval> | null = null

function startResendTimer() {
  resendTimer.value = 60
  resendInterval = setInterval(() => {
    resendTimer.value--
    if (resendTimer.value <= 0 && resendInterval) {
      clearInterval(resendInterval)
      resendInterval = null
    }
  }, 1000)
}

async function sendOtp() {
  if (!phoneNumber.value) {
    otpError.value = 'Phone number is required'
    return
  }

  // Normalize phone number
  let phone = phoneNumber.value.trim()
  if (phone.startsWith('0')) {
    phone = '62' + phone.slice(1)
  }
  if (!phone.startsWith('62')) {
    phone = '62' + phone
  }

  isLoading.value = true
  otpError.value = null

  try {
    await $fetch('/api/auth/send-otp', {
      method: 'POST',
      body: { phoneNumber: phone },
    })

    phoneNumber.value = phone
    otpStep.value = 'code'
    startResendTimer()
    toast.add({
      title: 'OTP Terkirim',
      description: 'Kode verifikasi telah dikirim ke WhatsApp kamu.',
      icon: 'i-lucide-check-circle',
      color: 'success',
    })
  }
  catch (error: any) {
    otpError.value = error.data?.message || 'Gagal mengirim OTP'
  }
  finally {
    isLoading.value = false
  }
}

async function verifyOtp() {
  const code = otpCode.value.join('')
  if (!code || code.length !== 6) {
    otpError.value = 'Masukkan 6 digit kode OTP'
    return
  }

  isLoading.value = true
  otpError.value = null

  try {
    await $fetch('/api/auth/verify-otp', {
      method: 'POST',
      body: {
        phoneNumber: phoneNumber.value,
        code,
      },
    })

    toast.add({
      title: 'Login Berhasil',
      description: 'Mengalihkan ke dashboard...',
      icon: 'i-lucide-check-circle',
      color: 'success',
    })

    setTimeout(() => {
      location.href = '/'
    }, 1000)
  }
  catch (error: any) {
    otpError.value = error.data?.message || 'Verifikasi gagal'
    otpCode.value = []
  }
  finally {
    isLoading.value = false
  }
}

function goBackToPhone() {
  otpStep.value = 'phone'
  otpCode.value = []
  otpError.value = null
  if (resendInterval) {
    clearInterval(resendInterval)
    resendInterval = null
  }
}

onMounted(() => {
  if (mode.value === 'token') {
    validateToken()
  }
})

onUnmounted(() => {
  if (resendInterval) {
    clearInterval(resendInterval)
  }
})
</script>

<template>
  <UDashboardPanel :ui="{ body: 'flex items-center justify-center' }">
    <template #body>
      <!-- TOKEN LOGIN MODE -->
      <UCard
        v-if="mode === 'token'"
        class="w-full max-w-md"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              :name="isValidating ? 'i-lucide-loader-circle' : tokenValid ? 'i-lucide-shield-check' : 'i-lucide-shield-alert'"
              class="size-6"
              :class="{
                'animate-spin text-primary': isValidating,
                'text-success': tokenValid,
                'text-error': !isValidating && !tokenValid && tokenError,
              }"
            />
            <h2 class="text-xl font-semibold">
              {{ isValidating ? 'Memvalidasi Token' : tokenValid ? 'Token Valid' : 'Validasi Gagal' }}
            </h2>
          </div>
        </template>

        <div
          v-if="isValidating"
          class="space-y-4"
        >
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4" />
          <UProgress animation="carousel" />
        </div>

        <div
          v-else-if="tokenValid"
          class="space-y-4"
        >
          <UAlert
            color="success"
            variant="soft"
            icon="i-lucide-circle-check"
            title="Akses Diberikan"
            description="Token berhasil divalidasi. Mengalihkan ke dashboard..."
          />
        </div>

        <div
          v-else
          class="space-y-4"
        >
          <UAlert
            color="error"
            variant="soft"
            icon="i-lucide-circle-x"
            title="Akses Ditolak"
            :description="tokenError || 'Token tidak valid'"
          />
          <UButton
            to="/login"
            variant="soft"
            block
            icon="i-lucide-arrow-left"
          >
            Login dengan OTP
          </UButton>
        </div>
      </UCard>

      <!-- OTP LOGIN MODE -->
      <UCard
        v-else
        class="w-full max-w-md"
      >
        <template #header>
          <div class="flex items-center gap-3">
            <UIcon
              name="i-lucide-smartphone"
              class="size-6 text-primary"
            />
            <div>
              <h2 class="text-xl font-semibold">
                {{ otpStep === 'phone' ? 'Masuk ke Jolt' : 'Verifikasi OTP' }}
              </h2>
              <p class="text-sm text-muted">
                {{ otpStep === 'phone' ? 'Masukkan nomor WhatsApp kamu' : 'Masukkan kode yang dikirim ke WhatsApp' }}
              </p>
            </div>
          </div>
        </template>

        <!-- Step 1: Phone Number -->
        <form
          v-if="otpStep === 'phone'"
          class="space-y-4"
          @submit.prevent="sendOtp"
        >
          <UFormField label="Nomor WhatsApp">
            <UInput
              v-model="phoneNumber"
              placeholder="08123456789"
              icon="i-lucide-phone"
              size="lg"
              inputmode="numeric"
              :disabled="isLoading"
              autofocus
              class="w-full"
              @input="phoneNumber = phoneNumber.replace(/[^0-9]/g, '')"
            />
          </UFormField>

          <UAlert
            v-if="otpError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-x"
            :description="otpError"
          />

          <UButton
            type="submit"
            block
            size="lg"
            :loading="isLoading"
            icon="i-lucide-send"
          >
            Kirim Kode OTP
          </UButton>
        </form>

        <!-- Step 2: OTP Code -->
        <form
          v-else
          class="space-y-4"
          @submit.prevent="verifyOtp"
        >
          <div class="text-center mb-4">
            <p class="text-sm text-muted">
              Kode dikirim ke
              <span class="font-medium text-highlighted">{{ phoneNumber }}</span>
            </p>
          </div>

          <UFormField label="Kode OTP">
            <UPinInput
              v-model="otpCode"
              :length="6"
              otp
              size="xl"
              :disabled="isLoading"
              placeholder="○"
              @complete="verifyOtp"
            />
          </UFormField>

          <UAlert
            v-if="otpError"
            color="error"
            variant="soft"
            icon="i-lucide-circle-x"
            :description="otpError"
          />

          <UButton
            type="submit"
            block
            size="lg"
            :loading="isLoading"
            icon="i-lucide-log-in"
          >
            Verifikasi & Masuk
          </UButton>

          <div class="flex items-center justify-between text-sm">
            <UButton
              variant="ghost"
              size="sm"
              icon="i-lucide-arrow-left"
              @click="goBackToPhone"
            >
              Ganti Nomor
            </UButton>

            <UButton
              v-if="resendTimer > 0"
              variant="ghost"
              size="sm"
              disabled
            >
              Kirim ulang ({{ resendTimer }}s)
            </UButton>
            <UButton
              v-else
              variant="ghost"
              size="sm"
              icon="i-lucide-refresh-cw"
              :loading="isLoading"
              @click="sendOtp"
            >
              Kirim Ulang
            </UButton>
          </div>
        </form>

        <template #footer>
          <p class="text-xs text-muted text-center">
            Dengan masuk, kamu menyetujui ketentuan layanan Jolt AI.
          </p>
        </template>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
