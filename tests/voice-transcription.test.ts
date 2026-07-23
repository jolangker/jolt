import { describe, expect, it, mock } from 'bun:test'
import { executeTranscribeVoice, resolveSttConfig } from '../server/telegram/voice-transcription'

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

describe('resolveSttConfig', () => {
  it('prefers dedicated STT env over LLM env', () => {
    expect(resolveSttConfig({
      LLM_BASE_URL: 'https://chat.example/v1',
      LLM_API_KEY: 'chat-key',
      STT_BASE_URL: 'https://stt.example/v1',
      STT_API_KEY: 'stt-key',
      STT_MODEL: 'whisper-1',
    })).toEqual({
      baseURL: 'https://stt.example/v1',
      apiKey: 'stt-key',
      model: 'whisper-1',
    })
  })

  it('falls back to LLM env when STT env is unset', () => {
    expect(resolveSttConfig({
      LLM_BASE_URL: 'https://api.openai.com/v1',
      LLM_API_KEY: 'llm-key',
    })).toEqual({
      baseURL: 'https://api.openai.com/v1',
      apiKey: 'llm-key',
      model: 'whisper-1',
    })
  })

  it('returns null when no base URL or key is available', () => {
    expect(resolveSttConfig({})).toBeNull()
  })
})
