import { describe, expect, it, mock } from 'bun:test'
import { executeTranscribeVoice } from '../server/telegram/voice-transcription'

describe('Voice Transcription port', () => {
  it('returns transcribed text on success', async () => {
    const fetchAudio = mock(async () => ({ ok: true as const, text: 'bayar listrik 350rb' }))
    const result = await executeTranscribeVoice(
      { audio: new Uint8Array([1, 2, 3]), mimeType: 'audio/ogg' },
      { fetchAudio },
    )
    expect(result).toEqual({ ok: true, text: 'bayar listrik 350rb' })
  })

  it('hard-fails when audio bytes are empty', async () => {
    const fetchAudio = mock(async () => ({ ok: true as const, text: 'should not run' }))
    const result = await executeTranscribeVoice(
      { audio: new Uint8Array([]), mimeType: 'audio/ogg' },
      { fetchAudio },
    )
    expect(result).toEqual({ ok: false, reason: 'empty-audio' })
    expect(fetchAudio).not.toHaveBeenCalled()
  })

  it('hard-fails when the STT provider errors', async () => {
    const result = await executeTranscribeVoice(
      { audio: new Uint8Array([1]), mimeType: 'audio/ogg' },
      { fetchAudio: async () => ({ ok: false, reason: 'provider-error' }) },
    )
    expect(result).toEqual({ ok: false, reason: 'provider-error' })
  })

  it('hard-fails when provider returns blank text', async () => {
    const result = await executeTranscribeVoice(
      { audio: new Uint8Array([1]), mimeType: 'audio/mpeg' },
      { fetchAudio: async () => ({ ok: true, text: '  \n' }) },
    )
    expect(result).toEqual({ ok: false, reason: 'empty-transcript' })
  })
})
