<script setup lang="ts">
// No layout needed, using UDashboardPanel
</script>

<template>
  <UDashboardPanel :ui="{ body: 'flex items-center justify-center' }">
    <template #body>
      <UCard class="w-full max-w-md mx-auto text-center">
        <div class="space-y-4">
          <UIcon
            name="i-lucide-lock"
            class="w-16 h-16 mx-auto text-muted"
          />
          <h1 class="text-2xl font-bold">
            Akses Ditolak
          </h1>
          <p class="text-muted">
            Anda tidak memiliki izin untuk melihat halaman ini. Silakan login terlebih dahulu.
          </p>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
