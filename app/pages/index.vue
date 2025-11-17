<script setup lang='ts'>
import type { TableColumn } from '@nuxt/ui'
import type { Expense } from '~~/shared/types/expense'

const { loggedIn } = useUserSession()

watch(loggedIn, (to) => {
  if (!to) navigateTo('/entry', { replace: true })
})

const UBadge = resolveComponent('UBadge')

const { data } = useFetch('/api/expenses/list', {
  transform: ({ expenses }) => {
    return expenses.map((expense) => {
      return {
        amount: expense.amount,
        category: expense.category!,
        note: expense.note!,
      }
    })
  },
  default: () => [],
})

const columns: TableColumn<Expense>[] = [
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
    cell: ({ row }) => {
      return Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0,
      }).format(row.original.amount)
    },
  },
]

const totalAmount = computed(() => {
  const total = data.value.reduce((prev, curr) => prev + curr.amount, 0)
  return Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(total)
})
</script>

<template>
  <UDashboardPanel :ui="{ root: 'p-4', body: 'max-w-2xl mx-auto w-full bg-elevated/50 rounded-lg' }">
    <template #body>
      <UTable
        :data
        :columns
      />
      <div class="text-sm font-medium">
        Total Amount: {{ totalAmount }}
      </div>
    </template>
  </UDashboardPanel>
</template>
