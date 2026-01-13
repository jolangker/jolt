import { db } from '~~/server/utils/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export const userRepository = {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    })
  },

  async findByPhoneNumber(phoneNumber: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber))

    return user
  },

  async upgradeToPro(userId: string, subscriptionEndsAt: Date) {
    await db
      .update(users)
      .set({
        tier: 'PRO',
        subscriptionEndsAt,
        voiceQuota: 999999, // Unlimited for PRO
      })
      .where(eq(users.id, userId))
  },
}
