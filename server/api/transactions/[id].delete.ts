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

  return transactionService.delete(userId, Number(transactionId))
})
