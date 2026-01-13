import { relations } from 'drizzle-orm'
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'

export const paymentOrders = pgTable('payment_orders', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  orderId: text('orderId').notNull().unique(), // Midtrans order ID
  amount: integer('amount').notNull(),
  status: text('status').notNull().default('pending'), // pending | settlement | capture | cancel | deny | expire | refund
  paymentType: text('paymentType'), // credit_card, gopay, bank_transfer, etc.
  transactionId: text('transactionId'), // Midtrans transaction ID
  transactionTime: timestamp('transactionTime'),
  expiresAt: timestamp('expiresAt'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
})

export const paymentOrderRelations = relations(paymentOrders, ({ one }) => ({
  user: one(users, {
    fields: [paymentOrders.userId],
    references: [users.id],
  }),
}))
