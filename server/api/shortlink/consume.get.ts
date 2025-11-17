import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const token = getQuery(event).token
  if (!token) throw createError({ statusCode: 400, statusMessage: 'Missing token' })

  const link = await prisma.shortLink.findUnique({ where: { token: token.toString() } })
  if (!link) throw createError({ statusCode: 404, statusMessage: 'Invalid token' })

  if (link.expiresAt < new Date())
    throw createError({ statusCode: 410, statusMessage: 'Token expired' })

  await prisma.shortLink.update({
    where: { id: link.id },
    data: { consumed: true }
  })

  await setUserSession(event, {
    user: {
      telegramUserId: link.telegramUserId
    }
  }, {
    maxAge: (link.expiresAt.getTime() - link.createdAt.getTime()) / 1000
  })

  return { ok: true }
})
