import { eq } from 'drizzle-orm'
import { users } from '../db/schema'
import { verifyHmacSignature } from '../utils/hmac'

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (!url.pathname.startsWith('/api')) return

  setHeader(event, 'Content-Type', 'application/json')

  if (url.pathname.startsWith('/api/auth')) return
  if (url.pathname.startsWith('/api/master')) return
  if (url.pathname.startsWith('/api/webhooks')) return

  const session = await getUserSession(event)
  const telegramId = getHeader(event, 'x-telegram-id')
  const timestamp = getHeader(event, 'x-timestamp')
  const signature = getHeader(event, 'x-signature')

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
  else if (signature && timestamp && telegramId) {
    // Verify HMAC signature from n8n
    const result = verifyHmacSignature(
      telegramId,
      timestamp,
      signature,
      process.env.APP_SECRET!,
    )

    if (!result.valid) {
      throw createError({ statusCode: 401, statusMessage: result.error || 'Invalid signature' })
    }

    let user = await db.query.users.findFirst({
      where: (user, { eq }) => eq(user.telegramId, telegramId),
    })

    if (!user) {
      [user] = await db.insert(users).values({
        telegramId,
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
