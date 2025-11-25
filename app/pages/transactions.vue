<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

// Categories list
const categories = ref([
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Other',
])

// Filter state
const filters = ref({
  startDate: '',
  endDate: '',
  selectedCategories: [] as string[],
})

// Pagination state
const limit = 20
const offset = ref(0)

// Fetch transactions
const { data: transactions, pending, refresh } = await useFetch('/api/expenses', {
  query: computed(() => ({
    startDate: filters.value.startDate || undefined,
    endDate: filters.value.endDate || undefined,
    categories: filters.value.selectedCategories.length > 0 
      ? filters.value.selectedCategories.join(',') 
      : undefined,
  })),
})

// Paginated transactions
const displayedTransactions = computed(() => {
  const data = transactions.value?.data ?? []
  return data.slice(0, offset.value + limit)
})

const hasMore = computed(() => {
  const data = transactions.value?.data ?? []
  return displayedTransactions.value.length < data.length
})

// Load more
const loadMore = () => {
  offset.value += limit
}

// Reset filters
const resetFilters = () => {
  filters.value = {
    startDate: '',
    endDate: '',
    selectedCategories: [],
  }
  offset.value = 0
  refresh()
}

// Apply filters
const applyFilters = () => {
  offset.value = 0
  refresh()
}

// Initialize with first batch
onMounted(() => {
  offset.value = 0
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar
        :toggle="false"
        :ui="{ root: 'border-b-0' }"
      >
        <template #left>
          <div class="font-bold text-xl">
            All Transactions
          </div>
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <!-- Filters Section -->
      <div class="mb-6 space-y-4">
        <div class="text-sm font-semibold mb-2">
          Filters
        </div>
        
        <!-- Date Range -->
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="text-xs text-dimmed block mb-1">Start Date</label>
            <input
              v-model="filters.startDate"
              type="date"
              class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
          </div>
          <div>
            <label class="text-xs text-dimmed block mb-1">End Date</label>
            <input
              v-model="filters.endDate"
              type="date"
              class="w-full px-3 py-2 text-sm rounded-lg border border-border bg-background"
            >
          </div>
        </div>

        <!-- Category Filter -->
        <div>
          <label class="text-xs text-dimmed block mb-2">Categories</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="category in categories"
              :key="category"
              type="button"
              class="px-3 py-1.5 text-xs rounded-full border transition-colors"
              :class="[
                filters.selectedCategories.includes(category)
                  ? 'bg-primary text-white border-primary'
                  : 'bg-background border-border text-dimmed hover:border-primary'
              ]"
              @click="() => {
                const index = filters.selectedCategories.indexOf(category)
                if (index > -1) {
                  filters.selectedCategories.splice(index, 1)
                } else {
                  filters.selectedCategories.push(category)
                }
              }"
            >
              {{ category }}
            </button>
          </div>
        </div>

        <!-- Filter Actions -->
        <div class="flex gap-2">
          <UButton
            color="primary"
            size="sm"
            block
            @click="applyFilters"
          >
            Apply Filters
          </UButton>
          <UButton
            color="gray"
            variant="outline"
            size="sm"
            block
            @click="resetFilters"
          >
            Reset
          </UButton>
        </div>
      </div>

      <!-- Transactions List -->
      <div>
        <div class="text-sm font-semibold mb-3">
          {{ displayedTransactions.length }} 
          {{ displayedTransactions.length === 1 ? 'Transaction' : 'Transactions' }}
        </div>

        <!-- Loading State -->
        <div v-if="pending" class="text-center py-8 text-dimmed">
          Loading transactions...
        </div>

        <!-- Empty State -->
        <div v-else-if="displayedTransactions.length === 0" class="text-center py-8 text-dimmed">
          No transactions found
        </div>

        <!-- Transactions -->
        <div v-else class="flex flex-col gap-3">
          <UCard
            v-for="expense in displayedTransactions"
            :key="expense.id"
            variant="subtle"
          >
            <div class="flex items-center gap-3">
              <UAvatar
                icon="i-solar:cash-out-bold"
                size="2xl"
                :ui="{ root: 'bg-accented' }"
              />
              <div class="flex-1 overflow-hidden">
                <div class="text-sm font-medium">
                  {{ expense.note }}
                </div>
                <div class="text-xs text-dimmed">
                  {{ formatDate(expense.transactionDate) }} • {{ expense.category }}
                </div>
              </div>
              <div class="shrink-0 text-error text-sm font-semibold">
                {{ formatCurrency(expense.amount) }}
              </div>
            </div>
          </UCard>

          <!-- Load More Button -->
          <UButton
            v-if="hasMore"
            variant="outline"
            color="gray"
            size="lg"
            block
            class="mt-2"
            @click="loadMore"
          >
            Load More
          </UButton>
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
