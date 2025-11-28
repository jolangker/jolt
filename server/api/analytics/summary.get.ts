import { eq, gte, lte, and, sql } from 'drizzle-orm'
import z from 'zod'
import { transactions } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
  }).parse)

  const filterBuilder = () => {
    const filters = []
    filters.push(eq(transactions.userId, userId))
    if (query.startDate) filters.push(gte(transactions.date, new Date(query.startDate)))
    if (query.endDate) filters.push(lte(transactions.date, new Date(query.endDate)))
    return and(...filters)
  }

  const sum = await db.select({
    type: transactions.type,
    sum: sql<number>`sum(${transactions.amount})`,
  })
    .from(transactions)
    .groupBy(transactions.type)
    .where(filterBuilder())

  const [{ count }] = await db.select({
    count: sql<number>`count(${transactions.id})`,
  })
    .from(transactions)
    .where(filterBuilder())

  const income = sum.find(s => s.type === 'income')?.sum || 0
  const expense = sum.find(s => s.type === 'expense')?.sum || 0
  const nett = (income - expense).toString()

  return {
    success: true,
    data: {
      count,
      income,
      expense,
      nett,
    },
  }
})
