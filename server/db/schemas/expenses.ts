import { pgTable, serial, text, timestamp, decimal, uuid } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'
import { users } from './users'

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  note: text('note').notNull(),
  category: text('category').notNull(),
  amount: decimal('amount').notNull(),
  transactionDate: timestamp('transactionDate').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const expenseInsertSchema = createInsertSchema(expenses, {
  userId: z.string().optional(),
  transactionDate: z.string(),
})
