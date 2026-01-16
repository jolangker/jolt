# AGENTS.md

This file guides agentic coding agents working in the Jolt repository.

## Essential Commands

**Development & Building:**
- `bun dev` - Start development server (http://localhost:3000)
- `bun build` - Build for production
- `bun preview` - Preview production build

**Code Quality:**
- `bun lint` - Run ESLint
- `bun lint:fix` - Fix ESLint issues automatically
- `bun typecheck` - Run TypeScript type checking

**Database Operations:**
- `bun run db:generate` - Generate Drizzle migrations from schema changes
- `bun run db:migrate` - Apply pending migrations to database
- `bun run db:script` - Run custom database scripts (uses tsx)

**Testing:** No test framework is currently configured. Add tests only if explicitly requested.

**Quality Gate:** Always run `bun typecheck` and `bun lint` before committing changes.

## Code Style Guidelines

### File Naming
- Backend files: kebab-case (`transaction.service.ts`, `user.repository.ts`)
- Vue components: PascalCase (`TransactionCard.vue`, `CategoryModal.vue`)
- API routes: Nitro file-based naming (`server/api/transactions/index.get.ts`)

### Imports
- Use `~~/` alias for absolute imports from project root
- Group imports: external libraries first, then internal imports
- Import services/repositories from barrel files: `~~/server/services`, `~~/server/repositories`
- Import schemas from barrel file: `~~/server/db/schema`
- Never import directly from `~~/server/db/schemas/*`

### Formatting
- ESLint with stylistic rules enabled - use `bun lint:fix` to auto-fix
- No Prettier (ESLint handles formatting)
- Indentation: 2 spaces

### Types
- TypeScript strict mode enabled
- Define types in `shared/types/` when shared between frontend/backend
- Use Drizzle Zod schemas for validation via `drizzle-zod`
- Use Zod for custom validation in API routes
- Infer types from Zod schemas: `type TransactionPayload = z.infer<typeof transactionInsertSchema>`

### Naming Conventions
- Variables/Functions: camelCase
- Interfaces/Types: PascalCase
- Database tables: lowercase plural (`users`, `transactions`)
- Database columns: camelCase (`userId`, `createdAt`)
- Enums: PascalCase with underscore separators (`category_type` enum, `categoryTypeEnum`)

### Error Handling
- Use `createError({ statusCode, statusMessage })` from Nuxt
- Common status codes: 401 (unauthorized), 403 (forbidden/PRO), 404 (not found), 402 (upgrade required)
- Return standardized API responses: `{ success: true, data: {...} }`

### Database Operations
- Use Drizzle ORM with the `db` instance from `server/utils/db.ts`
- Define relations in `server/db/schemas/*.ts`
- Use `with` for loading relations in queries
- Check `deletedAt` is null for soft deletes (transactions, categories)
- Use Drizzle operators: `eq`, `and`, `gte`, `lte`, `ilike`, `inArray`, `isNull`

### Architecture Patterns

**Three-Layer Backend:**
1. API Routes (`server/api/`) - HTTP handlers, minimal logic
2. Services (`server/services/`) - Business logic, orchestration
3. Repositories (`server/repositories/`) - Database operations

**API Routes:**
- Follow Nitro file-based routing: `server/api/transactions/index.get.ts`
- Validate bodies with `readValidatedBody(event, schema.parse)`
- Extract user info from `event.context.auth`
- Call service functions, return directly

**Services:**
- Export object with async methods: `export const transactionService = { async create(...) { ... } }`
- Implement business logic and tier-based restrictions
- Call repository functions for data access
- Return standardized response objects

**Repositories:**
- Export object with async methods for database operations
- Use Drizzle query builder
- Build filters with helper functions
- Implement CRUD operations: findMany, findById, create, update, delete

**Vue Components:**
- Use `<script setup lang="ts">` syntax
- Prefer composables over Options API
- Use Nuxt UI components as base (UCard, UButton, UModal, etc.)
- Use Nuxt UI overlay system for modals: `useOverlay().create(LazyModalComponent)`
- Export components as `#components` for lazy loading

**Composables:**
- Prefix with `use`: `useAuth`, `useTransaction`
- Return reactive state and functions
- Leverage VueUse composables

### Authentication
- Web routes use session-based auth via `nuxt-auth-utils`
- Bot routes use HMAC-SHA256 signed requests (headers: x-phone-number, x-timestamp, x-signature)
- Middleware in `server/middleware/auth.ts` adds `event.context.auth` with: `{ userId, source, tier, isNewUser }`
- All `/api/*` routes require auth except `/api/auth/*`, `/api/master/*`, `/api/webhooks/*`
- Check user tier: `const { tier } = event.context.auth`

### PRO Subscription
- Upgrade users via `event.context.auth.tier === 'PRO'` check
- Use 402 status code for upgrade-required errors
- Subscription expires automatically (checked in middleware)
- Tier affects: history access (7 days for FREE), analytics period, custom categories

### Component Organization
- `app/components/analytic/` - Chart components (Daily, Category, Monthly)
- `app/components/` - Shared components (TransactionCard, modals, etc.)
- Pages in `app/pages/` - File-based routing

### Environment Variables
Required in `.env`:
```
DATABASE_URL=postgresql://...
NUXT_SESSION_PASSWORD=minimum_32_characters
APP_SECRET=used_for_HMAC_signatures
APP_BASE_URL=https://your-domain.com
```

Optional:
```
NUXT_OPENAI_API_KEY=sk-...
MIDTRANS_SERVER_KEY=...
```

### Code Comments
- Add comments only when necessary to explain complex logic
- No comments for obvious code
- Use TypeScript types for self-documenting code

### SQL Queries
- Prefer Drizzle query builder over raw SQL
- Use `sql``` template tags only for complex queries (count, sum, etc.)
- Always parameterize queries (Drizzle handles this automatically)
