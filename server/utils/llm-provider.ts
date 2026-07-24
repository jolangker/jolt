import { createOpenAICompatible } from '@ai-sdk/openai-compatible'

/**
 * 9router (and some OpenAI-compatible proxies) default chat/completions to SSE
 * (`text/event-stream`) when `stream` is omitted. AI SDK generateText expects
 * a JSON body for non-stream calls and throws AI_JSONParseError on SSE.
 * Always force stream:false on the wire.
 */
export function createJoltLlmProvider(name = 'jolt-llm') {
  const baseURL = process.env.LLM_BASE_URL
  const apiKey = process.env.LLM_API_KEY

  if (!baseURL || !apiKey) {
    throw new Error('LLM_BASE_URL and LLM_API_KEY are required')
  }

  return createOpenAICompatible({
    name,
    baseURL,
    apiKey,
    transformRequestBody: (body) => ({
      ...body,
      stream: false,
    }),
  })
}
