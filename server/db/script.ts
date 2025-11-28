import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'
import { rand, randNumber, randBetweenDate, randCatchPhrase } from '@ngneat/falso'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

const generateTrx = (): typeof schema.transactions.$inferInsert => {
  const type = rand([
    'expense' as const,
    'expense' as const,
    'income' as const,
    'income' as const,
    'income' as const,
  ])
  const categoryId = type === 'expense' ? randNumber({ min: 1, max: 13 }) : randNumber({ min: 14, max: 18 })

  return {
    type,
    categoryId,
    note: `${randCatchPhrase()}`,
    amount: randNumber({ min: 20000, max: 300000 }).toString(),
    date: randBetweenDate({ from: new Date('2025-11-01'), to: new Date('2025-11-25') }),
    userId: '11e778d5-7d39-4a6d-a92f-25330b14cdf1',
  }
}

const generateTrxs = (count: number) => {
  return Array.from({ length: count }, () => generateTrx())
}

async function main() {
  const trxs = generateTrxs(100)
  await db.delete(schema.transactions)
  await db.insert(schema.transactions).values(trxs)
}

main()
  .then(() => console.log('done'))
  .catch((e) => console.error(e))
