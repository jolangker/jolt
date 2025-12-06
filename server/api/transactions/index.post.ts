import { transactionInsertSchema } from '~~/server/db/schemas/transactions'
import { transactionService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const body = await readValidatedBody(event, transactionInsertSchema.parse)

  return transactionService.create(userId, body)
})
