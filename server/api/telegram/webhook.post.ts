import { getWebhookHandler } from '~~/server/telegram/adapter'

export default defineEventHandler(async (event) => {
  const handler = getWebhookHandler()

  if (!handler) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Telegram bot not configured',
    })
  }

  const body = await readRawBody(event)
  const request = new Request(getRequestURL(event).href, {
    method: 'POST',
    headers: getRequestHeaders(event) as Record<string, string>,
    body: body ?? undefined,
  })

  const response = await handler(request)

  setResponseStatus(event, response.status)

  response.headers.forEach((value, key) => {
    setResponseHeader(event, key, value)
  })

  return await response.text()
})
