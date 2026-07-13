# Jolt

The web dashboard, REST API, and Telegram intake for an AI-assisted personal finance tracker. Users log transactions by chatting with a Telegram bot; the bot runs a tool-calling LLM agent inside the same Nuxt process; the agent invokes the same services that serve the dashboard.

## Language

**Telegram Adapter**:
The Telegram-side of the system: a GrammY bot that receives user messages and routes them to the Agent. Translates Telegram `Update`s into the Agent's input and translates Agent output into Telegram `sendMessage` calls. Receives updates via a webhook at `/api/telegram/webhook`.
_Avoid_: bot, Telegram bot, Telegram worker, Telegram integration

**Agent**:
The LLM-driven component that interprets a user's message and decides which Tool to invoke. Runs in the same Node process as Nitro. Stateless across restarts; per-chat memory is windowed to the last N turns and dropped after 30 minutes of inactivity.
_Avoid_: assistant, LLM, brain, intent classifier

**Tool**:
A typed function the Agent can invoke. Each Tool wraps an existing service method (e.g. `add_transaction` wraps `transactionService.create`) and exposes a Zod schema describing its inputs to the LLM. Tools are the only way the Agent can mutate state.
_Avoid_: function, command, action, capability

**Message**:
A single inbound user message from Telegram, normalized into `{ text, telegramUserId, telegramChatId, messageId }`. The Agent's input. A single Message can produce zero or more Tool calls.
_Avoid_: prompt, request, query, command

**Transaction**:
A dated, categorized record of money in or out. Has a `type` (`expense` | `income`), an `amount`, a `categoryId`, a free-form `note`, and a `date`. Persisted to the `transactions` table.
_Avoid_: expense record, income record, entry, log

**Category**:
A label that classifies a Transaction. Has a `type` (`expense` | `income`), a `name`, and an optional `icon`. Two flavors exist: global default categories (`isDefault = true`, shared across all users) and per-user custom categories. The Agent's effective category list is the union of both.
_Avoid_: tag, label, bucket

**User**:
A person who uses Jolt. Identified internally by `users.id` (uuid) and externally by `telegramUserId`. A Telegram user becomes a Jolt User the first time they send any message; no explicit signup step.
_Avoid_: account, member, customer
