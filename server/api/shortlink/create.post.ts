import { generateShortToken } from '~~/server/utils/token'
import { db } from '~~/server/utils/db'
import { links } from '~~/server/db/schema'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-api-key')
  if (secret !== process.env.N8N_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { telegramUserId, ttlMinutes = 60 } = body

  const token = generateShortToken()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

  await db.insert(links).values({ telegramUserId, token, expiresAt })

  return {
    ok: true,
    url: `${process.env.APP_BASE_URL}/entry?token=${token}`,
    expiresAt,
  }
})
