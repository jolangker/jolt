import crypto from 'node:crypto'

const TIMESTAMP_TOLERANCE_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Verify HMAC signature for n8n requests
 *
 * The signature is calculated as: HMAC-SHA256(timestamp:telegramId, secret)
 *
 * @param telegramId - The telegramId from x-telegram-id header
 * @param timestamp - Unix timestamp in milliseconds from x-timestamp header
 * @param signature - HMAC signature from x-signature header
 * @param secret - The APP_SECRET used for signing
 * @returns Object with valid flag and optional error message
 */
export function verifyHmacSignature(
  telegramId: string,
  timestamp: string,
  signature: string,
  secret: string,
): { valid: boolean, error?: string } {
  // Validate timestamp format
  const ts = parseInt(timestamp, 10)
  if (isNaN(ts)) {
    return { valid: false, error: 'Invalid timestamp format' }
  }

  // Check timestamp freshness (prevent replay attacks)
  const now = Date.now()
  if (Math.abs(now - ts) > TIMESTAMP_TOLERANCE_MS) {
    return { valid: false, error: 'Request expired or timestamp too far in future' }
  }

  // Calculate expected signature
  const payload = `${timestamp}:${telegramId}`
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')

  // Timing-safe comparison to prevent timing attacks
  const signatureBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expectedSignature)

  if (signatureBuffer.length !== expectedBuffer.length) {
    return { valid: false, error: 'Invalid signature' }
  }

  if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return { valid: false, error: 'Invalid signature' }
  }

  return { valid: true }
}
