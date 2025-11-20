export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (url.pathname.startsWith('/api/auth')) return

  const session = await getUserSession(event)
  const secret = getHeader(event, 'x-api-key')
  const telegramUserId = getHeader(event, 'x-telegram-user-id')

  if (session.user) {
    event.context.auth = {
      userId: session.user.id,
      source: 'web',
    }
  }
  else if (secret === process.env.APP_SECRET) {
    if (!telegramUserId) throw createError({ statusCode: 400, statusMessage: 'Missing x-telegram-user-id' })

    const user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.telegramUserId, telegramUserId),
    })

    if (!user) throw createError({ statusCode: 404, statusMessage: 'User not found' })
    event.context.auth = {
      userId: user.id,
      source: 'n8n',
    }
  }
  else {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }
})
