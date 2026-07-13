import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { transactionService } from '~~/server/services'
import { transactionRepository } from '~~/server/repositories'
import dayjs from 'dayjs'
import { resolveDateReference } from './resolve-date-reference'

export function createDeleteTransactionTool(userId: string): Tool {
  return tool({
    description: 'Delete a transaction. Use this when the user wants to remove a previously recorded transaction. You can identify it by ID, description, or relative time.',
    inputSchema: z.object({
      id: z.number().int().positive().optional().describe('The transaction ID if known'),
      search: z.string().optional().describe('A description keyword to find the transaction, e.g. "bakso", "lunch"'),
      dateReference: z.string().optional().describe('A relative date reference like "yesterday", "today"'),
    }),
    execute: async (args) => {
      return executeDeleteTransaction(userId, args, {
        deleteTransaction: transactionService.delete,
        findMany: transactionRepository.findMany,
        findById: transactionRepository.findById,
      })
    },
  })
}

export async function executeDeleteTransaction(
  userId: string,
  args: { id?: number, search?: string, dateReference?: string },
  deps: {
    deleteTransaction: typeof transactionService.delete
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
    if (matches.length > 1) {
      return {
        error: 'Multiple transactions match. Please specify which one to delete.',
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

  await deps.deleteTransaction(userId, transactionId)
  return {
    deleted: true,
    id: transactionId,
    note: existing.note,
    amount: existing.amount,
  }
}
