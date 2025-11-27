import { transactions } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
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

  await db.delete(transactions).where(
    and(
      eq(transactions.userId, userId),
      eq(transactions.id, Number(transactionId)),
    ),
  )

  return {
    success: true,
  }
})
