import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const otpCodes = pgTable('otp_codes', {
  id: uuid('id').primaryKey().notNull().defaultRandom(),
  phoneNumber: text('phoneNumber').notNull(),
  code: text('code').notNull(),
  expiresAt: timestamp('expiresAt').notNull(),
  verified: boolean('verified').notNull().default(false),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
})
