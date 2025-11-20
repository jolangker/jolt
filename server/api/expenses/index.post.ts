import { expenses } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { expenseInsertSchema } from '~~/server/db/schemas/expenses'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const body = await readValidatedBody(event, expenseInsertSchema.parse)

  const [expense] = await db.insert(expenses).values({
    userId: userId,
    amount: body.amount,
    category: body.category,
    note: body.note,
    transactionDate: new Date(body.transactionDate),
  }).returning()

  return {
    success: true,
    data: expense,
  }
})
