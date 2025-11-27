import { db } from '~~/server/utils/db'
import { categories } from '~~/server/db/schema'

export default defineEventHandler(async () => {
  const data = await db.select().from(categories)
  return {
    sucess: true,
    data,
  }
})
