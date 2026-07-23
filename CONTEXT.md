# Jolt

The web dashboard, REST API, and Telegram intake for an AI-assisted personal finance tracker. Users log Transactions by chatting with the Telegram Adapter (text, voice, or single-image Money Evidence); the Agent runs in-process with tool-calling against the same services that serve the dashboard.

## Language

**Telegram Adapter**:
The Telegram-side of the system: receives user Messages, owns Voice Transcription and Receipt Extraction so the Agent only ever sees text, and delivers Agent replies. Hard intake failures (unsupported media, transcription unavailable) are answered here without calling the Agent. Receives updates via a webhook at `/api/telegram/webhook`.
_Avoid_: bot, Telegram bot, Telegram worker, Telegram integration

**Agent**:
The LLM-driven component that interprets a text Message and decides which Tool to invoke. Builds Transaction Proposals from Receipt Extraction facts. Never receives raw image or audio bytes. Stateless across restarts; per-chat memory is windowed to the last N turns and dropped after 30 minutes of inactivity.
_Avoid_: assistant, LLM, brain, intent classifier

**Tool**:
A typed function the Agent can invoke. Each Tool wraps an existing service method (e.g. `add_transaction` wraps `transactionService.create`) and exposes a Zod schema describing its inputs to the LLM. Tools are the only way the Agent can mutate state.
_Avoid_: function, command, action, capability

**Message**:
A single inbound user utterance from Telegram: text, a single photo or image file with optional caption, or voice. Always normalized to text before the Agent runs. Multi-image albums and PDFs are not accepted.
_Avoid_: prompt, request, query, command

**Voice Transcription**:
Turning a voice Message into text for the Agent. Input only — does not create Transactions. Original audio is not kept. Hard failures stay with the Telegram Adapter.
_Avoid_: speech-to-text job, audio message, voice note entity

**Money Evidence**:
Single-image content from which amount and note facts can be taken — merchant receipts and transfer/bank screenshots. Not every image is Money Evidence.
_Avoid_: image attachment, media, screenshot (as a domain term)

**Receipt Extraction**:
Telegram Adapter process that turns a single-image Message into text facts for the Agent: line amounts, notes, merchant, and date. One candidate line per goods/services item (no pure TOTAL/subtotal lines). Does not assign Categories or create Transactions. Original image is not kept.
_Avoid_: OCR job, receipt scan, invoice parse, receipt entity

**Transaction Proposal**:
Not-yet-persisted candidate Transactions the Agent builds from Receipt Extraction facts, with a Category guess per line and default type expense unless income is clear. Shown in natural language for confirm/edit/cancel before any Tool runs. Lives only in conversation memory.
_Avoid_: draft transaction, pending transaction, staged entry, receipt

**Transaction**:
A dated, categorized record of money in or out. Has a `type` (`expense` | `income`), an `amount`, a `categoryId`, a free-form `note`, and a `date`. Persisted to the `transactions` table.
_Avoid_: expense record, income record, entry, log

**Category**:
A label that classifies a Transaction. Has a `type` (`expense` | `income`), a `name`, and an optional `icon`. Two flavors exist: global default categories (`isDefault = true`, shared across all users) and per-user custom categories. The Agent's effective category list is the union of both.
_Avoid_: tag, label, bucket

**User**:
A person who uses Jolt. Identified internally by `users.id` (uuid); each Telegram user ID identifies exactly one User. A Telegram user becomes a Jolt User the first time they send any Message; no explicit signup step.
_Avoid_: account, member, customer

**Dashboard Access Link**:
A short-lived, single-use URL that a User receives through the Telegram Adapter to establish access to the web dashboard. Possession of the link is the authentication proof.
_Avoid_: magic link, login token, dashboard URL

**Dashboard Request**:
An explicit request from a User to access the web dashboard, made either in natural language to the Agent or with the `/dashboard` Telegram command.
_Avoid_: login request, token request
