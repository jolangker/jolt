import { db } from '~~/server/utils/db'
import { expenses as ExpensesSchema } from '~~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId

  const expenses = await db.select().from(ExpensesSchema)
    .where(eq(ExpensesSchema.userId, userId))
    .orderBy(desc(ExpensesSchema.transactionDate))

  return {
    success: true,
    data: expenses,
  }
})
