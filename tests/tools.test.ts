import { describe, it, expect } from 'bun:test'
import { executeAddTransaction } from '../server/agent/tools/add-transaction'
import { executeUpdateTransaction } from '../server/agent/tools/update-transaction'
import { executeDeleteTransaction } from '../server/agent/tools/delete-transaction'
import { executeListTransactions } from '../server/agent/tools/list-transactions'
import { executeGetSummary } from '../server/agent/tools/get-summary'
import { executeGetCategories } from '../server/agent/tools/get-categories'
import { executeCreateCategory } from '../server/agent/tools/create-category'
import { executeGetUserInfo } from '../server/agent/tools/get-user-info'
import { executeRequestDashboardAccess } from '../server/agent/tools/request-dashboard-access'

const userId = 'test-user-id'

function mockTransaction(overrides = {}) {
  return {
    id: 1,
    type: 'expense' as const,
    amount: '25000',
    note: 'lunch',
    date: new Date('2025-01-15'),
    categoryId: 1,
    userId,
    createdAt: new Date(),
    ...overrides,
  }
}

function mockCategory(overrides = {}) {
  return {
    id: 1,
    name: 'Food',
    type: 'expense' as const,
    description: 'Food and drinks',
    icon: null,
    isDefault: true,
    userId: null,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('add_transaction tool', () => {
  it('creates a transaction with correct payload', async () => {
    const mockCreate = async (uid: string, data: { type: string, amount: string, note: string, date: string, categoryId: number }) => {
      expect(uid).toBe(userId)
      expect(data.type).toBe('expense')
      expect(data.amount).toBe('25000')
      expect(data.note).toBe('lunch')
      expect(data.date).toBe('2025-01-15')
      expect(data.categoryId).toBe(1)
      return { success: true, data: mockTransaction() }
    }

    const result = await executeAddTransaction(
      userId,
      { type: 'expense', amount: 25000, categoryId: 1, note: 'lunch', date: '2025-01-15' },
      mockCreate,
    )

    expect(result.id).toBe(1)
    expect(result.type).toBe('expense')
    expect(result.amount).toBe('25000')
    expect(result.note).toBe('lunch')
    expect(result.date).toBe('2025-01-15')
  })
})

describe('update_transaction tool', () => {
  it('updates by id directly', async () => {
    const mockUpdate = async (_uid: string, id: number, _data: Record<string, unknown>) => ({
      success: true,
      data: mockTransaction({ id, amount: '30000', note: 'updated lunch' }),
    })

    const result = await executeUpdateTransaction(
      userId,
      { id: 42, amount: 30000, note: 'updated lunch' },
      {
        update: mockUpdate,
        findMany: async () => [],
        findById: async () => mockTransaction({ id: 42 }),
      },
    )

    expect(result.id).toBe(42)
    expect(result.amount).toBe('30000')
    expect(result.note).toBe('updated lunch')
  })

  it('returns error when no match found by search', async () => {
    const result = await executeUpdateTransaction(
      userId,
      { search: 'nonexistent' },
      {
        update: async () => ({ success: true, data: mockTransaction() }),
        findMany: async () => [],
        findById: async () => undefined as unknown as ReturnType<typeof mockTransaction>,
      },
    )

    expect(result).toEqual({ error: 'No matching transaction found' })
  })

  it('returns ambiguity error when multiple matches found', async () => {
    const result = await executeUpdateTransaction(
      userId,
      { search: 'bakso' },
      {
        update: async () => ({ success: true, data: mockTransaction() }),
        findMany: async () => [
          { ...mockTransaction({ id: 1, note: 'bakso ayam', amount: '15000' }), category: mockCategory() },
          { ...mockTransaction({ id: 2, note: 'bakso urat', amount: '20000' }), category: mockCategory() },
        ],
        findById: async () => undefined as unknown as ReturnType<typeof mockTransaction>,
      },
    )

    expect((result as { error: string }).error).toBe('Multiple transactions match. Please specify which one.')
    expect((result as { matches: unknown[] }).matches).toHaveLength(2)
  })

  it('returns error when transaction not found by id', async () => {
    const result = await executeUpdateTransaction(
      userId,
      { id: 999 },
      {
        update: async () => ({ success: true, data: mockTransaction() }),
        findMany: async () => [],
        findById: async () => undefined as unknown as ReturnType<typeof mockTransaction>,
      },
    )

    expect(result).toEqual({ error: 'Transaction not found' })
  })
})

describe('delete_transaction tool', () => {
  it('deletes by id', async () => {
    let deleted = false

    const result = await executeDeleteTransaction(
      userId,
      { id: 42 },
      {
        deleteTransaction: async () => {
          deleted = true
          return { success: true }
        },
        findMany: async () => [],
        findById: async () => mockTransaction({ id: 42 }),
      },
    )

    expect(deleted).toBe(true)
    expect(result.deleted).toBe(true)
    expect(result.id).toBe(42)
    expect(result.note).toBe('lunch')
  })

  it('returns error when no match found', async () => {
    const result = await executeDeleteTransaction(
      userId,
      { search: 'nonexistent' },
      {
        deleteTransaction: async () => ({ success: true }),
        findMany: async () => [],
        findById: async () => undefined as unknown as ReturnType<typeof mockTransaction>,
      },
    )

    expect(result).toEqual({ error: 'No matching transaction found' })
  })

  it('returns ambiguity error when multiple matches found', async () => {
    const result = await executeDeleteTransaction(
      userId,
      { search: 'bakso' },
      {
        deleteTransaction: async () => ({ success: true }),
        findMany: async () => [
          { ...mockTransaction({ id: 1, note: 'bakso ayam' }), category: mockCategory() },
          { ...mockTransaction({ id: 2, note: 'bakso urat' }), category: mockCategory() },
        ],
        findById: async () => undefined as unknown as ReturnType<typeof mockTransaction>,
      },
    )

    expect((result as { error: string }).error).toBe('Multiple transactions match. Please specify which one to delete.')
  })
})

describe('list_transactions tool', () => {
  it('lists transactions with correct format', async () => {
    const result = await executeListTransactions(
      userId,
      { limit: 5 },
      async () => ({
        success: true,
        data: [{ ...mockTransaction(), category: mockCategory() }],
        meta: { count: 1, total: 1 },
      }),
    )

    expect(result.count).toBe(1)
    expect(result.total).toBe(1)
    expect(result.transactions[0].id).toBe(1)
    expect(result.transactions[0].category).toBe('Food')
  })
})

describe('get_summary tool', () => {
  it('returns summary data', async () => {
    const result = await executeGetSummary(
      userId,
      { type: 'expense', startDate: '2025-01-01', endDate: '2025-01-31' },
      async () => ({
        summary: {
          period: { start: '2025-01-01', end: '2025-01-31' },
          count: 5,
          amount: 125000,
          byCategory: { expense: { Food: { count: 3, amount: 75000 } } },
          byMonth: { expense: { '2025-01': { count: 5, amount: 125000 } } },
        },
      }),
    )

    expect(result.count).toBe(5)
    expect(result.totalAmount).toBe(125000)
    expect(result.period.start).toBe('2025-01-01')
  })
})

describe('get_categories tool', () => {
  it('returns formatted categories', async () => {
    const result = await executeGetCategories(
      userId,
      async () => ({
        success: true,
        data: [
          mockCategory(),
          mockCategory({ id: 2, name: 'Pets', description: 'Pet expenses', isDefault: false, userId }),
        ],
      }),
    )

    expect(result.categories).toHaveLength(2)
    expect(result.categories[0].name).toBe('Food')
    expect(result.categories[0].isDefault).toBe(true)
    expect(result.categories[1].name).toBe('Pets')
    expect(result.categories[1].isDefault).toBe(false)
  })
})

describe('create_category tool', () => {
  it('creates a category with correct payload', async () => {
    const result = await executeCreateCategory(
      userId,
      { name: 'Pets', description: 'Pet expenses', type: 'expense' },
      async () => ({
        success: true,
        data: mockCategory({ id: 10, name: 'Pets', description: 'Pet expenses', isDefault: false, userId }),
      }),
    )

    expect(result.id).toBe(10)
    expect(result.name).toBe('Pets')
    expect(result.type).toBe('expense')
  })
})

describe('get_user_info tool', () => {
  it('returns user info with default categories', async () => {
    const result = await executeGetUserInfo(
      userId,
      async () => [
        mockCategory(),
        mockCategory({ id: 2, name: 'Custom', isDefault: false, userId }),
      ],
    )

    expect(result.userId).toBe(userId)
    expect(result.defaultCategories).toHaveLength(1)
    expect(result.defaultCategories[0].name).toBe('Food')
  })
})

describe('request_dashboard_access tool', () => {
  it('returns delivery instructions without exposing the access URL', async () => {
    const result = await executeRequestDashboardAccess(userId, async (id) => {
      expect(id).toBe(userId)
      return { url: 'https://jolt.test/login?t=secret', expiresAt: new Date('2025-01-15T00:05:00Z') }
    })

    expect(result).toEqual({ delivery: 'telegram_private_message', expiresAt: '2025-01-15T00:05:00.000Z' })
  })
})
