<script setup lang="ts">
// No layout needed, using UDashboardPanel
</script>

<template>
  <UDashboardPanel :ui="{ body: 'flex items-center justify-center' }">
    <template #body>
      <UCard class="w-full max-w-md mx-auto text-center">
        <div class="space-y-4">
          <UIcon name="i-heroicons-lock-closed" class="w-16 h-16 mx-auto text-gray-400" />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Unauthorized Access
          </h1>
          <p class="text-gray-500 dark:text-gray-400">
            You do not have permission to view this page.
          </p>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
