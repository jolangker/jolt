import { tool, type Tool } from 'ai'
import { z } from 'zod'
import { transactionService } from '~~/server/services'
import { transactionRepository } from '~~/server/repositories'
import dayjs from 'dayjs'

export function createDeleteTransactionTool(userId: string): Tool {
  return tool({
    description: 'Delete a transaction. Use this when the user wants to remove a previously recorded transaction. You can identify it by ID, description, or relative time.',
    inputSchema: z.object({
      id: z.number().int().positive().optional().describe('The transaction ID if known'),
      search: z.string().optional().describe('A description keyword to find the transaction, e.g. "bakso", "lunch"'),
      matchDate: z.iso.date().optional().describe('A concrete YYYY-MM-DD date used to find the transaction. Resolve relative date words using the current date context before calling this tool.'),
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
  args: { id?: number, search?: string, matchDate?: string },
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
    if (args.matchDate) {
      filters.startDate = args.matchDate
      filters.endDate = args.matchDate
    }

    const matches = await deps.findMany(userId, filters)
    if (matches.length === 0) {
      return { error: 'Tidak ada transaksi yang cocok' }
    }
    if (matches.length > 1) {
      return {
        error: 'Ada beberapa transaksi yang cocok. Sebutkan yang mana yang mau dihapus.',
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
    return { error: 'Transaksi tidak ditemukan' }
  }

  await deps.deleteTransaction(userId, transactionId)
  return {
    deleted: true,
    id: transactionId,
    note: existing.note,
    amount: existing.amount,
  }
}
