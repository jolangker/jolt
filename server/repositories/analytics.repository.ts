import { db } from '~~/server/utils/db'
import { transactions, categories } from '~~/server/db/schema'
import { and, eq, gte, inArray, lte, sql } from 'drizzle-orm'

export interface AnalyticsFilters {
  startDate?: string | null
  endDate?: string | null
  type?: 'expense' | 'income'
  categories?: string | null
}

function buildFilters(userId: string, filters: AnalyticsFilters) {
  const conditions = [eq(transactions.userId, userId)]

  if (filters.startDate) {
    conditions.push(gte(transactions.date, new Date(filters.startDate)))
  }
  if (filters.endDate) {
    conditions.push(lte(transactions.date, new Date(filters.endDate)))
  }
  if (filters.type) {
    conditions.push(eq(transactions.type, filters.type))
  }
  if (filters.categories) {
    const categoryIds = filters.categories.split(',').map(c => parseInt(c))
    conditions.push(inArray(transactions.categoryId, categoryIds))
  }

  return and(...conditions)
}

export const analyticsRepository = {
  async getSummary(userId: string, filters: AnalyticsFilters) {
    const [countResult] = await db
      .select({ count: sql<number>`count(${transactions.id})` })
      .from(transactions)
      .where(buildFilters(userId, filters))

    const sumResult = await db
      .select({
        type: transactions.type,
        sum: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(buildFilters(userId, filters))
      .groupBy(transactions.type)

    return {
      count: countResult.count,
      sums: sumResult,
    }
  },

  async getDailyTransactions(userId: string, filters: AnalyticsFilters) {
    return db.query.transactions.findMany({
      where: buildFilters(userId, filters),
      orderBy: (t, { asc }) => [asc(t.date), asc(t.createdAt)],
      with: { category: true },
    })
  },

  async getCategoryBreakdown(userId: string, filters: AnalyticsFilters) {
    return db
      .select({
        category: categories.name,
        sum: sql<number>`sum(${transactions.amount})`.mapWith(Number),
        count: sql<number>`count(${transactions.id})`.mapWith(Number),
      })
      .from(transactions)
      .where(buildFilters(userId, filters))
      .innerJoin(categories, eq(transactions.categoryId, categories.id))
      .groupBy(categories.name)
  },
}
