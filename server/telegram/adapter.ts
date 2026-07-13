import { Bot, webhookCallback } from 'grammy'
import { resolveTelegramUser } from './user'
import { runAgent } from '~~/server/agent'

let bot: Bot | null = null
let webhookRegistered = false
const processedUpdates = new Set<number>()
const MAX_PROCESSED = 1000

export function getBot(): Bot | null {
  return bot
}

export async function initializeBot(): Promise<void> {
  if (bot) return

  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN not set, bot will not start')
    return
  }

  bot = new Bot(token)

  bot.on('message:text', async (ctx) => {
    if (processedUpdates.has(ctx.update.update_id)) return
    processedUpdates.add(ctx.update.update_id)
    if (processedUpdates.size > MAX_PROCESSED) {
      const first = processedUpdates.values().next().value!
      processedUpdates.delete(first)
    }

    const chatId = ctx.chat.id
    const telegramUserId = ctx.from.id.toString()
    const telegramUsername = ctx.from.username || ctx.from.first_name || 'unknown'
    const text = ctx.message.text

    try {
      const userId = await resolveTelegramUser(telegramUserId, telegramUsername)

      ctx.api.sendChatAction(chatId, 'typing').catch(() => {})
      const typingInterval = setInterval(() => {
        ctx.api.sendChatAction(chatId, 'typing').catch(() => {})
      }, 4000)

      try {
        const reply = await runAgent(chatId.toString(), userId, text)
        await new Promise(resolve => setTimeout(resolve, 500))
        await ctx.reply(reply, {
          reply_parameters: { message_id: ctx.message.message_id },
        })
      }
      finally {
        clearInterval(typingInterval)
      }
    }
    catch (error) {
      console.error('[telegram] Error handling message:', error)
      await ctx.reply('Sorry, something went wrong. Please try again.', {
        reply_parameters: { message_id: ctx.message.message_id },
      })
    }
  })

  const webhookUrl = process.env.TELEGRAM_WEBHOOK_URL

  if (webhookUrl && !webhookRegistered) {
    await bot.api.setWebhook(webhookUrl)
    webhookRegistered = true
    console.log(`[telegram] Webhook set to ${webhookUrl}`)
  }
  else if (!webhookUrl) {
    console.warn('[telegram] TELEGRAM_WEBHOOK_URL not set, webhook not registered.')
  }

  console.log('[telegram] Bot initialized')
}

export function getWebhookHandler() {
  if (!bot) return null
  return webhookCallback(bot, 'std/http')
}
