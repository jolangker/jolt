import { describe, expect, it, mock } from 'bun:test'
import { normalizeMessage, type NormalizePorts } from '../server/telegram/normalize-message'

function ports(overrides: Partial<NormalizePorts> = {}): NormalizePorts {
  return {
    transcribeVoice: mock(async () => ({ ok: true as const, text: 'transcribed' })),
    extractReceipt: mock(async () => ({ ok: true as const, text: 'Receipt facts' })),
    ...overrides,
  }
}

describe('Message Normalization', () => {
  it('passes plain text through for the Agent', async () => {
    const result = await normalizeMessage({ kind: 'text', text: 'beli kopi 20rb' }, ports())
    expect(result).toEqual({ ok: true, text: 'beli kopi 20rb' })
  })

  it('turns successful Voice Transcription into Agent text', async () => {
    const result = await normalizeMessage(
      { kind: 'voice', audio: new Uint8Array([1, 2, 3]), mimeType: 'audio/ogg' },
      ports({
        transcribeVoice: async () => ({ ok: true, text: 'bayar listrik 350rb kemarin' }),
      }),
    )
    expect(result).toEqual({ ok: true, text: 'bayar listrik 350rb kemarin' })
  })

  it('hard-fails when Voice Transcription fails without Agent text', async () => {
    const result = await normalizeMessage(
      { kind: 'voice', audio: new Uint8Array([1]), mimeType: 'audio/ogg' },
      ports({
        transcribeVoice: async () => ({ ok: false, reason: 'provider-error' }),
      }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reply).toContain('ditranskrip')
    }
  })

  it('hard-fails with empty-voice copy when transcript is empty', async () => {
    const result = await normalizeMessage(
      { kind: 'voice', audio: new Uint8Array([1]), mimeType: 'audio/ogg' },
      ports({
        transcribeVoice: async () => ({ ok: false, reason: 'empty-transcript' }),
      }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reply).toContain('kata')
    }
  })

  it('passes Receipt Extraction facts text to the Agent', async () => {
    const extractReceipt = mock(async () => ({
      ok: true as const,
      text: 'Money Evidence facts\nDate: 2026-07-20\n1. Nasi goreng — 25000\n2. Es teh — 8000',
    }))
    const result = await normalizeMessage(
      {
        kind: 'image',
        image: new Uint8Array([9, 9]),
        mimeType: 'image/jpeg',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      ports({ extractReceipt }),
    )
    expect(result).toEqual({
      ok: true,
      text: 'Money Evidence facts\nDate: 2026-07-20\n1. Nasi goreng — 25000\n2. Es teh — 8000',
    })
  })

  it('treats soft refusal text from Receipt Extraction as Agent success text', async () => {
    const result = await normalizeMessage(
      {
        kind: 'image',
        image: new Uint8Array([1]),
        mimeType: 'image/png',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      ports({
        extractReceipt: async () => ({
          ok: true,
          text: 'Gambar ini sepertinya bukan bukti uang (struk atau screenshot transfer). Kirim foto yang lebih jelas atau ketik transaksi-nya.',
        }),
      }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.text).toContain('bukti uang')
    }
  })

  it('hard-fails when Receipt Extraction provider is unavailable', async () => {
    const result = await normalizeMessage(
      {
        kind: 'image',
        image: new Uint8Array([1]),
        mimeType: 'image/jpeg',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      ports({
        extractReceipt: async () => ({ ok: false, reason: 'provider-error' }),
      }),
    )
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.reply).toContain('Gambar')
    }
  })

  it('passes caption and message date into Receipt Extraction', async () => {
    const extractReceipt = mock(async () => ({ ok: true as const, text: 'facts' }))
    const messageDate = new Date('2026-07-18T12:00:00.000Z')
    await normalizeMessage(
      {
        kind: 'image',
        image: new Uint8Array([1, 2]),
        mimeType: 'image/webp',
        caption: 'kemarin belanja bulanan',
        messageDate,
      },
      ports({ extractReceipt }),
    )
    expect(extractReceipt).toHaveBeenCalledWith({
      image: expect.any(Uint8Array),
      mimeType: 'image/webp',
      caption: 'kemarin belanja bulanan',
      messageDate,
    })
  })

  it('hard-fails multi-image albums without calling extraction', async () => {
    const extractReceipt = mock(async () => ({ ok: true as const, text: 'should not run' }))
    const result = await normalizeMessage({ kind: 'album' }, ports({ extractReceipt }))
    expect(result.ok).toBe(false)
    expect(extractReceipt).not.toHaveBeenCalled()
  })

  it('hard-fails PDFs without calling extraction', async () => {
    const extractReceipt = mock(async () => ({ ok: true as const, text: 'should not run' }))
    const result = await normalizeMessage({ kind: 'pdf' }, ports({ extractReceipt }))
    expect(result.ok).toBe(false)
    expect(extractReceipt).not.toHaveBeenCalled()
  })

  it('hard-fails unsupported media without Agent text', async () => {
    const result = await normalizeMessage({ kind: 'unsupported' }, ports())
    expect(result.ok).toBe(false)
  })

  it('does not return media buffers from the normalizer API', async () => {
    const image = new Uint8Array([7, 7, 7])
    const result = await normalizeMessage(
      {
        kind: 'image',
        image,
        mimeType: 'image/jpeg',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      ports({ extractReceipt: async () => ({ ok: true, text: 'line 1' }) }),
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(JSON.stringify(result)).not.toContain('7,7,7')
      expect(Object.keys(result).sort()).toEqual(['ok', 'text'])
    }
  })

  it('rejects non-image MIME types as hard failures before extraction', async () => {
    const extractReceipt = mock(async () => ({ ok: true as const, text: 'should not run' }))
    const result = await normalizeMessage(
      {
        kind: 'image',
        image: new Uint8Array([1]),
        mimeType: 'application/pdf',
        messageDate: new Date('2026-07-24T00:00:00.000Z'),
      },
      ports({ extractReceipt }),
    )
    expect(result.ok).toBe(false)
    expect(extractReceipt).not.toHaveBeenCalled()
  })
})
