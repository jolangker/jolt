<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const limit = shallowRef(10)
const offset = shallowRef(0)
const type = shallowRef('all')
const search = shallowRef('')
const searchDebounced = refDebounced(search, 500)

const transactions = ref<Transaction[]>([])

const { data, pending } = await useFetch('/api/transactions', {
  query: computed(() => ({
    type: type.value === 'all' ? undefined : type.value,
    search: searchDebounced.value,
    limit: limit.value,
    offset: offset.value,
  })),
  onResponse: ({ response }) => {
    if (!response._data) return
    transactions.value = [...transactions.value, ...response._data.data]
  },
})

const canLoadMore = computed(() => {
  if (!data.value?.meta?.total) return false
  return (data.value.meta.total > transactions.value.length) && !pending.value
})

const types = [
  { label: 'All', value: 'all' },
  { label: 'Income', value: 'income' },
  { label: 'Expense', value: 'expense' },
]

const wrapper = useTemplateRef('wrapper')

useInfiniteScroll(
  wrapper,
  () => {
    offset.value += limit.value
  },
  {
    distance: 20,
    canLoadMore: () => {
      return canLoadMore.value
    },
  },
)

watch(searchDebounced, () => {
  transactions.value = []
  offset.value = 0
})
</script>

<template>
  <UDashboardPanel
    id="transactions"
    :ui="{ body: 'p-0!' }"
  >
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
        <template #right>
          <USelect
            v-model="type"
            :items="types"
            class="w-40"
          />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <div
        ref="wrapper"
        class="flex-1 flex flex-col gap-4 overflow-auto p-4 sm:p-6"
      >
        <UFieldGroup size="xl">
          <UInput
            v-model="search"
            placeholder="Search transactions"
            icon="i-solar:magnifer-outline"
            class="w-full"
          />
          <UButton
            label="Filter"
            icon="i-solar:filter-outline"
            color="neutral"
            variant="outline"
          />
        </UFieldGroup>
        <template v-if="data?.meta?.total">
          <div
            v-for="transaction in transactions"
            :key="transaction.id"
          >
            <TransactionCard
              :transaction="transaction"
              class="flex-1"
            />
          </div>
        </template>
        <UEmpty
          v-else
          icon="i-solar:wallet-2-outline"
          title="No transactions found"
          variant="naked"
          class="flex-1"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
