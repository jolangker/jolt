import { categoryService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const id = getRouterParam(event, 'id')

  return categoryService.delete(userId, parseInt(id!))
})
