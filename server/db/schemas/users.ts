import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  telegramUserId: text('telegramUserId').notNull().unique(),
  telegramUsername: text('telegramUsername').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const userTokens = pgTable('user_tokens', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})

export const dashboardAccessLinks = pgTable('dashboard_access_links', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  userId: uuid('userId').notNull().references(() => users.id, { onDelete: 'cascade' }),
  codeDigest: text('codeDigest').notNull().unique(),
  expiresAt: timestamp('expiresAt').notNull(),
  consumedAt: timestamp('consumedAt'),
  supersededAt: timestamp('supersededAt'),
  outcome: text('outcome').notNull().default('issued'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
}, table => [
  index('dashboard_access_links_user_created_idx').on(table.userId, table.createdAt),
])

export const userTokenRelations = relations(userTokens, ({ one }) => ({
  user: one(users, {
    fields: [userTokens.userId],
    references: [users.id],
  }),
}))

export const dashboardAccessLinkRelations = relations(dashboardAccessLinks, ({ one }) => ({
  user: one(users, {
    fields: [dashboardAccessLinks.userId],
    references: [users.id],
  }),
}))
