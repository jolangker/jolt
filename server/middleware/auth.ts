export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (url.pathname === '/login') {
    setHeader(event, 'Referrer-Policy', 'no-referrer')
    setHeader(event, 'X-Frame-Options', 'DENY')
  }

  if (!url.pathname.startsWith('/api')) return

  setHeader(event, 'Content-Type', 'application/json')

  if (url.pathname.startsWith('/api/auth')) return
  if (url.pathname.startsWith('/api/master')) return
  if (url.pathname.startsWith('/api/telegram')) return

  const session = await getUserSession(event)

  if (session.user) {
    event.context.auth = {
      userId: session.user.id,
      source: 'web',
    }
  }
  else {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
