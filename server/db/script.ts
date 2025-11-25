import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import * as schema from './schema'
import { eq } from 'drizzle-orm'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function main() {
    const data = await db.query.transactions.findMany({
        with: {
            category: true,
        },
    })
    for (const item of data) {
        await db.update(schema.transactions).set({
            type: item.category.type,
        }).where(eq(schema.transactions.id, item.id))
    }
    console.log('done')
}

main()
