import { pgTable, serial, text, timestamp, decimal } from 'drizzle-orm/pg-core'

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  telegramUserId: text('telegramUserId').notNull(),
  note: text('note').notNull(),
  category: text('category').notNull(),
  amount: decimal('amount').notNull(),
  transactionDate: timestamp('transactionDate').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  token: text('token').unique().notNull(),
  telegramUserId: text('telegramUserId').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})
