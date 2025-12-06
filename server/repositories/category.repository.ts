import { db } from '~~/server/utils/db'
import { categories } from '~~/server/db/schema'

export const categoryRepository = {
  async findAll() {
    return db.select().from(categories)
  },
}
