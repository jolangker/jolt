import { Bot, type Context, webhookCallback } from 'grammy'
import { resolveTelegramUser } from './user'
import { runAgent } from '~~/server/agent'
import { resolveAppTimeZone } from '~~/server/agent/date-context'
import { dashboardAccessLinkService } from '~~/server/services'
import { classifyInbound, toInboundMessage } from './classify-inbound'
import { downloadTelegramFile } from './download-media'
import { normalizeMessage, type NormalizePorts } from './normalize-message'
import { extractReceipt } from './receipt-extraction'
import { transcribeVoice } from './voice-transcription'

let bot: Bot | null = null
let webhookRegistered = false
const processedUpdates = new Set<number>()
const MAX_PROCESSED = 1000

const defaultPorts: NormalizePorts = {
  transcribeVoice,
  extractReceipt,
}

export function getBot(): Bot | null {
  return bot
}

function trackUpdate(updateId: number): boolean {
  if (processedUpdates.has(updateId)) return false
  processedUpdates.add(updateId)
  if (processedUpdates.size > MAX_PROCESSED) {
    const first = processedUpdates.values().next().value!
    processedUpdates.delete(first)
  }
  return true
}

async function withTyping(ctx: Context, chatId: number, work: () => Promise<void>): Promise<void> {
  ctx.api.sendChatAction(chatId, 'typing').catch(() => {})
  const typingInterval = setInterval(() => {
    ctx.api.sendChatAction(chatId, 'typing').catch(() => {})
  }, 4000)
  try {
    await work()
  }
  finally {
    clearInterval(typingInterval)
  }
}

async function handlePrivateMessage(ctx: Context, ports: NormalizePorts = defaultPorts): Promise<void> {
  if (!ctx.chat || ctx.chat.type !== 'private' || !ctx.from || !ctx.message) return
  if (!trackUpdate(ctx.update.update_id)) return

  const chatId = ctx.chat.id
  const telegramUserId = ctx.from.id.toString()
  const telegramUsername = ctx.from.username || ctx.from.first_name || 'unknown'
  const messageDate = new Date(ctx.message.date * 1000)
  const token = process.env.TELEGRAM_BOT_TOKEN

  try {
    const userId = await resolveTelegramUser(telegramUserId, telegramUsername)
    const classified = classifyInbound(ctx.message)

    await withTyping(ctx, chatId, async () => {
      let mediaBytes: Uint8Array | undefined

      if (classified.kind === 'voice' || classified.kind === 'image') {
        if (!token) {
          await ctx.reply('Sorry, something went wrong. Please try again.', {
            reply_parameters: { message_id: ctx.message!.message_id },
          })
          return
        }
        mediaBytes = await downloadTelegramFile(
          classified.fileId,
          token,
          { getFile: fileId => ctx.api.getFile(fileId) },
        )
      }

      const inbound = toInboundMessage(
        classified,
        mediaBytes ? { bytes: mediaBytes } : undefined,
      )

      const normalized = await normalizeMessage(inbound, ports)

      if (!normalized.ok) {
        await ctx.reply(normalized.reply, {
          reply_parameters: { message_id: ctx.message!.message_id },
        })
        return
      }

      const result = await runAgent(chatId.toString(), userId, normalized.text, messageDate)
      await new Promise(resolve => setTimeout(resolve, 500))
      await ctx.reply(result.reply, {
        reply_parameters: { message_id: ctx.message!.message_id },
      })
      if (result.dashboardLink) {
        await ctx.reply(
          `Open your dashboard: ${result.dashboardLink.url}\n\nThis link expires in 5 minutes.`,
          { link_preview_options: { is_disabled: true } },
        )
      }
    })
  }
  catch (error) {
    console.error('[telegram] Error handling message:', error)
    await ctx.reply('Sorry, something went wrong. Please try again.', {
      reply_parameters: { message_id: ctx.message.message_id },
    })
  }
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

  bot.on('message:text', ctx => handlePrivateMessage(ctx))
  bot.on('message:voice', ctx => handlePrivateMessage(ctx))
  bot.on('message:photo', ctx => handlePrivateMessage(ctx))
  bot.on('message:document', ctx => handlePrivateMessage(ctx))

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
  // Telegram allows ~60s; image vision + tools often exceed grammY's 10s default
  // and surface as webhook 500 / hard-fail replies.
  return webhookCallback(bot, 'std/http', {
    timeoutMilliseconds: 55_000,
    onTimeout: 'return',
  })
}
