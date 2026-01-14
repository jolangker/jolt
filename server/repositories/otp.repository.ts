import { and, eq, gte, sql } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { otpCodes } from '~~/server/db/schema'

export const otpRepository = {
  async create(phoneNumber: string, code: string, expiresAt: Date) {
    const [otp] = await db.insert(otpCodes).values({
      phoneNumber,
      code,
      expiresAt,
    }).returning()
    return otp
  },

  async findLatestByPhoneNumber(phoneNumber: string) {
    return db.query.otpCodes.findFirst({
      where: (otp, { eq, and, gt }) => and(
        eq(otp.phoneNumber, phoneNumber),
        eq(otp.verified, false),
        gt(otp.expiresAt, new Date()),
      ),
      orderBy: (otp, { desc }) => desc(otp.createdAt),
    })
  },

  async markAsVerified(id: string) {
    await db.update(otpCodes)
      .set({ verified: true })
      .where(eq(otpCodes.id, id))
  },

  async incrementAttempts(id: string) {
    const otp = await db.query.otpCodes.findFirst({
      where: (o, { eq }) => eq(o.id, id),
    })
    if (otp) {
      await db.update(otpCodes)
        .set({ attempts: otp.attempts + 1 })
        .where(eq(otpCodes.id, id))
    }
  },

  async invalidateAllForPhoneNumber(phoneNumber: string) {
    await db.update(otpCodes)
      .set({ verified: true })
      .where(and(
        eq(otpCodes.phoneNumber, phoneNumber),
        eq(otpCodes.verified, false),
      ))
  },

  async countRecentByPhoneNumber(phoneNumber: string, withinMinutes: number) {
    const since = new Date(Date.now() - withinMinutes * 60 * 1000)
    const result = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(otpCodes)
      .where(and(
        eq(otpCodes.phoneNumber, phoneNumber),
        gte(otpCodes.createdAt, since),
      ))
    return result[0]?.count ?? 0
  },
}
