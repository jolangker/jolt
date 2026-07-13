import { generateText, isStepCount } from 'ai'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import {
  createAddTransactionTool,
  createUpdateTransactionTool,
  createDeleteTransactionTool,
  createListTransactionsTool,
  createGetSummaryTool,
  createGetCategoriesTool,
  createCreateCategoryTool,
  createGetUserInfoTool,
} from './tools'
import { getTurns, addTurn } from './memory'

const SYSTEM_PROMPT = `You are Jolt, a personal finance assistant bot. You help users track their expenses and income via Telegram.

## Capabilities
- Record expenses and income transactions
- Update or delete existing transactions
- List and search transactions
- Generate spending summaries
- Manage categories

## Rules
1. Always respond in the user's language. If they write in Indonesian (Bahasa Indonesia), respond in Indonesian. If in English, respond in English.
2. When the user says "25rb" or "25k", interpret as 25000 IDR. "1jt" or "1jt" = 1000000 IDR.
3. When the user says "yesterday", "last Friday", "2 days ago", etc., convert to an actual YYYY-MM-DD date.
4. Always use get_categories first before adding a transaction to find the correct categoryId.
5. For ambiguous requests (e.g., "the bakso one" when there are multiple matches), ask for clarification before taking destructive actions.
6. After a successful action, confirm what you did in natural language.
7. If you encounter an error, explain it simply and suggest what the user can try.
8. You can chain multiple tool calls in one turn (e.g., create a category AND log a transaction under it).
9. Default transaction type is "expense" unless the user clearly indicates income (e.g., "received salary", "got paid").
10. Today's date is used as default when no date is specified.

## Response Format
- MUST respond in plain text only. No markdown formatting.
- Do NOT use bold, italic, headers, bullet points with dashes/asterisks, or any other markdown syntax.
- Use line breaks and simple text for structure.
- For lists, use numbers or simple line breaks without bullets.

## Tool Usage
- Use get_categories to see available categories before recording transactions.
- Use get_user_info to check user context if needed.
- When updating/deleting by description, if multiple matches are found, list them and ask which one.
- For spending questions, use get_summary with appropriate date filters.`

const provider = createOpenAICompatible({
  name: 'jolt-llm',
  baseURL: process.env.LLM_BASE_URL!,
  apiKey: process.env.LLM_API_KEY!,
})

export async function runAgent(chatId: string, userId: string, message: string): Promise<string> {
  const model = provider.chatModel(process.env.LLM_MODEL!)

  const tools = {
    add_transaction: createAddTransactionTool(userId),
    update_transaction: createUpdateTransactionTool(userId),
    delete_transaction: createDeleteTransactionTool(userId),
    list_transactions: createListTransactionsTool(userId),
    get_summary: createGetSummaryTool(userId),
    get_categories: createGetCategoriesTool(userId),
    create_category: createCreateCategoryTool(userId),
    get_user_info: createGetUserInfoTool(userId),
  }

  const history = getTurns(chatId)

  const messages = [
    ...history.map(t => ({ role: t.role as 'user' | 'assistant', content: t.content })),
    { role: 'user' as const, content: message },
  ]

  try {
    const result = await generateText({
      model,
      system: SYSTEM_PROMPT,
      messages,
      tools,
      stopWhen: isStepCount(10),
    })

    const reply = result.text || 'Done!'

    addTurn(chatId, { role: 'user', content: message })
    addTurn(chatId, { role: 'assistant', content: reply })

    return reply
  }
  catch (error) {
    console.error('[agent] Error:', error)
    return 'Sorry, I couldn\'t process that. Please try again.'
  }
}
