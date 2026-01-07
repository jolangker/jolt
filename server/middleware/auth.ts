import { users } from '../db/schema'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (!url.pathname.startsWith('/api')) return

  setHeader(event, 'Content-Type', 'application/json')

  if (url.pathname.startsWith('/api/auth')) return
  if (url.pathname.startsWith('/api/master')) return

  const session = await getUserSession(event)
  const secret = getHeader(event, 'x-api-key')
  const telegramUserId = getHeader(event, 'x-telegram-user-id')
  const telegramUsername = getHeader(event, 'x-telegram-username')

  let currentUserId: string | null = null
  let authSource: 'web' | 'n8n' | null = null
  let currentUserTier: 'FREE' | 'PRO' | null = null

  if (session.user) {
    currentUserId = session.user.id
    authSource = 'web'
    currentUserTier = session.user.tier
  }
  else if (secret === process.env.APP_SECRET) {
    if (!telegramUserId || !telegramUsername) throw createError({ statusCode: 400, statusMessage: 'Missing telegram credentials' })

    let user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.telegramUserId, telegramUserId),
    })

    if (!user) {
      [user] = await db.insert(users).values({
        telegramUserId,
        telegramUsername: telegramUsername,
      }).returning()
    }

    currentUserId = user.id
    currentUserTier = user.tier as 'FREE' | 'PRO'
    authSource = 'n8n'
  }
  else {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  event.context.auth = {
    userId: currentUserId,
    source: authSource,
    tier: currentUserTier,
  }
})
