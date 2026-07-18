import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { transactionService } from '~~/server/services'
import type { TransactionPayload } from '~~/shared/types/transaction'
import dayjs from 'dayjs'

export function createAddTransactionTool(userId: string): Tool {
  return tool({
    description: 'Record a new expense or income transaction. Use this when the user wants to log a purchase, payment, salary, or any financial transaction.',
    inputSchema: z.object({
      type: z.enum(['expense', 'income']).describe('Whether this is an expense or income'),
      amount: z.number().positive().describe('The amount in Indonesian Rupiah (IDR). Convert shorthand like "25rb" to 25000, "1jt" to 1000000.'),
      categoryId: z.number().int().positive().describe('The category ID for this transaction. Use get_categories to see available categories.'),
      note: z.string().min(1).describe('A short description of the transaction, e.g. "lunch with friends", "monthly salary"'),
      date: z.iso.date().describe('The concrete date of the transaction in YYYY-MM-DD format, resolved from the current date context. Use today when the user does not specify a date.'),
    }),
    execute: async (args) => {
      return executeAddTransaction(userId, args, transactionService.create)
    },
  })
}

export async function executeAddTransaction(
  userId: string,
  args: { type: 'expense' | 'income', amount: number, categoryId: number, note: string, date: string },
  createFn: typeof transactionService.create,
) {
  const payload: TransactionPayload = {
    type: args.type,
    amount: args.amount.toString(),
    categoryId: args.categoryId,
    note: args.note,
    date: args.date,
  }
  const result = await createFn(userId, payload)
  const trx = result.data
  return {
    id: trx!.id,
    type: trx!.type,
    amount: trx!.amount,
    note: trx!.note,
    date: dayjs(trx!.date).format('YYYY-MM-DD'),
    categoryId: trx!.categoryId,
  }
}
