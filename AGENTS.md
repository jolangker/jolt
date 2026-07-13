# AGENTS.md

## Project Overview

**Jolt** is the web dashboard component of an AI-powered personal finance tracking system. Users log expenses/income by chatting with a Telegram bot; an n8n workflow uses AI to extract and categorize the data into PostgreSQL; this Nuxt 4 dashboard provides visualization, analytics, and transaction management.

The dashboard is a **SPA** (`ssr: false`) with a Nuxt server backend providing REST API endpoints. The backend follows a strict **Service-Repository pattern**:

```
API Routes (server/api/)        → Validation & orchestration only
    ↓
Services (server/services/)     → Business logic
    ↓
Repositories (server/repositories/) → Data access (Drizzle ORM)
    ↓
Database (PostgreSQL via Neon)
```

### Tech Stack

- **Framework**: Nuxt 4 (Vue 3, TypeScript)
- **UI**: Nuxt UI v4 + Tailwind CSS (primary color: yellow)
- **Charts**: Unovis (`@unovis/ts`, `@unovis/vue`)
- **Icons**: Iconify — Solar, Lucide, Simple Icons
- **ORM**: Drizzle ORM (PostgreSQL dialect, Neon serverless driver)
- **Validation**: Zod + drizzle-zod (insert schemas auto-derived from table definitions)
- **Auth**: nuxt-auth-utils (Telegram token-based login, session cookies)
- **Export**: ExcelJS
- **Package Manager**: Bun
- **Linting**: ESLint with `@nuxt/eslint` (stylistic mode enabled)

## Setup Commands

```bash
# Install dependencies
bun install

# Copy environment template and fill in values
cp .env.example .env

# Generate Drizzle migration files after schema changes
bun run db:generate

# Apply pending migrations to the database
bun run db:migrate

# Run ad-hoc database scripts (seeding, data fixes)
bun run db:script
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `APP_SECRET` | Yes | Shared secret for n8n API authentication (`x-api-key` header) |
| `APP_BASE_URL` | Yes | Base URL for generating login links (e.g. `http://localhost:3000`) |
| `NUXT_SESSION_PASSWORD` | Yes | Session encryption key for n8n auth-utils |
| `NUXT_PUBLIC_APP_URL` | Yes | Public app URL |

## Development Workflow

```bash
# Start dev server (http://localhost:3000)
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview

# Lint (check)
bun run lint

# Lint (auto-fix)
bun run lint:fix

# Type-check (uses vue-tsc via nuxt typecheck)
bun run typecheck
```

**Always run `bun run lint` and `bun run typecheck` before committing.**

### Nuxt Directory Structure

Nuxt 4 uses a new directory layout where app code lives in `app/`:

