import { expenses } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-api-key')
  if (secret !== process.env.N8N_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { telegramUserId, amount, category, note, transactionDate } = body

  if (!telegramUserId || !amount || !category || !note || !transactionDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const [expense] = await db.insert(expenses).values({
    telegramUserId,
    amount,
    category,
    note,
    transactionDate: new Date(transactionDate),
  }).returning()

  return { success: true, expense }
})
