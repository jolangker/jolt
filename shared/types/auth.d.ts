// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    telegramId: string
    createdAt: Date
    tier: 'FREE' | 'PRO'
    subscriptionEndsAt: Date | null
    voiceQuota: number
    isTrialUsed: boolean
  }
}

export interface AuthContext {
  userId: string
  source: 'web' | 'n8n'
  tier: 'FREE' | 'PRO'
}

export interface TelegramAuthData {
  id: number
  username: string
  auth_date: number
  hash: string
}

export { }
