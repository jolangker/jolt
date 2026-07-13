import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { transactionService } from '~~/server/services'

export function createGetSummaryTool(userId: string): Tool {
  return tool({
    description: 'Get a spending/income summary report. Use this when the user asks "how much did I spend", "what did I spend on food", or wants a financial overview for a period.',
    inputSchema: z.object({
      type: z.enum(['expense', 'income']).optional().describe('Filter by transaction type'),
      startDate: z.string().optional().describe('Start date in YYYY-MM-DD format'),
      endDate: z.string().optional().describe('End date in YYYY-MM-DD format'),
    }),
    execute: async (args) => {
      return executeGetSummary(userId, args, transactionService.getSummaryReport)
    },
  })
}

export async function executeGetSummary(
  userId: string,
  args: { type?: 'expense' | 'income', startDate?: string, endDate?: string },
  getSummaryReportFn: typeof transactionService.getSummaryReport,
) {
  const result = await getSummaryReportFn(userId, {
    type: args.type ?? null,
    startDate: args.startDate ?? null,
    endDate: args.endDate ?? null,
    categories: null,
    search: null,
  })

  return {
    period: result.summary.period,
    count: result.summary.count,
    totalAmount: result.summary.amount,
    byCategory: result.summary.byCategory,
    byMonth: result.summary.byMonth,
  }
}
