import z from 'zod'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    categories: z.string().nullable().optional(),
  }).parse)

  const transactions = (await db.query.transactions.findMany({
    where: (transactions, { eq, and, gte, lte, inArray }) => {
      const filters = []
      filters.push(eq(transactions.userId, userId))
      if (query.startDate) filters.push(gte(transactions.date, new Date(query.startDate)))
      if (query.endDate) filters.push(lte(transactions.date, new Date(query.endDate)))
      if (query.categories) {
        const categories = query.categories.split(',').map(category => parseInt(category))
        filters.push(inArray(transactions.categoryId, categories))
      }

      return and(...filters)
    },
    orderBy: (transactions, { asc }) => [asc(transactions.date), asc(transactions.createdAt)],
    with: {
      category: true,
    },
  })).reduce((acc, transaction) => {
    const date = transaction.date.toISOString().split('T')[0]
    if (!acc[date]) {
      acc[date] = {
        income: '0',
        expense: '0',
      }
    }
    if (transaction.type === 'income') {
      acc[date].income = transaction.amount.toString()
    }
    else {
      acc[date].expense = transaction.amount.toString()
    }
    return acc
  }, {} as Record<string, { income: string, expense: string }>)

  return {
    success: true,
    data: Object.entries(transactions).map(([date, { income, expense }]) => ({
      date,
      income,
      expense,
    })),
  }
})
