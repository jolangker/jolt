import { PrismaClient } from '@prisma/client'
import { generateShortToken } from '~~/server/utils/token'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const secret = getHeader(event, 'x-api-key')
  if (secret !== config.N8N_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody(event)
  const { telegramUserId, ttlMinutes = 15 } = body

  const token = generateShortToken()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000)

  await prisma.shortLink.create({
    data: {
      token,
      telegramUserId,
      expiresAt,
    },
  })

  return {
    ok: true,
    url: `${config.APP_BASE_URL}/entry?token=${token}`,
    expiresAt,
  }
})
