<script setup lang="ts">
import { LazyTransactionForm } from '#components'

const route = useRoute()

const overlay = useOverlay()

const transactionDetails = overlay.create(LazyTransactionForm)
const openTransactionDetails = () => {
  transactionDetails.open()
}

const navItems = [
  {
    label: 'Home',
    icon: 'i-solar:home-2-linear',
    to: '/',
  },
  {
    label: 'Transaksi',
    icon: 'i-solar:dollar-linear',
    to: '/transactions',
  },
  {
    icon: 'i-solar:add-circle-linear',
    label: 'Tambah',
    onClick: () => {
      openTransactionDetails()
    },
  },
  {
    label: 'Analisis',
    icon: 'i-solar:graph-linear',
    to: '/analytics',
  },
  {
    label: 'Profil',
    icon: 'i-solar:user-linear',
    to: '/profile',
  },
]

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <nav class="fixed bottom-0 left-0 right-0 z-50 bg-elevated/50 backdrop-blur">
    <div class="flex justify-around items-center h-16">
      <template
        v-for="item in navItems"
        :key="item.to"
      >
        <NuxtLink
          v-if="item.to"
          :to="item.to"
          class="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
          :class="[
            isActive(item.to)
              ? 'text-primary'
              : 'text-muted hover:text-default',
          ]"
        >
          <UIcon
            :name="item.icon"
            class="w-6 h-6"
          />
          <span class="text-xs font-medium">{{ item.label }}</span>
        </NuxtLink>
        <UButton
          v-else
          :icon="item.icon"
          variant="solid"
          size="xl"
          class="rounded-full transform -translate-y-4 scale-130"
          @click="item.onClick"
        />
      </template>
    </div>
  </nav>
</template>
