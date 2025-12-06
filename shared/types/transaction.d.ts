import type z from 'zod'
import type { transactionInsertSchema } from '~~/server/db/schema'

export type TransactionPayload = z.infer<typeof transactionInsertSchema>
