import { transactionRepository, type TransactionFilters } from '~~/server/repositories'
import dayjs from 'dayjs'
import type { TransactionPayload } from '~~/shared/types/transaction'

export interface ListTransactionsParams extends TransactionFilters {
  limit?: string
  offset?: string
}

// Helper to enforce 7-day limit for FREE users
function enforceFreeTierLimit(tier: 'FREE' | 'PRO', filters: { startDate?: string | null, endDate?: string | null }) {
  if (tier === 'FREE') {
    const sevenDaysAgo = dayjs().subtract(7, 'days').format('YYYY-MM-DD')

    // Check if trying to access data older than 7 days
    if (filters.startDate && dayjs(filters.startDate).isBefore(sevenDaysAgo)) {
      throw createError({
        statusCode: 402,
        statusMessage: 'FREE user tidak dapat mengakses transaksi sebelum 7 hari. Upgrade ke PRO untuk mengakses semua transaksi.',
      })
    }

    // Auto-set startDate if not provided
    if (!filters.startDate) {
      filters.startDate = sevenDaysAgo
    }
  }
}

export const transactionService = {
  async list(userId: string, tier: 'FREE' | 'PRO', params: ListTransactionsParams) {
    enforceFreeTierLimit(tier, params)

    const pagination = {
      limit: params.limit ? parseInt(params.limit) : undefined,
      offset: params.offset ? parseInt(params.offset) : 0,
    }

    const [data, total] = await Promise.all([
      transactionRepository.findMany(userId, params, pagination),
      transactionRepository.count(userId, params),
    ])

    return {
      success: true,
      data,
      meta: {
        count: data.length,
        total,
      },
    }
  },

  async getById(userId: string, tier: 'FREE' | 'PRO', id: number) {
    const transaction = await transactionRepository.findById(userId, id)

    if (!transaction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      })
    }

    // Check if FREE user trying to access old transaction
    if (tier === 'FREE' && dayjs(transaction.date).isBefore(dayjs().subtract(7, 'days'))) {
      throw createError({
        statusCode: 402,
        statusMessage: 'FREE user tidak dapat mengakses transaksi sebelum 7 hari. Upgrade ke PRO untuk mengakses semua transaksi.',
      })
    }

    return { success: true, data: transaction }
  },

  async create(userId: string, data: TransactionPayload) {
    const transaction = await transactionRepository.create(userId, data)

    return { success: true, data: transaction }
  },

  async update(userId: string, tier: 'FREE' | 'PRO', id: number, data: TransactionPayload) {
    // First check if transaction exists and is accessible
    const existing = await transactionRepository.findById(userId, id)

    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      })
    }

    // Check if FREE user trying to update old transaction
    if (tier === 'FREE' && dayjs(existing.date).isBefore(dayjs().subtract(7, 'days'))) {
      throw createError({
        statusCode: 402,
        statusMessage: 'FREE user tidak dapat mengubah transaksi sebelum 7 hari. Upgrade ke PRO untuk mengakses semua transaksi.',
      })
    }

    const transaction = await transactionRepository.update(userId, id, data)
    return { success: true, data: transaction }
  },

  async delete(userId: string, tier: 'FREE' | 'PRO', id: number) {
    // First check if transaction exists and is accessible
    const existing = await transactionRepository.findById(userId, id)

    if (!existing) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      })
    }

    // Check if FREE user trying to delete old transaction
    if (tier === 'FREE' && dayjs(existing.date).isBefore(dayjs().subtract(7, 'days'))) {
      throw createError({
        statusCode: 402,
        statusMessage: 'FREE user tidak dapat menghapus transaksi sebelum 7 hari. Upgrade ke PRO untuk mengakses semua transaksi.',
      })
    }

    await transactionRepository.delete(userId, id)
    return { success: true }
  },

  async getSummaryReport(userId: string, tier: 'FREE' | 'PRO', params: TransactionFilters) {
    enforceFreeTierLimit(tier, params)

    const data = await transactionRepository.findMany(userId, params)

    const count = data.length
    const amount = data.reduce((acc, item) => acc + parseFloat(item.amount), 0)

    const expenseCategories = data
      .filter(trx => trx.type === 'expense')
      .map(trx => ({
        date: trx.date,
        category: trx.category.name,
        amount: trx.amount,
      }))

    const incomeCategories = data
      .filter(trx => trx.type === 'income')
      .map(trx => ({
        date: trx.date,
        category: trx.category.name,
        amount: trx.amount,
      }))

    const byCategory: Record<string, Record<string, { count: number, amount: number }>> = {}
    const byMonth: Record<string, Record<string, { count: number, amount: number }>> = {}

    if (params.type === 'expense' || !params.type) {
      byCategory['expense'] = {}
      byMonth['expense'] = {}

      for (const category of expenseCategories) {
        if (!byCategory['expense'][category.category]) {
          byCategory['expense'][category.category] = { count: 0, amount: 0 }
        }
        byCategory['expense'][category.category].count += 1
        byCategory['expense'][category.category].amount += parseFloat(category.amount)

        const month = dayjs(category.date).format('YYYY-MM')
        if (!byMonth['expense'][month]) {
          byMonth['expense'][month] = { count: 0, amount: 0 }
        }
        byMonth['expense'][month].count += 1
        byMonth['expense'][month].amount += parseFloat(category.amount)
      }
    }

    if (params.type === 'income' || !params.type) {
      byCategory['income'] = {}
      byMonth['income'] = {}

      for (const category of incomeCategories) {
        if (!byCategory['income'][category.category]) {
          byCategory['income'][category.category] = { count: 0, amount: 0 }
        }
        byCategory['income'][category.category].count += 1
        byCategory['income'][category.category].amount += parseFloat(category.amount)

        const month = dayjs(category.date).format('YYYY-MM')
        if (!byMonth['income'][month]) {
          byMonth['income'][month] = { count: 0, amount: 0 }
        }
        byMonth['income'][month].count += 1
        byMonth['income'][month].amount += parseFloat(category.amount)
      }
    }

    return {
      summary: {
        period: {
          start: params.startDate,
          end: params.endDate,
        },
        count,
        amount,
        byCategory,
        byMonth,
      },
    }
  },

  async reset(userId: string) {
    await transactionRepository.reset(userId)
    return { success: true }
  },
}
