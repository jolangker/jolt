import { and, desc, eq, gt, isNull, sql } from 'drizzle-orm'
import { dashboardAccessLinks } from '~~/server/db/schema'
import { db } from '~~/server/utils/db'

export const dashboardAccessLinkRepository = {
  async countRecent(userId: string, since: Date) {
    const [result] = await db.select({ count: sql<number>`count(*)` })
      .from(dashboardAccessLinks)
      .where(and(eq(dashboardAccessLinks.userId, userId), gt(dashboardAccessLinks.createdAt, since)))
    return Number(result?.count ?? 0)
  },

  async supersedeUnused(userId: string, now: Date) {
    await db.update(dashboardAccessLinks)
      .set({ supersededAt: now, outcome: 'superseded' })
      .where(and(eq(dashboardAccessLinks.userId, userId), isNull(dashboardAccessLinks.consumedAt), isNull(dashboardAccessLinks.supersededAt)))
  },

  async create(userId: string, codeDigest: string, expiresAt: Date) {
    const [link] = await db.insert(dashboardAccessLinks).values({ userId, codeDigest, expiresAt }).returning()
    return link!
  },

  async inspect(codeDigest: string, now: Date) {
    return db.query.dashboardAccessLinks.findFirst({
      where: and(eq(dashboardAccessLinks.codeDigest, codeDigest), gt(dashboardAccessLinks.expiresAt, now), isNull(dashboardAccessLinks.consumedAt), isNull(dashboardAccessLinks.supersededAt)),
      with: { user: true },
      orderBy: [desc(dashboardAccessLinks.createdAt)],
    })
  },

  async consume(codeDigest: string, now: Date) {
    const [link] = await db.update(dashboardAccessLinks)
      .set({ consumedAt: now, outcome: 'consumed' })
      .where(and(eq(dashboardAccessLinks.codeDigest, codeDigest), gt(dashboardAccessLinks.expiresAt, now), isNull(dashboardAccessLinks.consumedAt), isNull(dashboardAccessLinks.supersededAt)))
      .returning()
    return link
  },
}
