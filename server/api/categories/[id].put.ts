import { z } from 'zod'
import { categoryService } from '~~/server/services'

const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  type: z.enum(['income', 'expense']).optional(),
  icon: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateCategorySchema.parse)

  return categoryService.update(userId, parseInt(id!), body)
})
