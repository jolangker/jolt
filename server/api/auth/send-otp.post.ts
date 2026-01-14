import z from 'zod'
import { authService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    phoneNumber: z.string({ error: 'Phone number is required' })
      .min(10, 'Phone number must be at least 10 characters')
      .regex(/^\+?[0-9]+$/, 'Invalid phone number format'),
  }).parse)

  return authService.sendOtp(body.phoneNumber)
})
