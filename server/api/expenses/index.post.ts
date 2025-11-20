import { expenses } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'
import { expenseInsertSchema } from '~~/server/db/schemas/expenses'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-api-key')
  if (secret !== process.env.APP_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, expenseInsertSchema.parse)

  const [expense] = await db.insert(expenses).values({
    telegramUserId: body.telegramUserId,
    amount: body.amount,
    category: body.category,
    note: body.note,
    transactionDate: new Date(body.transactionDate),
  }).returning()

  return {
    success: true,
    data: expense
  }
})
