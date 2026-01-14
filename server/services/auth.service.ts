import { userRepository, authTokenRepository, otpRepository } from '~~/server/repositories'
import { generateShortToken, generateOtpCode } from '~~/server/utils/token'

const MAX_OTP_ATTEMPTS = 3
const OTP_EXPIRY_MINUTES = 5

export const authService = {
  async requestLoginToken(phoneNumber: string) {
    const user = await userRepository.findByPhoneNumber(phoneNumber)

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

  async sendOtp(phoneNumber: string) {
    // Check phone-based rate limit (max 3 per 10 minutes)
    const recentCount = await otpRepository.countRecentByPhoneNumber(phoneNumber, 10)
    if (recentCount >= 3) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many OTP requests for this number. Please wait before trying again.',
      })
    }

    // Invalidate any existing OTPs for this phone number
    await otpRepository.invalidateAllForPhoneNumber(phoneNumber)

    // Generate new OTP
    const code = generateOtpCode()
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    // Store OTP
    await otpRepository.create(phoneNumber, code, expiresAt)

    // TODO: Call n8n webhook to send WhatsApp message
    // For now, return the OTP for testing via Postman
    return {
      success: true,
      data: {
        phoneNumber,
        expiresAt,
        expiresIn: OTP_EXPIRY_MINUTES,
        // Remove this in production - only for testing
        _debug: { otp: code },
      },
    }
  },

  async verifyOtp(phoneNumber: string, code: string) {
    const otp = await otpRepository.findLatestByPhoneNumber(phoneNumber)

    if (!otp) {
      throw createError({
        statusCode: 404,
        statusMessage: 'No OTP found. Please request a new one.',
      })
    }

    if (otp.expiresAt < new Date()) {
      throw createError({
        statusCode: 410,
        statusMessage: 'OTP expired. Please request a new one.',
      })
    }

    if (otp.attempts >= MAX_OTP_ATTEMPTS) {
      throw createError({
        statusCode: 429,
        statusMessage: 'Too many attempts. Please request a new OTP.',
      })
    }

    if (otp.code !== code) {
      await otpRepository.incrementAttempts(otp.id)
      const remainingAttempts = MAX_OTP_ATTEMPTS - otp.attempts - 1
      throw createError({
        statusCode: 401,
        statusMessage: `Invalid OTP. ${remainingAttempts} attempt(s) remaining.`,
      })
    }

    // Mark OTP as verified
    await otpRepository.markAsVerified(otp.id)

    // Get or create user
    let user = await userRepository.findByPhoneNumber(phoneNumber)
    if (!user) {
      user = await userRepository.create(phoneNumber)
    }

    return user
  },
}
