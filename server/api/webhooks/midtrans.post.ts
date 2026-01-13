import { paymentService } from '~~/server/services'
import type { MidtransNotification } from '~~/server/utils/midtrans'

/**
 * Midtrans Webhook Handler
 *
 * This endpoint receives payment notifications from Midtrans.
 * It's a public endpoint (no auth) but secured via signature verification.
 *
 * IMPORTANT: Always return 200 OK to Midtrans, even on errors.
 * Otherwise, Midtrans will keep retrying the notification.
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<MidtransNotification>(event)

    console.log('[Midtrans Webhook] Received notification:', {
      order_id: body.order_id,
      transaction_status: body.transaction_status,
      payment_type: body.payment_type,
    })

    const result = await paymentService.handleNotification(body)

    if (!result.success) {
      console.error('[Midtrans Webhook] Processing failed:', result.message)
    }

    // Always return 200 OK to Midtrans
    return {
      status: 'OK',
      message: result.message,
    }
  }
  catch (error: any) {
    console.error('[Midtrans Webhook] Error:', error)

    // Still return 200 to prevent Midtrans from retrying
    return {
      status: 'OK',
      message: 'Error processing notification',
    }
  }
})
