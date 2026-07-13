export interface Turn {
  role: 'user' | 'assistant'
  content: string
}

interface Session {
  turns: Turn[]
  lastActiveAt: number
}

const MAX_TURNS = 10
const TTL_MS = 30 * 60 * 1000

const sessions = new Map<string, Session>()

export function getTurns(chatId: string): Turn[] {
  const session = sessions.get(chatId)

  if (!session) return []

  if (Date.now() - session.lastActiveAt > TTL_MS) {
    sessions.delete(chatId)
    return []
  }

  return session.turns
}

export function addTurn(chatId: string, turn: Turn): void {
  let session = sessions.get(chatId)

  if (!session) {
    session = { turns: [], lastActiveAt: Date.now() }
    sessions.set(chatId, session)
  }

  session.turns.push(turn)
  session.lastActiveAt = Date.now()

  if (session.turns.length > MAX_TURNS) {
    session.turns = session.turns.slice(-MAX_TURNS)
  }
}

export function clearSession(chatId: string): void {
  sessions.delete(chatId)
}
