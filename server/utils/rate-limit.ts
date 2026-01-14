/**
 * In-memory rate limiter utility
 *
 * Tracks request counts per key with automatic expiry.
 * Note: Resets on server restart. Use Redis for persistence if needed.
 */

interface RateLimitRecord {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitRecord>()

// Clean up expired entries periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

/**
 * Check if a request is allowed under rate limiting
 *
 * @param key - Unique identifier (e.g., `ip:192.168.1.1` or `phone:+628xxx`)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns Object with allowed flag and metadata
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const record = store.get(key)

  // First request or window expired
  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs }
  }

  // Rate limit exceeded
  if (record.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt }
  }

  // Increment and allow
  record.count++
  return { allowed: true, remaining: maxRequests - record.count, resetAt: record.resetAt }
}
