<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  countdown?: number
  onConfirm: () => Promise<void>
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const loading = ref(false)
const disabled = ref(false)

const cdTimeout = ref<NodeJS.Timeout>()

if (props.countdown) {
  disabled.value = true
  cdTimeout.value = setTimeout(() => {
    disabled.value = false
    clearTimeout(cdTimeout.value)
  }, props.countdown * 1000)
}

const handleOnConfirm = async () => {
  try {
    loading.value = true
    await props.onConfirm()
    emit('close', false)
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UModal
    :close="{ onClick: () => emit('close', false) }"
    :title="props.title"
  >
    <template #body>
      <p>{{ props.description }}</p>
    </template>
    <template #footer>
      <div class="flex gap-2 justify-end w-full">
        <UButton
          color="neutral"
          variant="subtle"
          @click="emit('close', false)"
        >
          {{ props.cancelText || 'Batalkan' }}
        </UButton>
        <UButton
          color="error"
          :disabled="disabled"
          :loading="loading"
          @click="handleOnConfirm"
        >
          {{ props.confirmText || 'Ya' }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
