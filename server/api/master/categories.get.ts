import { categoryService } from '~~/server/services'

export default defineEventHandler(async () => {
  return categoryService.getAll()
})
