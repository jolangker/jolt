import z from 'zod'
import { authService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    phoneNumber: z.string({ error: 'Phone number is required' }),
    code: z.string({ error: 'OTP code is required' })
      .length(6, 'OTP must be 6 digits'),
  }).parse)

  const user = await authService.verifyOtp(body.phoneNumber, body.code)

  await setUserSession(event, {
    user,
  }, {
    maxAge: 60 * 60, // 1 hour
  })

  return { success: true }
})
