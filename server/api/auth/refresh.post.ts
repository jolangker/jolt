import { userRepository } from '~~/server/repositories'

/**
 * Refresh user session with latest data from database
 * This is called after payment success to update the user's tier
 */
export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event)
  const userId = session.user.id

  // Get fresh user data from database
  const user = await userRepository.findById(userId)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Update session with fresh user data
  await setUserSession(event, {
    user,
  })

  return {
    success: true,
    user,
  }
})
