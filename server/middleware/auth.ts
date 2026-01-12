import { eq } from 'drizzle-orm'
import { users } from '../db/schema'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (!url.pathname.startsWith('/api')) return

  setHeader(event, 'Content-Type', 'application/json')

  if (url.pathname.startsWith('/api/auth')) return
  if (url.pathname.startsWith('/api/master')) return

  const session = await getUserSession(event)
  const secret = getHeader(event, 'x-api-key')
  const phoneNumber = getHeader(event, 'x-phone-number')

  let currentUserId: string | null = null
  let currentUserTier: 'FREE' | 'PRO' | null = null
  let subscriptionEndsAt: Date | null = null
  let isNewUser = false
  let authSource: 'web' | 'n8n' | null = null

  if (session.user) {
    currentUserId = session.user.id
    authSource = 'web'
    currentUserTier = session.user.tier
    subscriptionEndsAt = session.user.subscriptionEndsAt ? new Date(session.user.subscriptionEndsAt) : null
  }
  else if (secret === process.env.APP_SECRET) {
    if (!phoneNumber) throw createError({ statusCode: 400, statusMessage: 'Missing phone number' })

    let user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.phoneNumber, phoneNumber),
    })

    if (!user) {
      [user] = await db.insert(users).values({
        phoneNumber,
      }).returning()
      isNewUser = true
    }

    currentUserId = user.id
    currentUserTier = user.tier as 'FREE' | 'PRO'
    subscriptionEndsAt = user.subscriptionEndsAt
    authSource = 'n8n'
  }
  else {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  if (currentUserTier === 'PRO' && subscriptionEndsAt) {
    const now = new Date()
    if (subscriptionEndsAt < now) {
      await db.update(users)
        .set({ tier: 'FREE' })
        .where(eq(users.id, currentUserId!))

      currentUserTier = 'FREE'

      if (authSource === 'web' && session.user) {
        await setUserSession(event, {
          user: {
            ...session.user,
            tier: 'FREE',
          },
        })
      }
    }
  }

  event.context.auth = {
    userId: currentUserId,
    source: authSource,
    tier: currentUserTier,
    isNewUser,
  }
})
