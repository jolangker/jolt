# Authenticate dashboard access with Telegram-issued Dashboard Access Links

Dashboard access is authorized only from the User's private Telegram interaction: a natural-language Dashboard Request invokes an Agent Tool, while `/dashboard` is handled directly by the Telegram Adapter. Both paths use the same service and privately deliver a preview-free Dashboard Access Link; no public HTTP endpoint may create one, and one Telegram ID identifies exactly one User.

The link carries a 256-bit bearer code in its `t` query parameter, expires after five minutes, is superseded by a newer unused link for that User, and is rate-limited to three requests per ten minutes. Jolt stores only its digest, redacts it from logs and Agent memory, retains lifecycle metadata for 30 days, and invalidates old-format links at deployment.

After an explicit browser confirmation, Jolt atomically consumes the link and creates a one-hour `HttpOnly`, production-`Secure`, `SameSite=Lax` session for the dashboard home page. Replays, expired links, and invalid links have one generic response; a browser already authenticated as another User must log out rather than switch accounts silently. Multiple concurrent sessions for the same User are allowed.
