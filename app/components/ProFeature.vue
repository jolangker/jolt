<script setup lang="ts">
// ProFeature - Wrapper component for PRO-only features
// Shows blurred overlay with upgrade prompt for FREE users

defineProps<{
  title?: string
  description?: string
}>()

const { isFree } = useAuth()
</script>

<template>
  <div class="relative">
    <!-- Blur overlay for FREE users -->
    <div
      v-if="isFree"
      class="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg bg-elevated/80 backdrop-blur-sm"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-lock"
          class="size-5 text-primary"
        />
        <UBadge
          label="PRO"
          color="primary"
          variant="subtle"
        />
      </div>
      <div class="text-center px-4">
        <div class="font-semibold text-sm">
          {{ title || 'Fitur PRO' }}
        </div>
        <div class="text-xs text-dimmed mt-1">
          {{ description || 'Upgrade ke PRO untuk membuka fitur ini' }}
        </div>
      </div>
      <UButton
        label="Upgrade ke PRO"
        icon="i-lucide-sparkles"
        size="sm"
        to="/profile"
      />
    </div>

    <!-- Content (blurred for FREE users) -->
    <div :class="{ 'blur-sm pointer-events-none select-none': isFree }">
      <slot />
    </div>
  </div>
</template>
