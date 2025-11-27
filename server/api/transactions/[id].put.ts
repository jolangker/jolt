import { transactions } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { transactionInsertSchema } from '~~/server/db/schemas/transactions'
import { and, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const transactionId = getRouterParam(event, 'id')

  if (!transactionId) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Transaction not found',
    })
  }

  if (Number.isNaN(Number(transactionId))) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Invalid transaction id',
    })
  }

  const body = await readValidatedBody(event, transactionInsertSchema.parse)

  const [data] = await db.update(transactions).set({
    categoryId: body.categoryId,
    amount: body.amount,
    type: body.type,
    date: new Date(body.date),
    note: body.note,
  }).where(
    and(
      eq(transactions.userId, userId),
      eq(transactions.id, Number(transactionId)),
    )
  ).returning()

  return {
    success: true,
    data,
  }
})
