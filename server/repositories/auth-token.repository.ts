import { db } from '~~/server/utils/db'
import { userTokens } from '~~/server/db/schema'

export const authTokenRepository = {
  async create(userId: string, token: string, expiresAt: Date) {
    await db.insert(userTokens).values({ userId, token, expiresAt })
  },

  async findByToken(token: string) {
    return db.query.userTokens.findFirst({
      where: (t, { eq }) => eq(t.token, token),
      with: { user: true },
    })
  },
}
