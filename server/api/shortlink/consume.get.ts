import { db } from '~~/server/utils/db'
import { links } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const { token } = getQuery<{ token: string | undefined }>(event)
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const [link] = await db.select().from(links).where(eq(links.token, token))

  if (!link) throw createError({ statusCode: 404, statusMessage: 'Invalid token' })

  if (link.expiresAt < new Date())
    throw createError({ statusCode: 410, statusMessage: 'Token expired' })

  await setUserSession(event, {
    user: {
      telegramUserId: link.telegramUserId,
    },
  }, {
    maxAge: (link.expiresAt.getTime() - link.createdAt.getTime()) / 1000,
  })

  return { ok: true }
})
