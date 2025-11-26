import { and, eq, gte, lte, sql } from "drizzle-orm"
import z from "zod"
import { categories, transactions } from "~~/server/db/schema"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId
    const query = await getValidatedQuery(event, z.object({
        startDate: z.string().nullable().optional(),
        endDate: z.string().nullable().optional(),
        type: z.enum(['income', 'expense']),
    }).parse)

    const filterBuilder = () => {
        const filters = []
        filters.push(eq(transactions.userId, userId))
        filters.push(eq(transactions.type, query.type))
        if (query.startDate) filters.push(gte(transactions.date, new Date(query.startDate)))
        if (query.endDate) filters.push(lte(transactions.date, new Date(query.endDate)))
        return and(...filters)
    }

    const breakdown = await db.select({
        category: categories.name,
        sum: sql<number>`sum(${transactions.amount})`.mapWith(Number),
        count: sql<number>`count(${transactions.id})`.mapWith(Number),
    })
        .from(transactions)
        .where(filterBuilder())
        .innerJoin(categories, eq(transactions.categoryId, categories.id))
        .groupBy(categories.name)

    return {
        success: true,
        data: breakdown
    }
})