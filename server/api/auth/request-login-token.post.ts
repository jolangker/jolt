export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Link dashboard harus diminta lewat Telegram.' })
})
