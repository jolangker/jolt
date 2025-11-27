<script setup lang="ts">
const props = defineProps<{
  title: string
  description: string
  onConfirm: () => Promise<void>
}>()

const emit = defineEmits<{
  close: [boolean]
}>()

const loading = ref(false)

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
          Cancel
        </UButton>
        <UButton
          color="error"
          :loading="loading"
          @click="handleOnConfirm"
        >
          Yes
        </UButton>
      </div>
    </template>
  </UModal>
</template>
