import { Bot, webhookCallback } from 'grammy'
import { resolveTelegramUser } from './user'
import { runAgent } from '~~/server/agent'
import { resolveAppTimeZone } from '~~/server/agent/date-context'
import { dashboardAccessLinkService } from '~~/server/services'

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

  resolveAppTimeZone()

  bot = new Bot(token)
  await bot.api.setMyCommands([{ command: 'dashboard', description: 'Open your Jolt dashboard' }])

  bot.command('dashboard', async (ctx) => {
    if (ctx.chat.type !== 'private' || !ctx.from) return
    const userId = await resolveTelegramUser(ctx.from.id.toString(), ctx.from.username || ctx.from.first_name || 'unknown')
    const link = await dashboardAccessLinkService.issue(userId)
    await ctx.reply(`Open your dashboard: ${link.url}\n\nThis link expires in 5 minutes.`, { link_preview_options: { is_disabled: true } })
  })

  bot.on('message:text', async (ctx) => {
    if (ctx.chat.type !== 'private') return
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
        const result = await runAgent(chatId.toString(), userId, text, new Date(ctx.message.date * 1000))
        await new Promise(resolve => setTimeout(resolve, 500))
        await ctx.reply(result.reply, {
          reply_parameters: { message_id: ctx.message.message_id },
        })
        if (result.dashboardLink) {
          await ctx.reply(`Open your dashboard: ${result.dashboardLink.url}\n\nThis link expires in 5 minutes.`, { link_preview_options: { is_disabled: true } })
        }
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
