export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Dashboard links must be requested from Telegram.' })
})
