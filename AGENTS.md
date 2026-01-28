# AGENTS.md

## Build & Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking

## Database Commands

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Apply migrations to database
- `npm run db:script` - Run database scripts (with bun)

## Project Structure

This is a Nuxt 4 application with a clear separation of concerns:

```
app/              # Frontend (Vue components, pages, composables)
  components/     # Vue components
  pages/          # Routes with page components
  composables/    # Vue composables
  layouts/        # Layout components
  middleware/     # Nuxt middleware
  utils/          # Frontend utilities

server/           # Backend (Nitro)
  api/           # API endpoints (REST conventions: [resource].[method].ts)
  db/            # Database schemas and Drizzle setup
  middleware/    # Server middleware (auth, rate-limiting)
  repositories/  # Data access layer
  services/      # Business logic layer
  utils/         # Server utilities

shared/           # Shared code between frontend and backend
  types/         # TypeScript type definitions
  utils/         # Shared utilities
```

## Code Style Guidelines

### Imports

- Use `~~/` alias for project root (Nuxt auto-imports)
- Group imports: third-party libraries, then internal imports
- No explicit imports for Nuxt composables, auto-imported
- Import types with `type` keyword: `import type { Transaction } from '~~/shared/types'`

```ts
import z from 'zod'
import { transactionService } from '~~/server/services'
import type { TransactionPayload } from '~~/shared/types/transaction'
```

### Component Structure (Vue)

- Use `<script setup lang="ts">` for all components
- Define props first, then emits, then reactive state
- Use `computed` and `watch` as needed
- Keep template logic minimal, delegate to computed properties

```vue
<script setup lang="ts">
const props = defineProps<{ id: number }>()
const emit = defineEmits<{ update: [value: string] }>()

const state = reactive({ value: '' })
</script>
```

### API Endpoints

Follow REST conventions with file naming: `[resource].[method].ts`

- Use `defineEventHandler` for all handlers
- Extract userId from `event.context.auth.userId` (set by auth middleware)
- Validate query/body with Zod using `getValidatedQuery` or `readValidatedBody`
- Use service layer for business logic
- Return consistent response: `{ success: true, data: ..., meta: ... }`

```ts
export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    limit: z.string().optional(),
  }).parse)

  return service.list(userId, query)
})
```

### Database Layer

- Use Drizzle ORM with PostgreSQL
- Define schemas in `server/db/schemas/`
- Use soft deletes: `deletedAt` timestamp (not null check in queries)
- Repository functions: `findMany`, `findById`, `create`, `update`, `delete`, `count`
- Build reusable filter functions with `and()`, `eq()`, `gte()`, etc.

### Service Layer

Business logic lives in services, not repositories:
- Enforce tier restrictions (FREE users limited to 7 days of data)
- Validate business rules
- Throw `createError` with appropriate status codes (401, 402, 404)
- Return standardized success objects

```ts
if (tier === 'FREE' && isOldData) {
  throw createError({
    statusCode: 402,
    statusMessage: 'FREE users cannot access older data',
  })
}
```

### Type Definitions

- Use Drizzle's `$inferSelect` and `$inferInsert` for types
- Export from `shared/types/` using type inference
- Use Zod schemas for validation and generate types with `z.infer<>`

```ts
export type Transaction = typeof schema.transactions.$inferSelect & {
  category: Category
}
```

### Error Handling

- Use `createError()` for API errors with proper status codes
- 401: Unauthorized
- 402: Payment Required (tier restrictions)
- 404: Not found
- Handle errors in components with try/catch, show toast notifications

### Authentication

- Web: Uses `useUserSession()` composable
- Telegram/bot: HMAC signature verification in auth middleware
- Auth context provides: `userId`, `tier`, `source`, `isNewUser`
- Tier values: `'FREE' | 'PRO'`

### Styling

- Uses Nuxt UI components (`UButton`, `UCard`, `UDashboardPanel`, etc.)
- Tailwind CSS for custom styling
- Use semantic color tokens: `text-primary`, `bg-accented`, `text-dimmed`
- Follow existing component patterns in Nuxt UI docs

### Naming Conventions

- Files: kebab-case (`transaction-form.vue`, `transaction.service.ts`)
- Components: PascalCase (`TransactionForm.vue`, `LazyFilterDrawer`)
- Functions: camelCase (`transactionService.create()`)
- Constants: UPPER_SNAKE_CASE (`FREE`, `PRO`)
- Database columns: camelCase (`userId`, `categoryId`, `deletedAt`)

### Composables

- Use `use` prefix for composables (`useAuth()`, `useToast()`)
- Extract reusable logic into composables in `app/composables/`
- Keep composables focused and composable

### Tier Restrictions

FREE users have these limitations:
- Can only access transactions from last 7 days
- Enforced in service layer before database queries
- Show upgrade prompts in UI when restricted
- PRO users have full access to all data

### Date Handling

- Use dayjs for all date operations
- Format: `dayjs(date).format('YYYY-MM-DD')` for API
- Locale set to Indonesian ('id')
- Use shared `formatDate()` utility for display
