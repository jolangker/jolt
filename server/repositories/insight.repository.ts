import type { InsightPayload } from '~~/shared/types'
import { insights } from '../db/schemas/insights'
import { eq } from 'drizzle-orm'

export const insightRepository = {
  async findByUserId(userId: string) {
    const result = await db.query.insights.findFirst({
      where: eq(insights.userId, userId),
    })
    return result
  },

  async create(userId: string, data: InsightPayload) {
    const [result] = await db.insert(insights).values({
      userId,
      ...data,
    }).returning()

    return result
  },
}
