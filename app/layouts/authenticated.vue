<script setup lang="ts">
const route = useRoute()

const navItems = [
  {
    label: 'Home',
    icon: 'i-lucide:home',
    to: '/',
  },
  {
    label: 'Transactions',
    icon: 'i-lucide:receipt',
    to: '/transactions',
  },
  {
    label: 'Analytics',
    icon: 'i-lucide:chart-line',
    to: '/analytics',
  },
  {
    label: 'Profile',
    icon: 'i-lucide:user',
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
  <UDashboardGroup>
    <div class="min-h-screen flex flex-col w-full">
      <!-- Main Content Area -->
      <div class="flex-1 overflow-y-auto pb-20">
        <slot />
      </div>

      <!-- Bottom Navigation -->
      <nav class="fixed bottom-0 left-0 right-0 bg-background z-50 bg-elevated/50 backdrop-blur">
        <div class="max-w-2xl mx-auto px-4">
          <div class="flex justify-around items-center h-16">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
              :class="[
                isActive(item.to)
                  ? 'text-primary'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              ]"
            >
              <UIcon
                :name="item.icon"
                class="w-6 h-6"
              />
              <span class="text-xs font-medium">{{ item.label }}</span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </div>
  </UDashboardGroup>
</template>
