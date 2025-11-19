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
