import { transactionRepository, type TransactionFilters } from '~~/server/repositories'
import dayjs from 'dayjs'
import type { TransactionPayload } from '~~/shared/types/transaction'

export interface ListTransactionsParams extends TransactionFilters {
  limit?: string
  offset?: string
}

export const transactionService = {
  async list(userId: string, params: ListTransactionsParams) {
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

  async getById(userId: string, id: number) {
    const transaction = await transactionRepository.findById(userId, id)

    if (!transaction) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Transaction not found',
      })
    }

    return { success: true, data: transaction }
  },

  async create(userId: string, data: TransactionPayload) {
    const transaction = await transactionRepository.create(userId, data)

    return { success: true, data: transaction }
  },

  async update(userId: string, id: number, data: TransactionPayload) {
    const transaction = await transactionRepository.update(userId, id, data)

    return { success: true, data: transaction }
  },

  async delete(userId: string, id: number) {
    await transactionRepository.delete(userId, id)
    return { success: true }
  },

  async getSummaryReport(userId: string, params: TransactionFilters) {
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
}
