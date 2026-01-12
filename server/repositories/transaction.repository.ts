import { db } from '~~/server/utils/db'
import { transactions } from '~~/server/db/schema'
import { and, eq, gte, ilike, inArray, isNull, lte, sql } from 'drizzle-orm'
import type { TransactionPayload } from '~~/shared/types/transaction'

export interface TransactionFilters {
  startDate?: string | null
  endDate?: string | null
  type?: 'expense' | 'income' | null
  categories?: string | null
  search?: string | null
}

export interface PaginationOptions {
  limit?: number
  offset?: number
}

function buildFilters(userId: string, filters: TransactionFilters) {
  const conditions = [eq(transactions.userId, userId), isNull(transactions.deletedAt)]

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
  if (filters.search) {
    conditions.push(ilike(transactions.note, `%${filters.search}%`))
  }

  return and(...conditions)
}

export const transactionRepository = {
  async findMany(userId: string, filters: TransactionFilters, pagination?: PaginationOptions) {
    return db.query.transactions.findMany({
      where: buildFilters(userId, filters),
      orderBy: (t, { desc }) => [desc(t.date), desc(t.createdAt)],
      with: { category: true },
      limit: pagination?.limit,
      offset: pagination?.offset,
    })
  },

  async findById(userId: string, id: number) {
    return db.query.transactions.findFirst({
      where: and(eq(transactions.userId, userId), eq(transactions.id, id)),
      with: { category: true },
    })
  },

  async count(userId: string, filters: TransactionFilters) {
    const [result] = await db
      .select({ total: sql<number>`count(*)`.mapWith(Number) })
      .from(transactions)
      .where(buildFilters(userId, filters))

    return result.total
  },

  async create(userId: string, data: TransactionPayload) {
    const [result] = await db.insert(transactions).values({
      userId,
      ...data,
      date: new Date(data.date),
    }).returning()

    return result
  },

  async createMany(userId: string, data: TransactionPayload[]) {
    const [result] = await db.insert(transactions).values(data.map(d => ({
      userId,
      ...d,
      date: new Date(d.date),
    }))).returning()

    return result
  },

  async update(userId: string, id: number, data: TransactionPayload) {
    const [result] = await db
      .update(transactions)
      .set({
        ...data,
        date: new Date(data.date),
      })
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)))
      .returning()

    return result
  },

  async delete(userId: string, id: number) {
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(and(eq(transactions.userId, userId), eq(transactions.id, id)))
  },

  async getSummaryByType(userId: string, filters: TransactionFilters) {
    return db
      .select({
        type: transactions.type,
        sum: sql<number>`sum(${transactions.amount})`,
      })
      .from(transactions)
      .where(buildFilters(userId, filters))
      .groupBy(transactions.type)
  },

  async reset(userId: string) {
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(eq(transactions.userId, userId))
  },
}
