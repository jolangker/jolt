import z from 'zod'
import { authService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    token: z.string({ error: 'Missing token' }),
  }).parse)

  const user = await authService.loginWithToken(body.token)

  await setUserSession(event, {
    user,
  }, {
    maxAge: 60 * 60,
  })

  return { success: true }
})
