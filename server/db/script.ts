import { rand, randBetweenDate, randNumber } from '@ngneat/falso'
import { and, eq, or } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

const USER_ID = '4c1e0f90-e4f6-4300-b4ce-bfa314885006'
const TRANSACTION_COUNT = 100

type Category = Pick<typeof schema.categories.$inferSelect, 'id' | 'name' | 'type'>
type TransactionType = Category['type']

const notesByType = {
  expense: [
    'Belanja kebutuhan harian',
    'Makan dan minum',
    'Pembayaran tagihan',
    'Transportasi',
    'Keperluan pribadi',
  ],
  income: [
    'Pendapatan bulanan',
    'Pendapatan tambahan',
    'Pembayaran proyek',
    'Bonus',
    'Pemasukan lainnya',
  ],
} as const

export function generateTransaction(
  categories: Category[],
  requestedType: TransactionType = rand([
    'expense' as const,
    'expense' as const,
    'expense' as const,
    'expense' as const,
    'income' as const,
  ]),
): typeof schema.transactions.$inferInsert {
  if (categories.length === 0) {
    throw new Error(`No categories are available for user ${USER_ID}`)
  }

  const type = categories.some(category => category.type === requestedType)
    ? requestedType
    : rand(categories).type
  const matchingCategories = categories.filter(category => category.type === type)

  const category = rand(matchingCategories)
  const amount = type === 'expense'
    ? randNumber({ min: 10_000, max: 750_000 })
    : randNumber({ min: 1_000_000, max: 15_000_000 })
  const from = new Date()
  from.setMonth(from.getMonth() - 6)

  return {
    userId: USER_ID,
    categoryId: category.id,
    type,
    note: `${rand(notesByType[type])} - ${category.name}`,
    amount: amount.toString(),
    date: randBetweenDate({ from, to: new Date() }),
  }
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, USER_ID),
    columns: { id: true },
  })

  if (!user) {
    throw new Error(`User ${USER_ID} does not exist`)
  }

  const categories = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      type: schema.categories.type,
    })
    .from(schema.categories)
    .where(and(
      or(
        eq(schema.categories.isDefault, true),
        eq(schema.categories.userId, USER_ID),
      ),
    ))

  const transactions = Array.from(
    { length: TRANSACTION_COUNT },
    () => generateTransaction(categories),
  )

  await db.insert(schema.transactions).values(transactions)

  console.log(`Seeded ${TRANSACTION_COUNT} transactions for user ${USER_ID}`)
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Failed to seed transactions:', error)
    process.exitCode = 1
  })
}
