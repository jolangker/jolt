import { sql } from "drizzle-orm"
import { transactions } from "../db/schema"

export default defineEventHandler(async (event) => {
    const userId = event.context.auth.userId

    const sum = await db.select({
        type: transactions.type,
        sum: sql<number>`sum(${transactions.amount})`,
    })
        .from(transactions)
        .groupBy(transactions.type)

    const income = sum.find((s) => s.type === 'income')?.sum || 0
    const expense = sum.find((s) => s.type === 'expense')?.sum || 0
    const nett = (income - expense).toString()

    return {
        success: true,
        data: {
            income,
            expense,
            nett
        },
    }
})