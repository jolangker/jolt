import * as schema from '~~/server/db/schema'

export type Category = typeof schema.categories.$inferSelect
export type Transaction = SerializeObject<typeof schema.transactions.$inferSelect & {
  category: Category
}>