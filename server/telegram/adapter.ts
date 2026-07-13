import { Bot, webhookCallback } from 'grammy'
import { resolveTelegramUser } from './user'
import { runAgent } from '~~/server/agent'

let bot: Bot | null = null

export function getBot(): Bot | null {
  return bot
}

export async function initializeBot(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN not set, bot will not start')
    return
  }

  bot = new Bot(token)

  bot.on('message:text', async (ctx) => {
    const chatId = ctx.chat.id.toString()
    const telegramUserId = ctx.from.id.toString()
    const telegramUsername = ctx.from.username || ctx.from.first_name || 'unknown'
    const text = ctx.message.text

    try {
      const userId = await resolveTelegramUser(telegramUserId, telegramUsername)
      const reply = await runAgent(chatId, userId, text)
      await ctx.reply(reply)
    }
    catch (error) {
      console.error('[telegram] Error handling message:', error)
      await ctx.reply('Sorry, something went wrong. Please try again.')
    }
  })

  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL

  if (webhookUrl) {
    await bot.api.setWebhook(webhookUrl)
    console.log(`[telegram] Webhook set to ${webhookUrl}`)
  }
  else {
    console.warn('[telegram] TELEGRAM_WEBHOOK_URL not set, webhook not registered. Set it to receive messages.')
  }

  console.log('[telegram] Bot initialized')
}

export function getWebhookHandler() {
  if (!bot) return null
  return webhookCallback(bot, 'std/http')
}
