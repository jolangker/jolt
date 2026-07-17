import { dashboardAccessLinkRepository } from '~~/server/repositories'
import { digestAccessCode, generateAccessCode } from '~~/server/utils/token'

const EXPIRES_IN_MS = 5 * 60 * 1000
const RATE_WINDOW_MS = 10 * 60 * 1000
const MAX_ISSUANCES = 3

export const dashboardAccessLinkService = {
  async issue(userId: string) {
    const now = new Date()
    if (await dashboardAccessLinkRepository.countRecent(userId, new Date(now.getTime() - RATE_WINDOW_MS)) >= MAX_ISSUANCES) {
      throw createError({ statusCode: 429, statusMessage: 'Too many dashboard access requests. Please try again later.' })
    }

    const code = generateAccessCode()
    const expiresAt = new Date(now.getTime() + EXPIRES_IN_MS)
    await dashboardAccessLinkRepository.supersedeUnused(userId, now)
    await dashboardAccessLinkRepository.create(userId, digestAccessCode(code), expiresAt)
    return { url: `${process.env.APP_BASE_URL}/login?t=${code}`, expiresAt }
  },

  async inspect(code: string) {
    return dashboardAccessLinkRepository.inspect(digestAccessCode(code), new Date())
  },

  async consume(code: string) {
    return dashboardAccessLinkRepository.consume(digestAccessCode(code), new Date())
  },
}
