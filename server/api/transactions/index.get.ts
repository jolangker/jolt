import z from 'zod'
import { transactionService } from '~~/server/services'

export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    limit: z.string().optional(),
    offset: z.string().optional().default('0'),
    startDate: z.string().nullable().optional(),
    endDate: z.string().nullable().optional(),
    type: z.enum(['expense', 'income']).nullable().optional(),
    categories: z.string().nullable().optional(),
    search: z.string().nullable().optional(),
  }).parse)

  return transactionService.list(userId, query)
})