```
app/
├── app.vue                    # Root component (UApp + NuxtLayout + NuxtPage)
├── app.config.ts              # Nuxt UI theme config (primary: yellow)
├── assets/css/main.css        # Tailwind + Nuxt UI imports, Unovis CSS vars
├── components/                # Vue components (auto-imported)
│   └── analytic/              # Chart components (CategoryChart, DailyChart, MonthlyChart)
├── layouts/
│   └── authenticated.vue      # Layout for logged-in pages (UDashboardGroup + BottomNav)
├── middleware/
│   └── auth.ts                # Client-side route guard (redirects to /unauthorized)
├── pages/                     # File-based routes
│   ├── index.vue              # Dashboard (net balance, income/expense cards, recent transactions)
│   ├── transactions.vue       # Transaction list with infinite scroll, search, filters
│   ├── analytics.vue          # Charts (daily, category breakdown, monthly)
│   ├── categories.vue         # Custom category management
│   ├── login.vue              # Token-based login page
│   ├── profile.vue            # User profile and logout
│   └── unauthorized.vue       # Shown when not authenticated
└── utils/
    └── formatter.ts           # formatCurrency (IDR locale)

server/
├── api/                       # Nitro file-based API routes
│   ├── auth/                  # request-login-token.post.ts, login-with-token.post.ts
│   ├── transactions/         # CRUD + export.get.ts, summary.get.ts
│   ├── analytics/             # daily.get.ts, categories-breakdown.get.ts, summary.get.ts
│   ├── categories/            # CRUD for custom categories
│   ├── master/                # Public endpoints (no auth): categories.get.ts
│   └── icons.get.ts           # Returns available Solar outline icons
├── db/
│   ├── schema.ts              # Barrel export of all schemas
│   ├── schemas/               # Drizzle table definitions (users, transactions, expenses)
│   ├── migrations/            # Generated SQL migration files
│   └── script.ts              # Ad-hoc DB script runner
├── middleware/
│   └── auth.ts                # Server auth middleware (web session OR n8n API key)
├── repositories/              # Data access layer (Drizzle queries)
│   └── index.ts               # Barrel export
├── services/                  # Business logic layer
│   └── index.ts               # Barrel export
└── utils/
    ├── db.ts                  # Drizzle instance (Neon serverless)
    └── token.ts               # generateShortToken (crypto-based)

shared/
├── types/                     # Types shared between app and server
│   ├── index.d.ts             # Category, Transaction (inferred from Drizzle schema)
│   ├── transaction.d.ts       # TransactionPayload (inferred from Zod insert schema)
│   └── auth.d.ts              # Augments #auth-utils User module
└── utils/
    └── dayjs.ts               # formatDate helper + re-exports dayjs
```

## Testing Instructions

There is currently **no test framework configured**. No test dependencies or test files exist in the project. If adding tests in the future, integrate with the existing Bun toolchain.

## Code Style

### ESLint Configuration

- Uses `@nuxt/eslint` with **stylistic mode** enabled (enforces formatting rules like arrow parens, spacing).
- `@typescript-eslint/ban-ts-comment` is **off** — `@ts-ignore` comments are allowed.
- Config: `eslint.config.mjs`

### TypeScript

- Import aliases: `~~/` maps to project root, `~/` maps to `app/`.
- Types are inferred from Drizzle schema via `$inferSelect` / `$inferInsert` (see `shared/types/index.d.ts`).
- Type-check command: `bun run typecheck` (runs `nuxt typecheck` which uses `vue-tsc`).

### Vue Components

- Use `<script setup lang="ts">` in all SFCs.
- Nuxt UI components are auto-imported and prefixed with `U` (e.g. `UCard`, `UButton`, `UInput`, `UDashboardPanel`, `UEmpty`).
- Custom components are auto-imported (no manual import needed in pages/components).
- Use `Lazy` prefix for on-demand component loading in overlays (e.g. `LazyTransactionForm`).
- Overlays/modals use `useOverlay()` from Nuxt UI.
- Page metadata via `definePageMeta({ middleware, layout })`.

### Backend Patterns

**API Routes** (`server/api/`):
- Use `defineEventHandler` for all handlers.
- Validate query params with `getValidatedQuery(event, zodSchema.parse)`.
- Validate request body with `readValidatedBody(event, zodSchema.parse)`.
- Access authenticated user via `event.context.auth.userId`.
- API responses follow the shape `{ success: true, data: T }` or `{ success: true, data: T[], meta: { count, total } }`.
- Throw errors with `createError({ statusCode, statusMessage })`.

**Services** (`server/services/`):
- Exported as plain objects with async methods (not classes).
- Each service receives `userId` as the first argument for multi-tenant isolation.
- Barrel-exported from `server/services/index.ts`.

**Repositories** (`server/repositories/`):
- Exported as plain objects with async methods.
- Each repository receives `userId` as the first argument.
- Use Drizzle's relational query API (`db.query.table.findMany/findFirst`) with `where` conditions.
- Use `and()`, `eq()`, `gte()`, `lte()`, `ilike()`, `inArray()` for filter building.
- Barrel-exported from `server/repositories/index.ts`.

**Database Schema** (`server/db/schemas/`):
- Drizzle `pgTable` definitions.
- Insert schemas auto-derived with `createInsertSchema()` from `drizzle-zod`.
- Relations defined with `relations()` for relational queries.
- All schemas barrel-exported from `server/db/schema.ts`.

