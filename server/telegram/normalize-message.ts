import { isAllowedImageMime } from './image-mime'

export type InboundMessage
  = | { kind: 'text', text: string }
    | { kind: 'voice', audio: Uint8Array, mimeType: string }
    | {
      kind: 'image'
      image: Uint8Array
      mimeType: string
      caption?: string
      messageDate: Date
    }
    | { kind: 'album' }
    | { kind: 'pdf' }
    | { kind: 'unsupported' }

export type VoiceTranscriptionResult
  = | { ok: true, text: string }
    | { ok: false, reason: string }

export type ReceiptExtractionResult
  = | { ok: true, text: string }
    | { ok: false, reason: string }

export type NormalizePorts = {
  transcribeVoice: (input: { audio: Uint8Array, mimeType: string }) => Promise<VoiceTranscriptionResult>
  extractReceipt: (input: {
    image: Uint8Array
    mimeType: string
    caption?: string
    messageDate: Date
  }) => Promise<ReceiptExtractionResult>
}

export type NormalizeResult
  = | { ok: true, text: string }
    | { ok: false, reply: string }

const HARD_FAIL_REPLIES = {
  album: 'Please send one image at a time. Multi-image albums are not supported yet.',
  pdf: 'PDFs are not supported. Please send a photo or image file (jpeg, png, or webp) instead.',
  unsupported: 'I can only process text, voice notes, or a single image right now. Please try again with one of those.',
  voiceFailed: 'I could not transcribe that voice note. Please try again or type the transaction.',
  voiceEmpty: 'I could not hear any words in that voice note. Please try again or type the transaction.',
  imageMime: 'That file type is not supported. Please send a photo or image file (jpeg, png, or webp).',
  visionFailed: 'I could not read that image right now. Please try again or type the transaction.',
} as const

function voiceHardFailReply(reason: string): string {
  if (reason === 'empty-audio' || reason === 'empty-transcript') {
    return HARD_FAIL_REPLIES.voiceEmpty
  }
  return HARD_FAIL_REPLIES.voiceFailed
}

export async function normalizeMessage(
  message: InboundMessage,
  ports: NormalizePorts,
): Promise<NormalizeResult> {
  switch (message.kind) {
    case 'text':
      return { ok: true, text: message.text }

    case 'voice': {
      const transcription = await ports.transcribeVoice({
        audio: message.audio,
        mimeType: message.mimeType,
      })
      if (!transcription.ok) {
        return { ok: false, reply: voiceHardFailReply(transcription.reason) }
      }
      return { ok: true, text: transcription.text.trim() }
    }

    case 'image': {
      if (!isAllowedImageMime(message.mimeType)) {
        return { ok: false, reply: HARD_FAIL_REPLIES.imageMime }
      }
      const extraction = await ports.extractReceipt({
        image: message.image,
        mimeType: message.mimeType,
        caption: message.caption,
        messageDate: message.messageDate,
      })
      if (!extraction.ok) {
        return { ok: false, reply: HARD_FAIL_REPLIES.visionFailed }
      }
      return { ok: true, text: extraction.text }
    }

    case 'album':
      return { ok: false, reply: HARD_FAIL_REPLIES.album }

    case 'pdf':
      return { ok: false, reply: HARD_FAIL_REPLIES.pdf }

    case 'unsupported':
      return { ok: false, reply: HARD_FAIL_REPLIES.unsupported }
  }
}
