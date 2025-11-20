import { db } from '~~/server/utils/db'
import { expenses as ExpensesSchema } from '~~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const query = getQuery<{ telegramUserId: string | undefined }>(event)
  const secret = getHeader(event, 'x-api-key')

  if (!session.user && secret !== process.env.APP_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const telegramUserId = session.user?.telegramUserId || query.telegramUserId

  if (!telegramUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing telegram user id' })
  }

  const expenses = await db.select().from(ExpensesSchema)
    .where(eq(ExpensesSchema.telegramUserId, telegramUserId))
    .orderBy(desc(ExpensesSchema.transactionDate))

  return {
    success: true,
    data: expenses
  }
})
