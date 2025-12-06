import z from 'zod'
import { analyticsService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['income', 'expense']),
  }).parse)

  return analyticsService.getCategoryBreakdown(userId, query)
})
