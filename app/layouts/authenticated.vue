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
    label: 'Transactions',
    icon: 'i-solar:dollar-linear',
    to: '/transactions',
  },
  {
    icon: 'i-solar:add-circle-linear',
    label: 'Add',
    onClick: () => {
      openTransactionDetails()
    },
  },
  {
    label: 'Analytics',
    icon: 'i-solar:graph-linear',
    to: '/analytics',
  },
  {
    label: 'Profile',
    icon: 'i-solar:user-linear',
    to: '/profile',
  },
]

const open = ref(false)

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<template>
  <UDashboardGroup>
    <div class="min-h-screen flex flex-col w-full">
      <!-- Main Content Area -->
      <div class="flex-1 overflow-y-auto pb-20">
        <slot />
      </div>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 bg-background z-50 bg-elevated/50 backdrop-blur">
        <div class="max-w-2xl mx-auto">
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
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
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
        </div>
      </nav>
    </div>
    <UDrawer
      v-model:open="open"
      title="Add Transaction"
      description="Add a new transaction"
    />
  </UDashboardGroup>
</template>
