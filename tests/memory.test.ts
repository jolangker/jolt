import { describe, it, expect, beforeEach } from 'bun:test'
import { getTurns, addTurn, clearSession } from '../server/agent/memory'

describe('conversation memory', () => {
  const chatId = 'test-chat-123'

  beforeEach(() => {
    clearSession(chatId)
  })

  it('returns empty array for unknown chat', () => {
    expect(getTurns('nonexistent')).toEqual([])
  })

  it('stores and retrieves turns', () => {
    addTurn(chatId, { role: 'user', content: 'hello' })
    addTurn(chatId, { role: 'assistant', content: 'hi there' })

    const turns = getTurns(chatId)
    expect(turns).toHaveLength(2)
    expect(turns[0]).toEqual({ role: 'user', content: 'hello' })
    expect(turns[1]).toEqual({ role: 'assistant', content: 'hi there' })
  })

  it('limits to 10 turns', () => {
    for (let i = 0; i < 15; i++) {
      addTurn(chatId, { role: i % 2 === 0 ? 'user' : 'assistant', content: `msg-${i}` })
    }

    const turns = getTurns(chatId)
    expect(turns).toHaveLength(10)
    expect(turns[0]!.content).toBe('msg-5')
    expect(turns[9]!.content).toBe('msg-14')
  })

  it('clears session', () => {
    addTurn(chatId, { role: 'user', content: 'hello' })
    clearSession(chatId)
    expect(getTurns(chatId)).toEqual([])
  })

  it('handles multiple independent chats', () => {
    addTurn('chat-a', { role: 'user', content: 'from a' })
    addTurn('chat-b', { role: 'user', content: 'from b' })

    expect(getTurns('chat-a')).toHaveLength(1)
    expect(getTurns('chat-b')).toHaveLength(1)
    expect(getTurns('chat-a')[0]!.content).toBe('from a')
    expect(getTurns('chat-b')[0]!.content).toBe('from b')

    clearSession('chat-a')
    clearSession('chat-b')
  })
})
