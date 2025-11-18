import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from '../schema'

const data = [
  {
    'DATE': '2025-11-11',
    'CATEGORY': 'food',
    'NOTE': 'beli bubur buat sarapan',
    'AMOUNT': 9000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-11',
    'CATEGORY': 'food',
    'NOTE': 'Alfamart groceries including Sedaap Mi Instan Cup, Kanzler Singles Sosis, GMP Gula Pasir, Alfamart Kamper Lemari, Bio Creamy Snack, Makanan Kucing Basah, Foi Teg Minuman Teh Lemon - after discount',
    'AMOUNT': 88300,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-12',
    'CATEGORY': 'food',
    'NOTE': 'nasi goreng dan es teh tarik',
    'AMOUNT': 32500,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-12',
    'CATEGORY': 'beverage',
    'NOTE': 'kopi kenangan',
    'AMOUNT': 15000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-12',
    'CATEGORY': 'other',
    'NOTE': 'bayar parkir',
    'AMOUNT': 2000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-12',
    'CATEGORY': 'other',
    'NOTE': 'beli rokok',
    'AMOUNT': 35000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-13',
    'CATEGORY': 'food',
    'NOTE': 'beli dimsum',
    'AMOUNT': 33500,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-14',
    'CATEGORY': 'food',
    'NOTE': 'sarapan bubur',
    'AMOUNT': 9000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-14',
    'CATEGORY': 'food',
    'NOTE': 'Grocery items from Alfamart including instant noodles, biscuits, milk, sausage, chocolate snacks, and jelly candies. Delivery completed to Muhammad Raihan Thasriq.',
    'AMOUNT': 111900,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-15',
    'CATEGORY': 'beverage',
    'NOTE': 'Beli es teh solo, 3 biji',
    'AMOUNT': 10000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-15',
    'CATEGORY': 'shopping',
    'NOTE': 'beli rokok',
    'AMOUNT': 35000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-15',
    'CATEGORY': 'beverage',
    'NOTE': 'beli susu',
    'AMOUNT': 7000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-15',
    'CATEGORY': 'food',
    'NOTE': 'beli nasi goreng',
    'AMOUNT': 17000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-16',
    'CATEGORY': 'food',
    'NOTE': 'makan baso',
    'AMOUNT': 77000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-16',
    'CATEGORY': 'transport',
    'NOTE': 'bayar parkir',
    'AMOUNT': 5000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-16',
    'CATEGORY': 'entertainment',
    'NOTE': 'Patungan pergi ke vila',
    'AMOUNT': 300000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-17',
    'CATEGORY': 'food',
    'NOTE': 'Indomie rendang 2 packs and Boing cabe level 30',
    'AMOUNT': 30000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-17',
    'CATEGORY': 'food',
    'NOTE': 'Indomie Rendang 2 packs and Bun Cabe level 30',
    'AMOUNT': 8000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
  {
    'DATE': '2025-11-17',
    'CATEGORY': 'food',
    'NOTE': 'beli bubur',
    'AMOUNT': 9000,
    'CURRENCY': 'IDR',
    'TELEGRAM ID': 5260064737,
  },
]

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
  for await (const expense of data) {
    console.log(`processing: ${expense.NOTE}`)
    await db.insert(schema.expenses).values({
      telegramUserId: expense['TELEGRAM ID'].toString(),
      note: expense.NOTE,
      category: expense.CATEGORY,
      amount: expense.AMOUNT,
      transactionDate: new Date(expense.DATE),
    })
  }

  console.log('done')
}

main()