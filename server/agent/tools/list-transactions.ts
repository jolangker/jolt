import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { transactionService } from '~~/server/services'
import dayjs from 'dayjs'

export function createListTransactionsTool(userId: string): Tool {
  return tool({
    description: 'List recent transactions. Use this when the user asks to see their spending history, recent transactions, or wants to check what they bought.',
    inputSchema: z.object({
      limit: z.number().int().positive().max(20).default(5).describe('Number of transactions to return (max 20)'),
      type: z.enum(['expense', 'income']).optional().describe('Filter by transaction type'),
      startDate: z.iso.date().optional().describe('Concrete start date filter in YYYY-MM-DD format'),
      endDate: z.iso.date().optional().describe('Concrete end date filter in YYYY-MM-DD format'),
      search: z.string().optional().describe('Search by description keyword'),
    }),
    execute: async (args) => {
      return executeListTransactions(userId, args, transactionService.list)
    },
  })
}

export async function executeListTransactions(
  userId: string,
  args: { limit: number, type?: 'expense' | 'income', startDate?: string, endDate?: string, search?: string },
  listFn: typeof transactionService.list,
) {
  const result = await listFn(userId, {
    limit: args.limit.toString(),
    type: args.type ?? null,
    startDate: args.startDate ?? null,
    endDate: args.endDate ?? null,
    search: args.search ?? null,
    categories: null,
  })

  return {
    count: result.data.length,
    total: result.meta.total,
    transactions: result.data.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      note: t.note,
      date: dayjs(t.date).format('YYYY-MM-DD'),
      category: t.category?.name,
    })),
  }
}
