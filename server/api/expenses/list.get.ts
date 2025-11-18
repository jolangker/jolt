import { db } from '~~/server/utils/db'
import { expenses } from '~~/server/db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const session = await getUserSession(event)
  const query = getQuery<{ telegramUserId: string | undefined }>(event)
  const secret = getHeader(event, 'x-api-key')

  if (!session.user && secret !== config.N8N_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const telegramUserId = session.user?.telegramUserId || query.telegramUserId

  if (!telegramUserId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing telegram user id' })
  }

  const responses = await db.select().from(expenses)
    .where(eq(expenses.telegramUserId, telegramUserId))
    .orderBy(desc(expenses))

  return { expenses: responses }
})
