# 0001-replace-n8n-with-in-process-telegram-agent

We are replacing the external n8n workflow that parses Telegram messages into transactions with a GrammY-based Telegram bot that runs in the same Nitro process as the Jolt server. The LLM is a tool-calling agent (Vercel AI SDK) that invokes the existing service layer directly. Updates are delivered via a public HTTPS webhook handled by a Nitro route; the reverse proxy in front of Jolt terminates TLS. The `x-api-key` / `x-telegram-user-*` external auth path is removed; the in-process agent calls services in-process with the resolved `userId`.

The `n8n` workflow was a useful prototype but is now an extra moving part: a separate runtime, a separate auth path, a JSON-blob hand-off at the API boundary, and no ability to take multi-step actions (corrections, follow-ups). An in-process agent is fewer deploys, has a typed tool surface against the same services the dashboard uses, and keeps multi-tenant isolation intact (the agent resolves `telegramUserId` → `userId` once, then passes it to every service call).

We chose big-bang cutover over a dry-run mode for simplicity; the blast radius is a personal-finance tracker for one user, and a misbehaving tool call is recoverable via `db:script.ts`.

## Scope

In scope: `server/telegram/`, `server/agent/`, `server/api/telegram/`, `server/plugins/telegram.ts`, package.json, .env.example, CONTEXT.md, this ADR. Out of scope: dashboard pages, login flow, Excel export, analytics, existing transaction/category API routes.

The n8n auth path is removed in the same change: the `x-api-key` branch in `server/middleware/auth.ts` and the `APP_SECRET` env var are deleted. After migration, `event.context.auth` is set only from the web session.

## Tool surface

The agent exposes 8 tools: `add_transaction`, `update_transaction`, `delete_transaction`, `list_transactions`, `get_summary`, `get_categories`, `create_category`, `get_user_info`. Destructive tools (update, delete) are invoked without a confirmation step — the LLM is trusted to resolve the right row, and the user can re-add or correct via the dashboard if it misfires.
