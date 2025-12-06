import { categoryService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  return categoryService.getAll(userId)
})
