import { z } from 'zod'
import { categoryService } from '~~/server/services'

const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200),
  type: z.enum(['income', 'expense']),
  icon: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const tier = event.context.auth.tier
  const body = await readValidatedBody(event, createCategorySchema.parse)

  return categoryService.create(userId, tier, body)
})
