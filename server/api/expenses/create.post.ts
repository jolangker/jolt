import type { Prisma } from '@prisma/client'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const secret = getHeader(event, 'x-api-key')
  if (secret !== config.N8N_SECRET) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const body = await readBody<Prisma.ExpenseCreateInput>(event)
  const { telegramUserId, amount, category, note, transactionDate } = body

  if (!telegramUserId || !amount || !category || !note || !transactionDate) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const expense = await prisma.expense.create({
    data: {
      telegramUserId,
      amount,
      category,
      note,
      transactionDate: new Date(transactionDate),
    },
  })

  return { success: true, expense }
})