### Naming Conventions

- Files: `kebab-case.ts` for server, `PascalCase.vue` for components, `kebab-case.vue` for pages.
- API route files: `[name].[method].ts` (e.g. `index.get.ts`, `[id].put.ts`).
- Database columns: camelCase in code (mapped from snake_case via Drizzle).
- CSS: Tailwind utility classes; Nuxt UI design tokens (`text-primary`, `text-error`, `text-success`, `text-dimmed`, `text-highlighted`).

### Currency

All amounts are in **Indonesian Rupiah (IDR)**. Use `formatCurrency()` from `app/utils/formatter.ts` for display.

## Authentication

The app supports two authentication paths, handled by `server/middleware/auth.ts`:

1. **Web (session-based)**: Uses `nuxt-auth-utils`. Users get a login token via Telegram, visit `/login?t=<token>`, and the server creates an HTTP-only session cookie. Access via `getUserSession(event)`.

2. **External API (n8n)**: Requests with `x-api-key: <APP_SECRET>`, `x-telegram-user-id`, and `x-telegram-username` headers. The middleware auto-creates users if they don't exist. Access via header inspection.

Both paths set `event.context.auth = { userId, source }` for downstream handlers.

**Public endpoints** (no auth required): `/api/auth/**`, `/api/master/**`.

Client-side route guard: `app/middleware/auth.ts` redirects unauthenticated users to `/unauthorized`.

## Build and Deployment

### Local Build

```bash
bun run build        # Output: .output/
```

### Docker

```bash
# Build Docker image
bun run docker:build    # Builds: jolleyx/jolt:latest

# Push to Docker Hub
bun run docker:push
```

The Dockerfile uses `oven/bun` as both build and production runtime. The production image serves the Nuxt output via `bun .output/server/index.mjs` on port 3000.

### CI/CD

GitHub Actions workflow: `.github/workflows/deploy.yml`

- **Trigger**: Push to `main` or `master` branch.
- **Build**: Builds Docker image, pushes to Docker Hub as `jolleyx/jolt:latest` and `jolleyx/jolt:<commit-sha>`.
- **Deploy**: SSH into VPS, runs `docker compose pull && docker compose up -d`.

### Docker Compose

`compose.yaml` defines a single `jolt` service using the `jolleyx/jolt:latest` image, exposing port 3000, with `.env` file injection.

## Database Migrations

Migrations are managed by Drizzle Kit. Schema source: `server/db/schemas/`.

```bash
# After changing schema in server/db/schemas/*.ts:
bun run db:generate    # Creates new SQL migration in server/db/migrations/

# Apply migrations:
bun run db:migrate     # Runs pending migrations
```

Configuration: `drizzle.config.ts` (dialect: `postgresql`, uses `DATABASE_URL`).

## Pull Request Guidelines

- Run `bun run lint` and `bun run typecheck` before committing — both must pass.
- Follow the existing Service-Repository pattern when adding API features.
- Always add Zod validation for new API query/body parameters.
- Use Nuxt UI components (`U`-prefixed) for all new UI work.
- Use Tailwind utility classes and Nuxt UI design tokens for styling.
- Add or update schemas in `server/db/schemas/` and run `bun run db:generate` for any database changes.
- Keep API response shapes consistent with the existing `{ success, data, meta? }` convention.

## Additional Notes

- The `expenses` table in `server/db/schemas/expenses.ts` is a **legacy table** kept for backward compatibility. New features should use the `transactions` table.
- `app.config.ts` sets the Nuxt UI primary color to `yellow` and configures dashboard panel styling.
- `app/assets/css/main.css` configures Tailwind, Nuxt UI theme, Poppins font, and Unovis CSS variables for theming.
- The `.npmrc` file sets `shamefully-hoist=true` for compatibility.
- The `server/db/script.ts` file is used for one-off database operations (seeding, data migrations) — run with `bun run db:script`.
- Unovis charts use CSS variables defined in `main.css` to integrate with the Nuxt UI theme.
