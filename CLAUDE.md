# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Essential Commands
- `bun dev` - Start development server (http://localhost:3000)
- `bun build` - Build for production
- `bun lint` - Run ESLint
- `bun lint:fix` - Fix ESLint issues automatically
- `bun typecheck` - Run TypeScript type checking

### Database Operations
- `bun run db:generate` - Generate Drizzle migrations from schema changes
- `bun run db:migrate` - Apply pending migrations to database
- `bun run db:script` - Run custom database scripts (uses tsx)

### Deployment
- `bun run docker:build` - Build Docker image
- `bun run docker:push` - Push image to registry
- Production uses Docker with `compose.yaml` for deployment

## Architecture Overview

Jolt is a **personal finance dashboard** that integrates with a **WhatsApp bot** (via n8n) for transaction tracking. Users can log expenses through conversational messages and view analytics on the web dashboard.

### System Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  WhatsApp Bot   │ ───▶ │  n8n Workflow   │ ───▶ │  Web Dashboard  │
│  (Primary UI)   │      │  (AI Engine)    │      │  (This Repo)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                         │
         └────────────────────────┴─────────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │   PostgreSQL   │
                          │    (Neon)      │
                          └────────────────┘
```

### Technology Stack

**Frontend:**
- Nuxt 4 with SSR disabled (SPA mode)
- Nuxt UI 4 (Tailwind CSS v4 components)
- Unovis for data visualization
- VueUse for composables

**Backend:**
- Nitro server (built into Nuxt)
- Drizzle ORM with Neon PostgreSQL (serverless)
- Zod + Valibot for validation
- nuxt-auth-utils for session management

### Code Organization

```
jolt/
├── app/                          # Frontend (Vue/Nuxt)
│   ├── pages/                    # File-based routing
│   └── components/               # Vue components
│
├── server/                       # Backend (Nitro)
│   ├── api/                      # API endpoints (file-based routing)
│   │   ├── transactions/         # Transaction CRUD
│   │   ├── analytics/            # Analytics & insights
│   │   ├── categories/           # Category management
│   │   ├── auth/                 # Authentication (OTP, token)
│   │   ├── payments/             # Midtrans integration
│   │   └── webhooks/             # External webhooks
│   │
│   ├── db/                       # Database layer
│   │   ├── schema.ts             # Schema exports
│   │   └── schemas/              # Drizzle table definitions
│   │
│   ├── repositories/             # Data access layer
│   │   └── *.repository.ts       # One per entity
│   │
│   ├── services/                 # Business logic layer
│   │   └── *.service.ts          # One per domain
│   │
│   ├── middleware/               # Server middleware
│   │   ├── auth.ts               # Authentication (web + n8n HMAC)
│   │   └── rate-limit.ts         # Rate limiting
│   │
│   └── utils/                    # Server utilities
│       ├── db.ts                 # Drizzle instance
│       ├── hmac.ts               # HMAC signature verification
│       ├── rate-limit.ts         # Rate limiting logic
│       └── token.ts              # Token generation
│
└── shared/                       # Shared types (if needed)
```

### Architecture Patterns

**Three-Layer Backend:**
1. **API Routes** (`server/api/`) - HTTP handlers, minimal logic
2. **Services** (`server/services/`) - Business logic, orchestration
3. **Repositories** (`server/repositories/`) - Database operations

**Authentication Methods:**
- **Web Dashboard:** Session-based via nuxt-auth-utils
- **n8n Bot:** HMAC-SHA256 signed requests (timestamp + phone number)
- **OTP Login:** WhatsApp OTP for direct dashboard access
- **Token Login:** One-time use tokens for bot-generated login links

**Rate Limiting:**
- Global: 100 requests/min per IP for all `/api/*` endpoints
- OTP: 10 requests/10min per IP, 3 requests/10min per phone number
- Verification: Max 3 attempts per OTP code

## Database Schema

**Core Tables:**
- `users` - User accounts with tier (FREE/PRO), subscription, voice quota
- `transactions` - Financial transactions with category references
- `categories` - User and default categories with soft deletes
- `user_tokens` - One-time login tokens for bot-generated links
- `otps` - OTP codes for WhatsApp login
- `payments` - Midtrans payment records
- `insights` - Cached AI-generated insights

**Key Relationships:**
- Transaction → Category (many-to-one)
- Transaction → User (many-to-one)
- Category → User (many-to-one, user-specific or default)

**Soft Deletes:** Both transactions and categories use `deletedAt` for soft deletion.

## Security Model

### n8n Bot Authentication
The WhatsApp bot (via n8n) sends requests with these headers:
```
x-phone-number: +62812...
x-timestamp: 1700000000000
x-signature: hmac-sha256(timestamp:phoneNumber, APP_SECRET)
```

Verification (server/middleware/auth.ts:33-61):
- Timestamp must be within 5 minutes
- Signature verified with timing-safe comparison
- User auto-created if not exists

### PRO Subscription
- Users upgrade via Midtrans payment gateway
- Webhook verifies SHA512 signature
- PRO status expires automatically (checked on each request)
- Tier affects: history access, analytics period, custom categories, voice quota

### Protected Routes
All `/api/*` routes require authentication EXCEPT:
- `/api/auth/*` - Login endpoints
- `/api/master/*` - Default categories
- `/api/webhooks/*` - External webhooks

## Key Implementation Details

### Environment Variables
Required in `.env`:
```
DATABASE_URL=postgresql://...
NUXT_SESSION_PASSWORD=minimum_32_characters
APP_SECRET=used_for_HMAC_signatures
APP_BASE_URL=https://your-domain.com

# Optional
NUXT_OPENAI_API_KEY=sk-...  # For AI insights
MIDTRANS_SERVER_KEY=...      # For payments
```

### File-Based Routing
- API routes follow Nitro conventions: `server/api/transactions/index.get.ts`
- Pages: `app/pages/index.vue`
- Middleware in `server/middleware/` runs on all matching routes

### Repository Pattern
Repositories export database access functions:
```typescript
// server/repositories/transaction.repository.ts
export const transactionRepository = {
  create(userId, data) { /* ... */ },
  findByUser(userId, filters) { /* ... */ },
  // ...
}
```

### Service Layer
Services contain business logic and call repositories:
```typescript
// server/services/transaction.service.ts
export const transactionService = {
  async createTransaction(userId, data) {
    // Business logic, validation
    return await transactionRepository.create(userId, data)
  }
}
```

### AI Integration
- OpenAI used for generating financial insights (server/api/analytics/insights.get.ts)
- Caching in `insights` table to reduce API calls
- Insights regenerated based on data freshness

## Important Conventions

### Error Handling
- Use `createError({ statusCode, statusMessage })` for HTTP errors
- Return standardized responses: `{ success: true, data: {...} }`

### Database Queries
- Use Drizzle ORM with the `db` instance from `server/utils/db.ts`
- Use relations defined in schemas for joins
- Soft delete pattern: check `deletedAt` is null in queries

### Type Validation
- Zod schemas defined in `server/db/schemas/*.ts` using `drizzle-zod`
- Validate request bodies before database operations

### Component Organization
- `app/components/analytic/` - Chart components (Daily, Category, Monthly)
- `app/components/` - Shared components (TransactionCard, modals, etc.)
- Use Nuxt UI components (UButton, UModal, etc.) as base

### Subscription Feature Gating
Check user tier in `event.context.auth.tier`:
```typescript
const { tier } = event.context.auth
if (tier !== 'PRO') {
  throw createError({ statusCode: 403, statusMessage: 'PRO feature' })
}
```

## Testing & Quality

- ESLint configured with stylistic rules
- TypeScript strict mode enabled
- Run `bun typecheck` before committing
- No test framework configured (as of now)

## Deployment Notes

- Multi-stage Docker build using `oven/bun` base image
- Production runs as SPA (no SSR) behind reverse proxy
- Environment variables passed via `env_file` in compose.yaml
- Database migrations must be run manually or in entrypoint script
