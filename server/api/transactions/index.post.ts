import { transactions } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { transactionInsertSchema } from '~~/server/db/schemas/transactions'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const body = await readValidatedBody(event, transactionInsertSchema.parse)

  const [data] = await db.insert(transactions).values({
    userId: userId,
    categoryId: body.categoryId,
    amount: body.amount,
    type: body.type,
    date: new Date(body.date),
    note: body.note,
  }).returning()

  return {
    success: true,
    data,
  }
})
