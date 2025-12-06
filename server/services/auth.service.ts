import { userRepository, authTokenRepository } from '~~/server/repositories'
import { generateShortToken } from '~~/server/utils/token'

export const authService = {
  async requestLoginToken(telegramUserId: string) {
    const user = await userRepository.findByTelegramId(telegramUserId)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    const token = generateShortToken()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await authTokenRepository.create(user.id, token, expiresAt)

    return {
      success: true,
      data: {
        url: `${process.env.APP_BASE_URL}/login?t=${token}`,
        expiresAt,
      },
    }
  },

  async loginWithToken(token: string) {
    const userToken = await authTokenRepository.findByToken(token)

    if (!userToken) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Invalid token',
      })
    }

    if (userToken.expiresAt < new Date()) {
      throw createError({
        statusCode: 410,
        statusMessage: 'Token expired',
      })
    }

    return userToken.user
  },
}
