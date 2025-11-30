import { db } from '~~/server/utils/db'
import z from 'zod'
import { transactions } from '~~/server/db/schema'
import { and, eq, gte, inArray, lte } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['expense', 'income']).optional(),
    categories: z.string().nullable().optional(),
  }).parse)

  const filterBuilder = () => {
    const filters = []
    filters.push(eq(transactions.userId, userId))
    if (query.startDate) filters.push(gte(transactions.date, new Date(query.startDate)))
    if (query.endDate) filters.push(lte(transactions.date, new Date(query.endDate)))
    if (query.type) filters.push(eq(transactions.type, query.type))
    if (query.categories) {
      const categories = query.categories.split(',').map(category => parseInt(category))
      filters.push(inArray(transactions.categoryId, categories))
    }
    return and(...filters)
  }

  const data = await db.query.transactions.findMany({
    where: filterBuilder(),
    orderBy: (transactions, { desc }) => [desc(transactions.date), desc(transactions.createdAt)],
    with: {
      category: true,
    },
  })

  const count = data.length
  const amount = data.reduce((acc, item) => acc + parseFloat(item.amount), 0)

  const expenseCategories = data.filter(trx => trx.type === 'expense').map(trx => ({
    date: trx.date,
    category: trx.category.name,
    amount: trx.amount,
  }))
  const incomeCategories = data.filter(trx => trx.type === 'income').map(trx => ({
    date: trx.date,
    category: trx.category.name,
    amount: trx.amount,
  }))

  const byCategory: Record<string, Record<string, { count: number, amount: number }>> = {}
  const byMonth: Record<string, Record<string, { count: number, amount: number }>> = {}

  if (query.type === 'expense' || !query.type) {
    byCategory['expense'] = {}
    byMonth['expense'] = {}

    for (const category of expenseCategories) {
      if (!byCategory['expense'][category.category]) {
        byCategory['expense'][category.category] = {
          count: 0,
          amount: 0,
        }
      }
      byCategory['expense'][category.category].count += 1
      byCategory['expense'][category.category].amount += parseFloat(category.amount)

      const month = dayjs(category.date).format('YYYY-MM')
      if (!byMonth['expense'][month]) {
        byMonth['expense'][month] = {
          count: 0,
          amount: 0,
        }
      }
      byMonth['expense'][month].count += 1
      byMonth['expense'][month].amount += parseFloat(category.amount)
    }
  }
  if (query.type === 'income' || !query.type) {
    byCategory['income'] = {}
    byMonth['income'] = {}
    for (const category of incomeCategories) {
      if (!byCategory['income'][category.category]) {
        byCategory['income'][category.category] = {
          count: 0,
          amount: 0,
        }
      }
      byCategory['income'][category.category].count += 1
      byCategory['income'][category.category].amount += parseFloat(category.amount)

      const month = dayjs(category.date).format('YYYY-MM')
      if (!byMonth['income'][month]) {
        byMonth['income'][month] = {
          count: 0,
          amount: 0,
        }
      }
      byMonth['income'][month].count += 1
      byMonth['income'][month].amount += parseFloat(category.amount)
    }
  }
  const response = {
    summary: {
      period: {
        start: query.startDate,
        end: query.endDate,
      },
      count,
      amount,
      byCategory,
      byMonth,
    },
  }

  return response
})
