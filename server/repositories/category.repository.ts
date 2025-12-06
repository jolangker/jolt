import { db } from '~~/server/utils/db'
import { categories } from '~~/server/db/schema'
import { eq, and, or } from 'drizzle-orm'

export const categoryRepository = {
  async findAll(userId?: string) {
    if (!userId) {
      return db.select().from(categories).where(eq(categories.isDefault, true))
    }
    return db.select().from(categories).where(
      or(
        eq(categories.isDefault, true),
        eq(categories.userId, userId),
      ),
    )
  },

  async create(data: typeof categories.$inferInsert) {
    return db.insert(categories).values(data).returning()
  },

  async update(id: number, userId: string, data: Partial<typeof categories.$inferInsert>) {
    return db.update(categories)
      .set(data)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning()
  },

  async delete(id: number, userId: string) {
    return db.delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning()
  },

  async findById(id: number) {
    const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1)
    return result[0]
  },
}
