import { db } from '~~/server/utils/db'
import z from 'zod'
import { transactions } from '~~/server/db/schema'
import { and, eq, gte, ilike, inArray, lte, sql } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    limit: z.string().optional(),
    offset: z.string().optional().default('0'),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['expense', 'income']).nullable().optional(),
    categories: z.string().nullable().optional(),
    search: z.string().nullable().optional(),
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
    if (query.search) filters.push(ilike(transactions.note, `%${query.search}%`))
    return and(...filters)
  }

  const data = await db.query.transactions.findMany({
    where: filterBuilder(),
    orderBy: (transactions, { desc }) => [desc(transactions.date), desc(transactions.createdAt)],
    with: {
      category: true,
    },
    limit: query.limit ? parseInt(query.limit) : undefined,
    offset: parseInt(query.offset),
  })

  const [{ total }] = await db.select({
    total: sql<number>`count(*)`.mapWith(Number),
  }).from(transactions).where(filterBuilder())

  return {
    success: true,
    data,
    meta: {
      count: data.length,
      total,
    },
  }
})
