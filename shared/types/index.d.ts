import type * as schema from '~~/server/db/schema'

export type Category = typeof schema.categories.$inferSelect
export type Transaction = typeof schema.transactions.$inferSelect & {
  category: Category
}
