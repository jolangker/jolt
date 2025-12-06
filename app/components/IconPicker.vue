<script setup lang="ts">
defineProps<{
  modelValue?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [string]
}>()

const { data } = await useFetch('/api/icons')
const allIcons = computed(() => data.value?.data || [])

const search = ref('')
const page = ref(1)
const perPage = 64

const filteredIcons = computed(() => {
  if (!search.value) return allIcons.value
  return allIcons.value.filter(icon => icon.toLowerCase().includes(search.value.toLowerCase()))
})

const displayedIcons = computed(() => {
  return filteredIcons.value.slice(0, page.value * perPage)
})

const hasMore = computed(() => {
  return displayedIcons.value.length < filteredIcons.value.length
})

const loadMore = () => {
  page.value++
}

const selectIcon = (icon: string) => {
  emit('update:modelValue', icon)
}

// Reset page when search changes
watch(search, () => {
  page.value = 1
})
</script>

<template>
  <div class="space-y-4">
    <UInput
      v-model="search"
      icon="i-lucide:search"
      placeholder="Search icons..."
      class="w-full"
      size="xl"
    />

    <div class="h-64 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-lg p-4">
      <div
        v-if="displayedIcons.length > 0"
        class="grid grid-cols-6 sm:grid-cols-8 gap-2"
      >
        <button
          v-for="icon in displayedIcons"
          :key="icon"
          type="button"
          class="flex items-center justify-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          :class="{ 'bg-primary-50 dark:bg-primary-950 ring-2 ring-primary-500': modelValue === icon }"
          @click="selectIcon(icon)"
        >
          <UIcon
            :name="icon"
            class="w-6 h-6"
          />
        </button>
      </div>

      <div
        v-if="filteredIcons.length === 0"
        class="flex flex-col items-center justify-center h-full text-dimmed"
      >
        <UIcon
          name="i-lucide:frown"
          class="w-8 h-8 mb-2"
        />
        <span class="text-sm">No icons found</span>
      </div>

      <div
        v-if="hasMore"
        class="mt-4 text-center"
      >
        <UButton
          variant="ghost"
          color="neutral"
          size="xs"
          label="Load more"
          @click="loadMore"
        />
      </div>
    </div>
  </div>
</template>
