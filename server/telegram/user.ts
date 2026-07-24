import { userRepository } from '~~/server/repositories'

export async function resolveTelegramUser(telegramUserId: string, telegramUsername: string): Promise<string> {
  const existing = await userRepository.findByTelegramId(telegramUserId)

  if (existing) {
    return existing.id
  }

  const created = await userRepository.create({
    telegramUserId,
    telegramUsername,
  }).catch(async (error: { code?: string }) => {
    if (error.code === '23505') return userRepository.findByTelegramId(telegramUserId)
    throw error
  })

  if (!created) throw createError({ statusCode: 500, statusMessage: 'Gagal memetakan pengguna Telegram' })

  return created.id
}
