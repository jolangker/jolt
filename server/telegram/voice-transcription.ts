import type { VoiceTranscriptionResult } from './normalize-message'

export type TranscribeVoiceInput = {
  audio: Uint8Array
  mimeType: string
}

export type AudioFetchResult
  = | { ok: true, text: string }
    | { ok: false, reason: string }

export type TranscribeVoiceDeps = {
  fetchAudio: (input: TranscribeVoiceInput) => Promise<AudioFetchResult>
}

export async function executeTranscribeVoice(
  input: TranscribeVoiceInput,
  deps: TranscribeVoiceDeps,
): Promise<VoiceTranscriptionResult> {
  if (input.audio.byteLength === 0) {
    return { ok: false, reason: 'empty-audio' }
  }

  const result = await deps.fetchAudio(input)
  if (!result.ok) {
    return { ok: false, reason: result.reason }
  }

  const text = result.text.trim()
  if (!text) {
    return { ok: false, reason: 'empty-transcript' }
  }

  return { ok: true, text }
}

function extensionForMime(mimeType: string): string {
  const normalized = mimeType.toLowerCase().split(';')[0]!.trim()
  switch (normalized) {
    case 'audio/ogg':
    case 'audio/opus':
      return 'ogg'
    case 'audio/mpeg':
    case 'audio/mp3':
      return 'mp3'
    case 'audio/mp4':
    case 'audio/m4a':
    case 'audio/x-m4a':
      return 'm4a'
    case 'audio/wav':
    case 'audio/x-wav':
      return 'wav'
    case 'audio/webm':
      return 'webm'
    default:
      return 'ogg'
  }
}

export type SttConfig = {
  baseURL: string
  apiKey: string
  model: string
}

/** Prefer STT_* env; fall back to LLM_* so a single OpenAI-compatible stack still works. */
export function resolveSttConfig(env: NodeJS.ProcessEnv = process.env): SttConfig | null {
  const baseURL = env.STT_BASE_URL || env.LLM_BASE_URL
  const apiKey = env.STT_API_KEY || env.LLM_API_KEY
  const model = env.STT_MODEL || env.LLM_STT_MODEL || 'whisper-1'

  if (!baseURL || !apiKey) return null
  return { baseURL, apiKey, model }
}

export async function openAiCompatibleTranscribe(
  input: TranscribeVoiceInput,
  env: NodeJS.ProcessEnv = process.env,
): Promise<AudioFetchResult> {
  const config = resolveSttConfig(env)
  if (!config) {
    return { ok: false, reason: 'stt-not-configured' }
  }

  try {
    const form = new FormData()
    const bytes = new Uint8Array(input.audio)
    const blob = new Blob([bytes.buffer], { type: input.mimeType || 'audio/ogg' })
    form.append('file', blob, `voice.${extensionForMime(input.mimeType)}`)
    form.append('model', config.model)

    const response = await fetch(`${config.baseURL.replace(/\/$/, '')}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: form,
    })

    if (!response.ok) {
      return { ok: false, reason: 'provider-error' }
    }

    const data = await response.json() as { text?: string }
    return { ok: true, text: data.text ?? '' }
  }
  catch {
    return { ok: false, reason: 'provider-error' }
  }
}

export async function transcribeVoice(input: TranscribeVoiceInput): Promise<VoiceTranscriptionResult> {
  return executeTranscribeVoice(input, { fetchAudio: openAiCompatibleTranscribe })
}
