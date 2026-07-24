<script setup lang="ts">
import { LazyFilterDrawer } from '#components'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

interface Filter {
  type: 'income' | 'expense'
  categories: string
  startDate: string
  endDate: string
}

const limit = shallowRef(10)
const offset = shallowRef(0)
const search = shallowRef('')
const searchDebounced = refDebounced(search, 500)
const filter = reactive<Partial<Filter>>({
  type: undefined,
  categories: undefined,
  startDate: undefined,
  endDate: undefined,
})

const transactions = ref<Transaction[]>([])

const overlay = useOverlay()
const filterDrawer = overlay.create(LazyFilterDrawer)

const { data, pending } = await useFetch('/api/transactions', {
  query: computed(() => ({
    search: searchDebounced.value,
    limit: limit.value,
    offset: offset.value,
    ...filter,
  })),
  onResponse: ({ response }) => {
    if (!response._data) return
    // @ts-ignore
    transactions.value = [...transactions.value, ...response._data.data]
  },
})

const canLoadMore = computed(() => {
  if (!data.value?.meta?.total) return false
  return (data.value.meta.total > transactions.value.length) && !pending.value
})

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

const openFilterDrawer = () => {
  filterDrawer.open({
    onApply: (state) => {
      transactions.value = []
      offset.value = 0
      filter.type = state.type === 'all' ? undefined : state.type
      filter.categories = state.categories?.join(',')
      filter.startDate = state.startDate
      filter.endDate = state.endDate
    },
  })
}
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
            Semua Transaksi
          </div>
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
            placeholder="Cari transaksi"
            icon="i-solar:magnifer-outline"
            class="w-full"
          />
          <UButton
            label="Saring"
            icon="i-solar:filter-outline"
            color="neutral"
            variant="outline"
            @click="openFilterDrawer"
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
          title="Belum ada transaksi"
          variant="naked"
          class="flex-1"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>
