import { relations } from 'drizzle-orm'
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  phoneNumber: text('phoneNumber'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  tier: text('tier').notNull().default('FREE'), // FREE | PRO
  subscriptionEndsAt: timestamp('subscriptionEndsAt'),
  voiceQuota: integer('voiceQuota').notNull().default(3),
  isTrialUsed: boolean('isTrialUsed').notNull().default(false),
})

export const userTokens = pgTable('user_tokens', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const userTokenRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
}))
