// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    telegramUserId: string
    telegramUsername: string
    createdAt: Date
  }
}

export { }
