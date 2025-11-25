import { db } from '~~/server/utils/db'
import z from 'zod'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['expense', 'income']).nullable().optional(),
    categories: z.string().nullable().optional(),
  }).parse)

  const transactions = await db.query.transactions.findMany({
    where: (transactions, { eq, and, gte, lte, inArray }) => {
      const filters = []
      filters.push(eq(transactions.userId, userId))
      if (query.startDate) filters.push(gte(transactions.date, new Date(query.startDate)))
      if (query.endDate) filters.push(lte(transactions.date, new Date(query.endDate)))
      if (query.type) filters.push(eq(transactions.type, query.type))
      if (query.categories) {
        const categories = query.categories.split(',').map((category) => parseInt(category))
        filters.push(inArray(transactions.categoryId, categories))
      }

      return and(...filters)
    },
    orderBy: (transactions, { desc }) => [desc(transactions.date), desc(transactions.createdAt)],
    with: {
      category: true,
    }
  })

  return {
    success: true,
    data: transactions,
  }
})
