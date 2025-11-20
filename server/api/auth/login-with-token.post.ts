import { db } from '~~/server/utils/db'
import z from 'zod'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    token: z.string({ error: 'Missing token' }),
  }).parse)

  const userToken = await db.query.userTokens.findFirst({
    where: ({ token }, { eq }) => eq(token, body.token),
    with: {
      user: true,
    },
  })
  if (!userToken) throw createError({ statusCode: 404, statusMessage: 'Invalid token' })

  if (userToken.expiresAt < new Date())
    throw createError({ statusCode: 410, statusMessage: 'Token expired' })

  await setUserSession(event, {
    user: userToken.user,
  }, {
    maxAge: 60 * 60,
  })

  return { success: true }
})
