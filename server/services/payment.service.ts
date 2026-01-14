import { paymentRepository, userRepository } from '~~/server/repositories'
import {
  createSnapTransaction,
  generateOrderId,
  getMidtransConfig,
  isPaymentFailed,
  isPaymentSuccessful,
  verifyMidtransSignature,
  type MidtransNotification,
} from '~~/server/utils/midtrans'

export const paymentService = {
  /**
   * Create a new payment transaction for PRO subscription
   */
  async createTransaction(userId: string, userPhone?: string) {
    const amount = Number(process.env.PRO_SUBSCRIPTION_PRICE) || 19000

    // Generate unique order ID
    const orderId = generateOrderId()

    // Expiry time (24 hours from now)
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Create payment order in database
    await paymentRepository.create({
      userId,
      orderId,
      amount,
      expiresAt,
    })

    // Create Snap transaction with Midtrans
    const snapResponse = await createSnapTransaction({
      orderId,
      amount,
      customerPhone: userPhone,
      itemName: 'Jolt PRO Subscription (1 Month)',
    })

    return {
      token: snapResponse.token,
      redirectUrl: snapResponse.redirect_url,
      orderId,
    }
  },

  /**
   * Handle Midtrans webhook notification
   * Returns true if notification was processed successfully
   */
  async handleNotification(notification: MidtransNotification): Promise<{
    success: boolean
    message: string
  }> {
    const { order_id, status_code, gross_amount, signature_key } = notification

    // Verify signature for security
    const config = getMidtransConfig()
    const isValidSignature = verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      signature_key,
      config.serverKey,
    )

    if (!isValidSignature) {
      console.error(`[Midtrans] Invalid signature for order: ${order_id}`)
      return {
        success: false,
        message: 'Invalid signature',
      }
    }

    // Find the payment order
    const paymentOrder = await paymentRepository.findByOrderId(order_id)
    if (!paymentOrder) {
      console.error(`[Midtrans] Order not found: ${order_id}`)
      return {
        success: false,
        message: 'Order not found',
      }
    }

    // Idempotency check: don't process if already in final state
    const finalStates = ['settlement', 'capture', 'deny', 'cancel', 'expire', 'refund']
    if (finalStates.includes(paymentOrder.status) && paymentOrder.status !== 'pending') {
      console.log(`[Midtrans] Order ${order_id} already processed with status: ${paymentOrder.status}`)
      return {
        success: true,
        message: 'Already processed',
      }
    }

    // Update payment status
    await paymentRepository.updateStatus(order_id, {
      status: notification.transaction_status,
      paymentType: notification.payment_type,
      transactionId: notification.transaction_id,
      transactionTime: new Date(notification.transaction_time),
    })

    // If payment successful, upgrade user to PRO
    if (isPaymentSuccessful(notification)) {
      // Calculate subscription end date (1 month from now)
      const subscriptionEndsAt = new Date()
      subscriptionEndsAt.setMonth(subscriptionEndsAt.getMonth() + 1)

      await userRepository.upgradeToPro(paymentOrder.userId, subscriptionEndsAt)
      console.log(`[Midtrans] User ${paymentOrder.userId} upgraded to PRO until ${subscriptionEndsAt}`)
    }
    else if (isPaymentFailed(notification)) {
      console.log(`[Midtrans] Payment failed for order: ${order_id}, status: ${notification.transaction_status}`)
    }

    return {
      success: true,
      message: 'Notification processed',
    }
  },
}
