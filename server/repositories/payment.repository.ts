import { eq } from 'drizzle-orm'
import { db } from '~~/server/utils/db'
import { paymentOrders } from '~~/server/db/schema'

export interface CreatePaymentOrderData {
  userId: string
  orderId: string
  amount: number
  expiresAt?: Date
}

export interface UpdatePaymentStatusData {
  status: string
  paymentType?: string
  transactionId?: string
  transactionTime?: Date
}

export const paymentRepository = {
  async create(data: CreatePaymentOrderData) {
    const [order] = await db
      .insert(paymentOrders)
      .values({
        userId: data.userId,
        orderId: data.orderId,
        amount: data.amount,
        expiresAt: data.expiresAt,
      })
      .returning()

    return order
  },

  async findByOrderId(orderId: string) {
    return db.query.paymentOrders.findFirst({
      where: eq(paymentOrders.orderId, orderId),
    })
  },

  async findByUserId(userId: string) {
    return db.query.paymentOrders.findMany({
      where: eq(paymentOrders.userId, userId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    })
  },

  async updateStatus(orderId: string, data: UpdatePaymentStatusData) {
    await db
      .update(paymentOrders)
      .set({
        status: data.status,
        paymentType: data.paymentType,
        transactionId: data.transactionId,
        transactionTime: data.transactionTime,
        updatedAt: new Date(),
      })
      .where(eq(paymentOrders.orderId, orderId))
  },
}
