import z from 'zod'
import { dashboardAccessLinkService } from '~~/server/services'

const recoveryError = () => createError({ statusCode: 400, statusMessage: 'This dashboard link is no longer available. Please request a new one from Telegram.' })

export default defineEventHandler(async (event) => {
  setHeader(event, 'Referrer-Policy', 'no-referrer')
  setHeader(event, 'X-Frame-Options', 'DENY')
  const { token } = await readValidatedBody(event, z.object({ token: z.string().min(1) }).parse).catch(() => ({ token: '' }))
  const inspected = token ? await dashboardAccessLinkService.inspect(token) : undefined
  if (!inspected?.user) throw recoveryError()
  const session = await getUserSession(event)
  if (session.user && session.user.id !== inspected.user.id) {
    throw createError({ statusCode: 409, statusMessage: 'Sign out of the current dashboard account before using this link.' })
  }
  const consumed = await dashboardAccessLinkService.consume(token)
  if (!consumed) throw recoveryError()
  await setUserSession(event, { user: inspected.user }, { maxAge: 60 * 60 })
  return { success: true, data: { redirectTo: '/' } }
})
