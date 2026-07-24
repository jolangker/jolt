import { generateText } from 'ai'
import type { ReceiptExtractionResult } from './normalize-message'
import { createJoltLlmProvider } from '~~/server/utils/llm-provider'

export type ExtractReceiptInput = {
  image: Uint8Array
  mimeType: string
  caption?: string
  messageDate: Date
}

export type VisionCallInput = {
  image: Uint8Array
  mimeType: string
  caption?: string
  messageDateLabel: string
}

export type VisionCallResult
  = | { ok: true, text: string }
    | { ok: false, reason: string }

export type ExtractReceiptDeps = {
  callVision: (input: VisionCallInput) => Promise<VisionCallResult>
}

const SOFT_REFUSAL
  = 'This image does not look like Money Evidence (receipt or transfer screenshot). Please send a clearer photo or type the transaction.'

const EXTRACTION_PROMPT = `You extract Money Evidence facts from a single image for a personal finance bot.

Rules:
1. Prefer merchant receipts and transfer/bank screenshots. If the image is not Money Evidence, reply with exactly:
${SOFT_REFUSAL}
2. Output plain text only. No markdown.
3. One goods/services line per item. Drop pure TOTAL/subtotal/tax-only lines that would double-count.
4. Do not assign Categories. Do not invent Tool calls.
5. Date: use the printed receipt/transfer date when readable; otherwise use the Message date given below. A user caption may override date, note, or intent.
6. Default currency is IDR. Keep amounts as numbers without currency symbols when possible.
7. For a transfer/bank screenshot with a clear amount, produce a single line with amount and a short note.
8. Start with a short header that this is Receipt Extraction / Money Evidence facts, then Date, then numbered lines:
   N. <note or item> — <amount>

Message date (fallback): {{MESSAGE_DATE}}
User caption (optional steering): {{CAPTION}}`

export function formatMessageDate(date: Date): string {
  if (Number.isNaN(date.getTime())) {
    throw new Error('Receipt Extraction message date must be a valid Date')
  }
  return date.toISOString().slice(0, 10)
}

export async function executeExtractReceipt(
  input: ExtractReceiptInput,
  deps: ExtractReceiptDeps,
): Promise<ReceiptExtractionResult> {
  const result = await deps.callVision({
    image: input.image,
    mimeType: input.mimeType,
    caption: input.caption,
    messageDateLabel: formatMessageDate(input.messageDate),
  })

  if (!result.ok) {
    return { ok: false, reason: result.reason }
  }

  const text = result.text.trim()
  if (!text) {
    return { ok: false, reason: 'empty-extraction' }
  }

  return { ok: true, text }
}

function buildPrompt(messageDateLabel: string, caption?: string): string {
  return EXTRACTION_PROMPT
    .replace('{{MESSAGE_DATE}}', messageDateLabel)
    .replace('{{CAPTION}}', caption?.trim() ? caption.trim() : '(none)')
}

export async function openAiCompatibleVision(input: VisionCallInput): Promise<VisionCallResult> {
  const baseURL = process.env.LLM_BASE_URL
  const apiKey = process.env.LLM_API_KEY
  const modelId = process.env.VISION_MODEL || process.env.LLM_VISION_MODEL || process.env.LLM_MODEL

  if (!baseURL || !apiKey || !modelId) {
    return { ok: false, reason: 'vision-not-configured' }
  }

  try {
    const provider = createJoltLlmProvider('jolt-vision')

    const result = await generateText({
      model: provider.chatModel(modelId),
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildPrompt(input.messageDateLabel, input.caption) },
            {
              type: 'file',
              mediaType: input.mimeType.startsWith('image/') ? input.mimeType : 'image/jpeg',
              data: input.image,
            },
          ],
        },
      ],
    })

    return { ok: true, text: result.text ?? '' }
  }
  catch {
    return { ok: false, reason: 'provider-error' }
  }
}

export async function extractReceipt(input: ExtractReceiptInput): Promise<ReceiptExtractionResult> {
  return executeExtractReceipt(input, { callVision: openAiCompatibleVision })
}
