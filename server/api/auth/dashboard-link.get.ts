import z from 'zod'
import { dashboardAccessLinkService } from '~~/server/services'

const recoveryError = () => createError({ statusCode: 400, statusMessage: 'This dashboard link is no longer available. Please request a new one from Telegram.' })

export default defineEventHandler(async (event) => {
  setHeader(event, 'Referrer-Policy', 'no-referrer')
  setHeader(event, 'X-Frame-Options', 'DENY')
  const { token } = await getValidatedQuery(event, z.object({ token: z.string().min(1) }).parse).catch(() => ({ token: '' }))
  const link = token ? await dashboardAccessLinkService.inspect(token) : undefined
  if (!link?.user) throw recoveryError()
  return { success: true, data: { user: { telegramUsername: link.user.telegramUsername } } }
})
