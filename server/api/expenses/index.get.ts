import { db } from '~~/server/utils/db'
import z from 'zod'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    categories: z.string().nullable().optional(),
  }).parse)

  const expenses = await db.query.expenses.findMany({
    where: (expenses, { eq, and, gte, lte, inArray }) => {
      const filters = []
      filters.push(eq(expenses.userId, userId))
      if (query.startDate) filters.push(gte(expenses.transactionDate, new Date(query.startDate)))
      if (query.endDate) filters.push(lte(expenses.transactionDate, new Date(query.endDate)))
      if (query.categories) {
        const categories = query.categories.split(',')
        filters.push(inArray(expenses.category, categories))
      }

      return and(...filters)
    },
    orderBy: (expenses, { desc }) => [desc(expenses.transactionDate), desc(expenses.createdAt)],
  })

  return {
    success: true,
    data: expenses,
  }
})
