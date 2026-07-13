import { userRepository } from '~~/server/repositories'

export async function resolveTelegramUser(telegramUserId: string, telegramUsername: string): Promise<string> {
  const existing = await userRepository.findByTelegramId(telegramUserId)

  if (existing) {
    return existing.id
  }

  const created = await userRepository.create({
    telegramUserId,
    telegramUsername,
  })

  return created.id
}
