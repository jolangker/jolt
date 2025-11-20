import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core'
import { createInsertSchema } from 'drizzle-zod'

export const links = pgTable('links', {
  id: serial('id').primaryKey(),
  token: text('token').unique().notNull(),
  telegramUserId: text('telegramUserId').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const linkInsertSchema = createInsertSchema(links)
