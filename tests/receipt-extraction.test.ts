import { describe, expect, it, mock } from 'bun:test'
import { executeExtractReceipt, formatMessageDate } from '../server/telegram/receipt-extraction'

describe('Receipt Extraction port', () => {
  it('returns vision model text facts as-is for the Agent', async () => {
    const facts = 'Money Evidence facts\nDate: 2026-07-20\n1. Kopi — 20000'
    const callVision = mock(async () => ({ ok: true as const, text: facts }))
    const result = await executeExtractReceipt(
      {
        image: new Uint8Array([1, 2]),
        mimeType: 'image/jpeg',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      { callVision },
    )
    expect(result).toEqual({ ok: true, text: facts })
  })

  it('includes caption and message date in the vision request context', async () => {
    const callVision = mock(async () => ({ ok: true as const, text: 'facts' }))
    const messageDate = new Date('2026-07-18T12:00:00.000Z')
    await executeExtractReceipt(
      {
        image: new Uint8Array([9]),
        mimeType: 'image/png',
        caption: 'kemarin belanja bulanan',
        messageDate,
      },
      { callVision },
    )
    expect(callVision).toHaveBeenCalledWith(
      expect.objectContaining({
        mimeType: 'image/png',
        caption: 'kemarin belanja bulanan',
        messageDateLabel: formatMessageDate(messageDate),
        image: expect.any(Uint8Array),
      }),
    )
  })

  it('hard-fails when vision provider is unavailable', async () => {
    const result = await executeExtractReceipt(
      {
        image: new Uint8Array([1]),
        mimeType: 'image/webp',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      {
        callVision: async () => ({ ok: false, reason: 'provider-error' }),
      },
    )
    expect(result).toEqual({ ok: false, reason: 'provider-error' })
  })

  it('hard-fails when vision returns blank text', async () => {
    const result = await executeExtractReceipt(
      {
        image: new Uint8Array([1]),
        mimeType: 'image/jpeg',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      {
        callVision: async () => ({ ok: true, text: '  \n' }),
      },
    )
    expect(result).toEqual({ ok: false, reason: 'empty-extraction' })
  })
})
