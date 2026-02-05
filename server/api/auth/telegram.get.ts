import { eventHandler, getCookie } from 'h3'
import * as crypto from 'node:crypto'
import { userRepository } from '~~/server/repositories'

export default eventHandler(async (event) => {
  const session = getCookie(event, 'tg_user')

  if (!session) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const decodedCookie = JSON.parse(Buffer.from(session, 'base64').toString('utf-8'))

  if (Date.now() / 1000 - decodedCookie.auth_date > 86400) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const telegramApiToken = process.env.TELEGRAM_BOT_TOKEN

  if (!telegramApiToken) {
    throw createError({ statusCode: 500, statusMessage: 'Telegram bot token is not configured' })
  }

  const secret = crypto.createHash('sha256').update(telegramApiToken).digest()

  const dataCheckString = []
  for (const key in decodedCookie) if (key != 'hash') dataCheckString.push(key + '=' + decodedCookie[key])

  const checkHash = crypto.createHmac('sha256', secret).update(dataCheckString.sort().join('\n')).digest('hex')

  if (checkHash !== decodedCookie.hash) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid telegram signature' })
  }

  const user = await userRepository.findByTelegramId(decodedCookie.id.toString())

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'User not registered' })
  }

  await setUserSession(event, {
    user,
  }, {
    maxAge: 60 * 60,
  })

  deleteCookie(event, 'tg_user')

  return {
    success: true,
  }
},
)
