<script setup lang='ts'>
import type { TableColumn } from '@nuxt/ui'
import type { Expense } from '~~/shared/types/expense'

definePageMeta({
  middleware: 'auth',
})

const UBadge = resolveComponent('UBadge')

const { data, status } = useFetch('/api/expenses/list', {
  transform: ({ expenses }) => {
    return expenses.map((expense) => {
      return {
        id: expense.id,
        amount: parseFloat(expense.amount),
        category: expense.category,
        note: expense.note,
        transactionDate: expense.transactionDate,
      }
    })
  },
  default: () => [],
})

// Filters
const searchQuery = ref('')
const selectedCategories = ref<string[]>([])
const dateRange = ref<{ start: Date | null; end: Date | null }>({ start: null, end: null })

// Get unique categories from data
const categories = computed(() => {
  const cats = new Set(data.value.map(e => e.category))
  return Array.from(cats).sort()
})

// Filtered data based on search, category, and date filters
const filteredData = computed(() => {
  let result = data.value

  // Search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(e => 
      e.note.toLowerCase().includes(query) ||
      e.category.toLowerCase().includes(query)
    )
  }

  // Category filter
  if (selectedCategories.value.length > 0) {
    result = result.filter(e => selectedCategories.value.includes(e.category))
  }

  // Date range filter
  if (dateRange.value.start || dateRange.value.end) {
    result = result.filter(e => {
      const expenseDate = new Date(e.transactionDate)
      const start = dateRange.value.start
      const end = dateRange.value.end

      if (start && end) {
        return expenseDate >= start && expenseDate <= end
      } else if (start) {
        return expenseDate >= start
      } else if (end) {
        return expenseDate <= end
      }
      return true
    })
  }

  return result
})

// Statistics
const totalAmount = computed(() => {
  const total = filteredData.value.reduce((prev, curr) => prev + curr.amount, 0)
  return total
})

const expenseCount = computed(() => filteredData.value.length)

const averageAmount = computed(() => {
  if (filteredData.value.length === 0) return 0
  return totalAmount.value / filteredData.value.length
})

const categoryBreakdown = computed(() => {
  const breakdown = new Map<string, number>()
  
  filteredData.value.forEach(expense => {
    const current = breakdown.get(expense.category) || 0
    breakdown.set(expense.category, current + expense.amount)
  })

  return Array.from(breakdown.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalAmount.value) * 100
    }))
    .sort((a, b) => b.amount - a.amount)
})

// Format currency
const formatCurrency = (amount: number) => {
  return Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Table columns
const columns: TableColumn<Expense>[] = [
  {
    header: 'Date',
    accessorKey: 'transactionDate',
    cell: ({ row }) => formatDate(row.original.transactionDate),
    meta: {
      class: {
        td: 'whitespace-nowrap',
      },
    },
  },
  {
    header: 'Note',
    accessorKey: 'note',
    meta: {
      class: {
        td: 'whitespace-normal',
      },
    },
  },
  {
    header: 'Category',
    cell: ({ row }) => {
      return h(UBadge, { variant: 'subtle', color: 'neutral', size: 'sm', class: 'capitalize' }, row.original.category)
    },
  },
  {
    header: 'Amount',
    accessorKey: 'amount',
    cell: ({ row }) => formatCurrency(row.original.amount),
    meta: {
      class: {
        td: 'text-right font-medium',
      },
    },
  },
]

// Clear all filters
const clearFilters = () => {
  searchQuery.value = ''
  selectedCategories.value = []
  dateRange.value = { start: null, end: null }
}

const hasActiveFilters = computed(() => {
  return searchQuery.value !== '' || 
         selectedCategories.value.length > 0 || 
         dateRange.value.start !== null || 
         dateRange.value.end !== null
})
</script>

<template>
  <UDashboardPanel>
    <template #body>
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold">Expenses Dashboard</h1>
          <p class="text-sm text-muted mt-1">Track and analyze your spending</p>
        </div>
      </div>

      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Total Expenses -->
        <UCard :ui="{ body: 'space-y-1' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-wallet" class="size-5 text-primary" />
              <span class="text-sm font-medium text-muted">Total Expenses</span>
            </div>
          </template>
          <div class="text-2xl font-bold">{{ formatCurrency(totalAmount) }}</div>
          <p class="text-xs text-muted">{{ expenseCount }} transactions</p>
        </UCard>

        <!-- Average Expense -->
        <UCard :ui="{ body: 'space-y-1' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-trending-up" class="size-5 text-success" />
              <span class="text-sm font-medium text-muted">Average Expense</span>
            </div>
          </template>
          <div class="text-2xl font-bold">{{ formatCurrency(averageAmount) }}</div>
          <p class="text-xs text-muted">Per transaction</p>
        </UCard>

        <!-- Top Category -->
        <UCard :ui="{ body: 'space-y-1' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-tag" class="size-5 text-warning" />
              <span class="text-sm font-medium text-muted">Top Category</span>
            </div>
          </template>
          <div class="text-2xl font-bold capitalize">
            {{ categoryBreakdown[0]?.category || 'N/A' }}
          </div>
          <p class="text-xs text-muted">
            {{ categoryBreakdown[0] ? formatCurrency(categoryBreakdown[0].amount) : 'No expenses' }}
          </p>
        </UCard>

        <!-- Categories Count -->
        <UCard :ui="{ body: 'space-y-1' }">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-layers" class="size-5 text-info" />
              <span class="text-sm font-medium text-muted">Categories</span>
            </div>
          </template>
          <div class="text-2xl font-bold">{{ categories.length }}</div>
          <p class="text-xs text-muted">Active categories</p>
        </UCard>
      </div>

      <!-- Category Breakdown Visualization -->
      <UCard v-if="categoryBreakdown.length > 0" :ui="{ root: 'overflow-visible' }">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-pie-chart" class="size-5" />
            <span class="font-semibold">Spending by Category</span>
          </div>
        </template>
        <div class="space-y-3">
          <div
            v-for="item in categoryBreakdown"
            :key="item.category"
            class="space-y-2"
          >
            <div class="flex items-center justify-between text-sm">
              <div class="flex items-center gap-2">
                <UBadge variant="subtle" color="neutral" size="sm" class="capitalize">
                  {{ item.category }}
                </UBadge>
                <span class="text-muted">{{ item.percentage.toFixed(1) }}%</span>
              </div>
              <span class="font-medium">{{ formatCurrency(item.amount) }}</span>
            </div>
            <UProgress :model-value="item.percentage" :max="100" size="sm" />
          </div>
        </div>
      </UCard>

      <!-- Expenses Table -->
      <UCard :ui="{ root: 'overflow-visible' }">
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-list" class="size-5" />
              <span class="font-semibold">Expenses</span>
            </div>
            <div class="text-sm text-muted">
              Showing {{ filteredData.length }} of {{ data.length }} expenses
            </div>
          </div>
        </template>

        <!-- Loading State -->
        <div v-if="status === 'pending'" class="space-y-3">
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
          <USkeleton class="h-10 w-full" />
        </div>

        <!-- Table -->
        <div v-else-if="filteredData.length > 0">
          <UTable
            :data="filteredData"
            :columns="columns"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <UIcon name="i-lucide-inbox" class="size-12 text-muted mx-auto mb-4" />
          <h3 class="text-lg font-semibold mb-2">No expenses found</h3>
          <p class="text-sm text-muted mb-4">
            {{ hasActiveFilters ? 'Try adjusting your filters' : 'Start tracking your expenses' }}
          </p>
          <UButton
            v-if="hasActiveFilters"
            variant="subtle"
            @click="clearFilters"
          >
            Clear Filters
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
