import z from 'zod'
import { transactionService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const tier = event.context.auth.tier
  const query = await getValidatedQuery(event, z.object({
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['expense', 'income']).optional(),
    categories: z.string().nullable().optional(),
  }).parse)

  return transactionService.getSummaryReport(userId, tier, query)
})
