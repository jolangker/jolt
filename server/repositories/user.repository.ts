import { db } from '~~/server/utils/db'
import { users } from '~~/server/db/schema'
import { eq } from 'drizzle-orm'

export const userRepository = {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    })
  },

  async findByTelegramId(telegramUserId: string) {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.telegramUserId, telegramUserId))

    return user
  },
}
