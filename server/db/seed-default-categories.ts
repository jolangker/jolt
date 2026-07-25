import { and, eq, inArray } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'

export const DEFAULT_CATEGORIES = [
  {
    name: 'Makanan & Minuman',
    description: 'Makan, minum, kopi, restoran, dan camilan',
    type: 'expense' as const,
    icon: 'i-solar:cup-hot',
  },
  {
    name: 'Transportasi',
    description: 'Ojek, BBM, parkir, transport umum, dan tol',
    type: 'expense' as const,
    icon: 'i-solar:bus',
  },
  {
    name: 'Belanja',
    description: 'Sembako, kebutuhan harian, dan belanja barang',
    type: 'expense' as const,
    icon: 'i-solar:cart-large-2',
  },
  {
    name: 'Tagihan',
    description: 'Listrik, air, internet, sewa, dan tagihan rutin',
    type: 'expense' as const,
    icon: 'i-solar:bill-list',
  },
  {
    name: 'Hiburan',
    description: 'Nonton, langganan, game, dan rekreasi',
    type: 'expense' as const,
    icon: 'i-solar:gamepad',
  },
  {
    name: 'Kesehatan',
    description: 'Obat, klinik, rumah sakit, dan asuransi kesehatan',
    type: 'expense' as const,
    icon: 'i-solar:heart-pulse',
  },
  {
    name: 'Lainnya',
    description: 'Pengeluaran yang tidak masuk kategori lain',
    type: 'expense' as const,
    icon: 'i-solar:widget',
  },
  {
    name: 'Gaji',
    description: 'Gaji bulanan atau pendapatan utama',
    type: 'income' as const,
    icon: 'i-solar:wallet-money',
  },
  {
    name: 'Freelance',
    description: 'Proyek sampingan, jasa, dan side income',
    type: 'income' as const,
    icon: 'i-solar:case',
  },
  {
    name: 'Bonus',
    description: 'Bonus, THR, hadiah, dan insentif',
    type: 'income' as const,
    icon: 'i-solar:gift',
  },
  {
    name: 'Pemasukan Lainnya',
    description: 'Pemasukan yang tidak masuk kategori lain',
    type: 'income' as const,
    icon: 'i-solar:hand-money',
  },
] as const
// icon values are base Solar names (no -outline); UI appends -outline when rendering

export async function seedDefaultCategories(
  db: ReturnType<typeof drizzle<typeof schema>>,
) {
  const names = DEFAULT_CATEGORIES.map(c => c.name)

  const existing = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
    })
    .from(schema.categories)
    .where(and(
      eq(schema.categories.isDefault, true),
      inArray(schema.categories.name, [...names]),
    ))

  const existingNames = new Set(existing.map(c => c.name.toLowerCase()))
  const toInsert = DEFAULT_CATEGORIES
    .filter(c => !existingNames.has(c.name.toLowerCase()))
    .map(c => ({
      name: c.name,
      description: c.description,
      type: c.type,
      icon: c.icon,
      isDefault: true,
      userId: null,
    }))

  if (toInsert.length === 0) {
    return { inserted: 0, skipped: existing.length }
  }

  await db.insert(schema.categories).values(toInsert)

  return { inserted: toInsert.length, skipped: existing.length }
}

async function main() {
  const sql = neon(process.env.DATABASE_URL!)
  const db = drizzle(sql, { schema })

  const result = await seedDefaultCategories(db)

  console.log(
    `Default categories: inserted ${result.inserted}, skipped ${result.skipped} existing`,
  )
}

if (import.meta.main) {
  main().catch((error) => {
    console.error('Failed to seed default categories:', error)
    process.exitCode = 1
  })
}
