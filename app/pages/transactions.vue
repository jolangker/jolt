<script setup lang="ts">
import { LazyFilterDrawer } from '#components'

definePageMeta({
  middleware: 'auth',
  layout: 'authenticated',
})

const { isFree } = useAuth()

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

// Check if FREE user is trying to filter beyond 7 days
const isFilterLocked = computed(() => {
  if (!isFree.value) return false
  if (!filter.startDate) return false

  const sevenDaysAgo = dayjs().subtract(7, 'days').format('YYYY-MM-DD')
  return dayjs(filter.startDate).isBefore(sevenDaysAgo)
})

// Mock transactions for locked preview
const mockTransactions: Transaction[] = [
  {
    id: 1,
    type: 'expense',
    amount: '150000',
    note: 'Makan siang',
    date: new Date(),
    category: { id: 1, name: 'Makanan', icon: 'i-lucide-utensils', type: 'expense', isDefault: true },
  },
  {
    id: 2,
    type: 'income',
    amount: '5000000',
    note: 'Gaji bulanan',
    date: new Date(),
    category: { id: 2, name: 'Gaji', icon: 'i-lucide-wallet', type: 'income', isDefault: true },
  },
  {
    id: 3,
    type: 'expense',
    amount: '250000',
    note: 'Bensin motor',
    date: new Date(),
    category: { id: 3, name: 'Transportasi', icon: 'i-lucide-car', type: 'expense', isDefault: true },
  },
]

const transactions = ref<Transaction[]>([])

const overlay = useOverlay()
const filterDrawer = overlay.create(LazyFilterDrawer)

// Only fetch if not locked
const { data, pending } = isFilterLocked.value
  ? { data: ref(null), pending: ref(false) }
  : await useFetch('/api/transactions', {
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
  if (isFilterLocked.value) return false
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
            label="Filter"
            icon="i-solar:filter-outline"
            color="neutral"
            variant="outline"
            @click="openFilterDrawer"
          />
        </UFieldGroup>

        <!-- Locked state: Blurred mock data with PRO notice -->
        <div
          v-if="isFilterLocked"
          class="relative flex-1"
        >
          <div class="blur-sm pointer-events-none select-none space-y-4">
            <div
              v-for="transaction in mockTransactions"
              :key="transaction.id"
            >
              <TransactionCard
                :transaction="transaction"
                class="flex-1"
              />
            </div>
          </div>
          <!-- Upgrade overlay -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-elevated/60 backdrop-blur-[2px] rounded-lg">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-lock"
                class="size-6 text-primary"
              />
              <UBadge
                label="PRO"
                color="primary"
                variant="subtle"
              />
            </div>
            <div class="text-center px-4">
              <h3 class="font-semibold">
                Data Historis Terbatas
              </h3>
              <p class="text-sm text-dimmed mt-1">
                FREE user hanya bisa mengakses transaksi 7 hari terakhir.
              </p>
            </div>
            <UButton
              label="Upgrade ke PRO"
              icon="i-lucide-sparkles"
              to="/profile"
            />
          </div>
        </div>

        <!-- Normal unlocked state -->
        <template v-else-if="data?.meta?.total">
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

        <!-- Empty state -->
        <UEmpty
          v-else
          icon="i-solar:wallet-2-outline"
          title="Tidak ada transaksi"
          description="Kamu belum memiliki transaksi"
          variant="naked"
          class="flex-1"
        />
      </div>
    </template>
  </UDashboardPanel>
</template>

