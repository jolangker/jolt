import { transactionInsertSchema } from '~~/server/db/schemas/transactions'
import { transactionService } from '~~/server/services'

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

  return transactionService.update(userId, Number(transactionId), body)
})
