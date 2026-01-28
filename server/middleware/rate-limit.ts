import { checkRateLimit } from '../utils/rate-limit'

// Rate limit configuration
const GLOBAL_LIMIT = 100 // requests per minute for all API endpoints
const GLOBAL_WINDOW_MS = 60 * 1000 // 1 minute

export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Only apply to API routes
  if (!url.pathname.startsWith('/api')) return

  // Get client IP (Caddy/nginx sets X-Forwarded-For)
  const ip = getHeader(event, 'x-forwarded-for')?.split(',')[0]?.trim()
    || event.node.req.socket.remoteAddress
    || 'unknown'

  // Global limit for all API endpoints
  const result = checkRateLimit(`global:${ip}`, GLOBAL_LIMIT, GLOBAL_WINDOW_MS)
  if (!result.allowed) {
    setHeader(event, 'Retry-After', Math.ceil((result.resetAt - Date.now()) / 1000).toString())
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests. Please slow down.',
    })
  }
})
