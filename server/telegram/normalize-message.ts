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
  album: 'Kirim satu gambar saja ya. Album multi-gambar belum didukung.',
  pdf: 'PDF belum didukung. Kirim foto atau file gambar (jpeg, png, atau webp) saja.',
  unsupported: 'Saat ini saya hanya bisa memproses teks, pesan suara, atau satu gambar. Coba kirim salah satunya ya.',
  voiceFailed: 'Suara tidak bisa ditranskrip. Coba lagi atau ketik transaksi-nya.',
  voiceEmpty: 'Tidak ada kata yang terdengar di pesan suara itu. Coba lagi atau ketik transaksi-nya.',
  imageMime: 'Jenis file itu tidak didukung. Kirim foto atau file gambar (jpeg, png, atau webp).',
  visionFailed: 'Gambar belum bisa dibaca. Coba lagi atau ketik transaksi-nya.',
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
