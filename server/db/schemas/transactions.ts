import { relations } from 'drizzle-orm'
import { pgEnum, pgTable, serial, text, timestamp, decimal, uuid, boolean } from 'drizzle-orm/pg-core'
import { users } from './users'
import z from 'zod'
import { createInsertSchema } from 'drizzle-zod'

export const categoryTypeEnum = pgEnum('category_type', ['expense', 'income'])

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  isDefault: boolean('is_default').default(false),
  name: text('name').notNull(),
  description: text('description').notNull(),
  type: categoryTypeEnum('type').notNull(),
  icon: text('icon'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
})

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  categoryId: serial('categoryId').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  type: categoryTypeEnum('type').notNull(),
  note: text('note').notNull(),
  amount: decimal('amount').notNull(),
  date: timestamp('date').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  deletedAt: timestamp('deletedAt'),
})

export const transactionRelations = relations(transactions, ({ one }) => ({
  category: one(categories, {
    fields: [transactions.categoryId],
    references: [categories.id],
  }),
}))

export const transactionInsertSchema = createInsertSchema(transactions, {
  userId: z.string().optional(),
  date: z.string(),
})
