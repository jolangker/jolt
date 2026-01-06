import { pgTable, serial, text, timestamp, jsonb, uuid } from 'drizzle-orm/pg-core'
import { users } from './users'
import { createInsertSchema } from 'drizzle-zod'
import { z } from 'zod'

export const insights = pgTable('insights', {
  id: serial('id').primaryKey(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  monthYear: text('monthYear').notNull(), // Format: "01-2026"
  content: jsonb('content').notNull(), // Simpan 3-5 poin insight di sini
  lastGenerated: timestamp('lastGenerated').defaultNow().notNull(),
})

export const insightsInsertSchema = createInsertSchema(insights, {
  userId: z.string().optional(),
})
