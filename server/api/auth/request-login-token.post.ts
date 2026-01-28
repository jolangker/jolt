import z from 'zod'
import { authService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, z.object({
    telegramId: z.string(),
  }).parse)

  return authService.requestLoginToken(body.telegramId)
})
