import crypto from 'node:crypto'

/**
 * Midtrans configuration from environment
 */
export function getMidtransConfig() {
  return {
    serverKey: process.env.MIDTRANS_SERVER_KEY as string,
    clientKey: process.env.NUXT_PUBLIC_MIDTRANS_CLIENT_KEY as string,
    isProduction: process.env.NUXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true',
  }
}

/**
 * Get Midtrans API base URL based on environment
 */
export function getMidtransBaseUrl(isProduction: boolean): string {
  return isProduction
    ? 'https://app.midtrans.com'
    : 'https://app.sandbox.midtrans.com'
}

/**
 * Generate unique order ID with timestamp prefix
 * Format: JOLT-{timestamp}-{random}
 */
export function generateOrderId(): string {
  const timestamp = Date.now()
  const random = crypto.randomBytes(4).toString('hex').toUpperCase()
  return `JOLT-${timestamp}-${random}`
}

/**
 * Create Basic Auth header for Midtrans API
 * Midtrans uses server key as username with empty password
 */
export function createMidtransAuthHeader(serverKey: string): string {
  const credentials = Buffer.from(`${serverKey}:`).toString('base64')
  return `Basic ${credentials}`
}

/**
 * Verify Midtrans webhook signature
 * Signature formula: SHA512(order_id + status_code + gross_amount + server_key)
 *
 * @param orderId - The order ID from notification
 * @param statusCode - The status code from notification
 * @param grossAmount - The gross amount from notification
 * @param signatureKey - The signature key from notification
 * @param serverKey - Your Midtrans server key
 * @returns boolean - True if signature is valid
 */
export function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  signatureKey: string,
  serverKey: string,
): boolean {
  const payload = orderId + statusCode + grossAmount + serverKey
  const calculatedSignature = crypto
    .createHash('sha512')
    .update(payload)
    .digest('hex')

  return calculatedSignature === signatureKey
}

/**
 * Create Snap transaction via Midtrans API
 */
export async function createSnapTransaction(params: {
  orderId: string
  amount: number
  customerName?: string
  customerPhone?: string
  itemName?: string
}): Promise<{ token: string, redirect_url: string }> {
  const config = getMidtransConfig()
  const baseUrl = getMidtransBaseUrl(config.isProduction)

  const requestBody = {
    transaction_details: {
      order_id: params.orderId,
      gross_amount: params.amount,
    },
    customer_details: {
      first_name: params.customerName || 'User',
      phone: params.customerPhone || '',
    },
    item_details: [
      {
        id: 'PRO_SUBSCRIPTION',
        name: params.itemName || 'Wuzz PRO Subscription (1 Month)',
        price: params.amount,
        quantity: 1,
      },
    ],
    credit_card: {
      secure: true,
    },
  }

  const response = await fetch(`${baseUrl}/snap/v1/transactions`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': createMidtransAuthHeader(config.serverKey),
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('Midtrans API Error:', errorData)
    throw createError({
      statusCode: response.status,
      statusMessage: 'Failed to create payment transaction',
    })
  }

  return response.json()
}

/**
 * Midtrans notification payload type
 */
export interface MidtransNotification {
  transaction_time: string
  transaction_status: 'pending' | 'settlement' | 'capture' | 'deny' | 'cancel' | 'expire' | 'refund'
  transaction_id: string
  status_message: string
  status_code: string
  signature_key: string
  payment_type: string
  order_id: string
  merchant_id: string
  gross_amount: string
  fraud_status?: 'accept' | 'deny' | 'challenge'
  currency: string
}

/**
 * Check if payment status is successful
 */
export function isPaymentSuccessful(notification: MidtransNotification): boolean {
  const { transaction_status, fraud_status } = notification

  // Credit card capture with accept fraud status
  if (transaction_status === 'capture' && fraud_status === 'accept') {
    return true
  }

  // Settlement for non-credit card payments
  if (transaction_status === 'settlement') {
    return true
  }

  return false
}

/**
 * Check if payment status is failed/cancelled
 */
export function isPaymentFailed(notification: MidtransNotification): boolean {
  const failedStatuses = ['deny', 'cancel', 'expire']
  return failedStatuses.includes(notification.transaction_status)
}
