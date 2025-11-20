import { generateShortToken } from '~~/server/utils/token'
import { db } from '~~/server/utils/db'
import { users, userTokens } from '~~/server/db/schema'
import z from 'zod'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    telegramUserId: z.string(),
  }).parse)

  const [user] = await db.select().from(users).where(eq(users.telegramUserId, body.telegramUserId))
  if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })

  const token = generateShortToken()
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  await db.insert(userTokens).values({ userId: user.id, token, expiresAt })

  return {
    success: true,
    data: {
      url: `${process.env.APP_BASE_URL}/login?t=${token}`,
      expiresAt,
    },
  }
})
