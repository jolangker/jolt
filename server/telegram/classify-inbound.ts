import { IMAGE_MIME_TYPES, isImageFileName, mimeFromImageFileName } from './image-mime'
import type { InboundMessage } from './normalize-message'

/** Minimal Telegram message shape used for intake classification (no grammy dependency). */
export type TelegramMessageLike = {
  text?: string
  caption?: string
  media_group_id?: string
  voice?: { file_id: string, mime_type?: string }
  photo?: Array<{ file_id: string }>
  document?: {
    file_id: string
    mime_type?: string
    file_name?: string
  }
  date: number
}

export type ClassifiedInbound
  = | { kind: 'text', text: string }
    | { kind: 'voice', fileId: string, mimeType: string }
    | {
      kind: 'image'
      fileId: string
      mimeType: string
      caption?: string
      messageDate: Date
    }
    | { kind: 'album' }
    | { kind: 'pdf' }
    | { kind: 'unsupported' }

function isPdfDocument(doc: NonNullable<TelegramMessageLike['document']>): boolean {
  const mime = doc.mime_type?.toLowerCase() ?? ''
  const name = doc.file_name?.toLowerCase() ?? ''
  return mime === 'application/pdf' || name.endsWith('.pdf')
}

function isImageDocument(doc: NonNullable<TelegramMessageLike['document']>): boolean {
  const mime = doc.mime_type?.toLowerCase() ?? ''
  if (IMAGE_MIME_TYPES.has(mime)) return true
  return isImageFileName(doc.file_name)
}

/**
 * Classify a Telegram message into an intake kind before download / normalization.
 * Pure: no I/O.
 */
export function classifyInbound(message: TelegramMessageLike): ClassifiedInbound {
  if (message.media_group_id) {
    return { kind: 'album' }
  }

  if (message.voice) {
    return {
      kind: 'voice',
      fileId: message.voice.file_id,
      mimeType: message.voice.mime_type || 'audio/ogg',
    }
  }

  if (message.photo && message.photo.length > 0) {
    const largest = message.photo[message.photo.length - 1]!
    return {
      kind: 'image',
      fileId: largest.file_id,
      mimeType: 'image/jpeg',
      caption: message.caption,
      messageDate: new Date(message.date * 1000),
    }
  }

  if (message.document) {
    if (isPdfDocument(message.document)) {
      return { kind: 'pdf' }
    }
    if (isImageDocument(message.document)) {
      const mime = message.document.mime_type
        || mimeFromImageFileName(message.document.file_name)
        || 'image/jpeg'
      return {
        kind: 'image',
        fileId: message.document.file_id,
        mimeType: mime,
        caption: message.caption,
        messageDate: new Date(message.date * 1000),
      }
    }
    return { kind: 'unsupported' }
  }

  if (message.text !== undefined) {
    return { kind: 'text', text: message.text }
  }

  return { kind: 'unsupported' }
}

/** Build a normalize-ready InboundMessage once media bytes (if any) are downloaded. */
export function toInboundMessage(
  classified: ClassifiedInbound,
  media?: { bytes: Uint8Array },
): InboundMessage {
  switch (classified.kind) {
    case 'text':
      return { kind: 'text', text: classified.text }
    case 'voice':
      if (!media) throw new Error('voice media bytes required')
      return { kind: 'voice', audio: media.bytes, mimeType: classified.mimeType }
    case 'image':
      if (!media) throw new Error('image media bytes required')
      return {
        kind: 'image',
        image: media.bytes,
        mimeType: classified.mimeType,
        caption: classified.caption,
        messageDate: classified.messageDate,
      }
    case 'album':
      return { kind: 'album' }
    case 'pdf':
      return { kind: 'pdf' }
    case 'unsupported':
      return { kind: 'unsupported' }
  }
}
