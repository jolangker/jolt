import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { transactionService } from '~~/server/services'
import { transactionRepository } from '~~/server/repositories'
import type { TransactionPayload } from '~~/shared/types/transaction'
import dayjs from 'dayjs'
import { resolveDateReference } from './resolve-date-reference'

export function createUpdateTransactionTool(userId: string): Tool {
  return tool({
    description: 'Update an existing transaction. Use this when the user wants to correct or change a previously recorded transaction. You can identify the transaction by its ID, or by searching for it using a description or relative time reference.',
    inputSchema: z.object({
      id: z.number().int().positive().optional().describe('The transaction ID if known'),
      search: z.string().optional().describe('A description keyword to find the transaction, e.g. "bakso", "lunch"'),
      dateReference: z.string().optional().describe('A relative date reference like "yesterday", "last Friday", "the one from 2 days ago"'),
      type: z.enum(['expense', 'income']).optional().describe('Updated type if changing'),
      amount: z.number().positive().optional().describe('Updated amount in IDR'),
      categoryId: z.number().int().positive().optional().describe('Updated category ID'),
      note: z.string().min(1).optional().describe('Updated description'),
      date: z.string().optional().describe('Updated date in YYYY-MM-DD format'),
    }),
    execute: async (args) => {
      return executeUpdateTransaction(userId, args, {
        update: transactionService.update,
        findMany: transactionRepository.findMany,
        findById: transactionRepository.findById,
      })
    },
  })
}

export async function executeUpdateTransaction(
  userId: string,
  args: {
    id?: number
    search?: string
    dateReference?: string
    type?: 'expense' | 'income'
    amount?: number
    categoryId?: number
    note?: string
    date?: string
  },
  deps: {
    update: typeof transactionService.update
    findMany: typeof transactionRepository.findMany
    findById: typeof transactionRepository.findById
  },
) {
  let transactionId = args.id

  if (!transactionId) {
    const filters: { search?: string, startDate?: string, endDate?: string } = {}
    if (args.search) filters.search = args.search
    if (args.dateReference) {
      Object.assign(filters, resolveDateReference(args.dateReference))
    }

    const matches = await deps.findMany(userId, filters)
    if (matches.length === 0) {
      return { error: 'No matching transaction found' }
    }
    if (matches.length > 1 && !args.id) {
      return {
        error: 'Multiple transactions match. Please specify which one.',
        matches: matches.slice(0, 5).map(t => ({
          id: t.id,
          note: t.note,
          amount: t.amount,
          date: dayjs(t.date).format('YYYY-MM-DD'),
          category: t.category?.name,
        })),
      }
    }
    transactionId = matches[0]!.id
  }

  const existing = await deps.findById(userId, transactionId)
  if (!existing) {
    return { error: 'Transaction not found' }
  }

  const payload: TransactionPayload = {
    type: args.type ?? existing.type,
    amount: args.amount?.toString() ?? existing.amount,
    categoryId: args.categoryId ?? existing.categoryId,
    note: args.note ?? existing.note,
    date: args.date ?? dayjs(existing.date).format('YYYY-MM-DD'),
  }

  const result = await deps.update(userId, transactionId, payload)
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
