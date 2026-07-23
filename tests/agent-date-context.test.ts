import { afterAll, afterEach, describe, expect, it, mock } from 'bun:test'

let observedSystem = ''

mock.module('ai', () => ({
  generateText: async (options: { system: string }) => {
    observedSystem = options.system
    return { text: 'ok' }
  },
  isStepCount: () => () => false,
  tool: <T>(definition: T) => definition,
}))

mock.module('@ai-sdk/openai-compatible', () => ({
  createOpenAICompatible: () => ({ chatModel: () => ({}) }),
}))

const originalLlmEnv = {
  LLM_BASE_URL: process.env.LLM_BASE_URL,
  LLM_API_KEY: process.env.LLM_API_KEY,
  LLM_MODEL: process.env.LLM_MODEL,
  APP_TIMEZONE: process.env.APP_TIMEZONE,
}

process.env.LLM_BASE_URL = 'https://example.invalid/v1'
process.env.LLM_API_KEY = 'test'
process.env.LLM_MODEL = 'test'
delete process.env.APP_TIMEZONE

const { runAgent } = await import('../server/agent')
const { clearSession } = await import('../server/agent/memory')
const { formatAgentDateContext, resolveAppTimeZone } = await import('../server/agent/date-context')

afterEach(() => {
  clearSession('date-context-test')
  observedSystem = ''
  delete process.env.APP_TIMEZONE
})

afterAll(() => {
  for (const [key, value] of Object.entries(originalLlmEnv)) {
    if (value === undefined) Reflect.deleteProperty(process.env, key)
    else process.env[key] = value
  }
})

describe('Agent date context', () => {
  it('anchors relative dates to the Telegram message time in the configured timezone', async () => {
    await runAgent(
      'date-context-test',
      'test-user',
      'kemarin gua beli kopi 20rb',
      new Date('2026-07-17T17:30:00.000Z'),
    )

    expect(observedSystem).toContain('Current local date: 2026-07-18 (Saturday)')
    expect(observedSystem).toContain('Timezone: Asia/Jakarta')
    expect(observedSystem).toContain('kemarin')
    expect(observedSystem).toContain('YYYY-MM-DD')
  })

  it('uses a configured IANA timezone override', async () => {
    process.env.APP_TIMEZONE = 'America/New_York'

    await runAgent(
      'date-context-test',
      'test-user',
      'yesterday I bought coffee',
      new Date('2026-07-18T02:00:00.000Z'),
    )

    expect(observedSystem).toContain('Current local date: 2026-07-17 (Friday)')
    expect(observedSystem).toContain('Timezone: America/New_York')
  })

  it('rejects invalid timezone configuration', () => {
    expect(() => resolveAppTimeZone({ APP_TIMEZONE: 'not-a-timezone' })).toThrow(
      'APP_TIMEZONE must be a valid IANA timezone. Received: not-a-timezone',
    )
  })

  it('rejects an invalid Agent reference time', () => {
    expect(() => formatAgentDateContext(new Date('invalid'), 'Asia/Jakarta')).toThrow(
      'Agent reference time must be a valid Date',
    )
  })

  it('instructs Transaction Proposal flow for Receipt Extraction facts', async () => {
    await runAgent(
      'date-context-test',
      'test-user',
      'Money Evidence facts\nDate: 2026-07-20\n1. Nasi goreng — 25000',
      new Date('2026-07-24T00:00:00.000Z'),
    )

    expect(observedSystem).toContain('Transaction Proposal')
    expect(observedSystem).toContain('Receipt Extraction')
    expect(observedSystem).toContain('Do NOT call add_transaction')
    expect(observedSystem).toContain('confirm')
  })
})
