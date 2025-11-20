import { generateShortToken } from '~~/server/utils/token'
import { db } from '~~/server/utils/db'
import { links } from '~~/server/db/schema'
import z from 'zod'

export default defineEventHandler(async (event) => {
  const secret = getHeader(event, 'x-api-key')
  if (secret !== process.env.APP_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readValidatedBody(event, z.object({
    telegramUserId: z.string(),
    ttlMinutes: z.number().optional().default(60),
  }).parse)

  const token = generateShortToken()
  const expiresAt = new Date(Date.now() + body.ttlMinutes * 60 * 1000)

  await db.insert(links).values({ telegramUserId: body.telegramUserId, token, expiresAt })

  return {
    success: true,
    data: {
      url: `${process.env.APP_BASE_URL}/entry?token=${token}`,
      expiresAt,
    }
  }
})
