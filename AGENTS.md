# AGENTS.md

## Build & Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run typecheck` - Run TypeScript type checking

## Testing

**Note:** No test framework is currently set up. When adding tests:
1. Choose a framework (Vitest recommended for Nuxt 4)
2. Add test scripts to package.json
3. Create `__tests__/` directories alongside source files

## Database Commands

- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:migrate` - Apply migrations to database
- `npm run db:script` - Run database scripts (with bun)

## Project Structure

This is a Nuxt 4 application with clear separation of concerns:

```
app/              # Frontend (Vue components, pages, composables)
server/           # Backend (Nitro) - API endpoints, services, repositories, db
shared/           # Shared types and utilities
```

## Code Style Guidelines

### Imports

- Use `~~/` alias for project root
- Group: third-party libraries, then internal imports
- Import types with `type` keyword: `import type { Transaction } from '~~/shared/types'`
- Nuxt composables are auto-imported

```ts
import z from 'zod'
import { transactionService } from '~~/server/services'
import type { TransactionPayload } from '~~/shared/types/transaction'
```

### Components (Vue)

- Use `<script setup lang="ts">`
- Order: props → emits → reactive state → computed → functions
- Use `useFetch` for data loading, `$fetch` for mutations
- Call `refreshNuxtData()` after mutations to refresh cached data

```vue
<script setup lang="ts">
const props = defineProps<{ id: number }>()
const emit = defineEmits<{ update: [value: string] }>()
const state = reactive({ value: '' })

const { data } = await useFetch('/api/categories')
await $fetch('/api/transactions', { method: 'POST', body: payload })
refreshNuxtData()
</script>
```

### API Endpoints

REST convention: `[resource].[method].ts`

- `defineEventHandler` for all handlers
- Extract userId from `event.context.auth.userId`
- Validate with Zod: `getValidatedQuery()` or `readValidatedBody()`
- Return: `{ success: true, data: ..., meta: ... }`

```ts
export default defineEventHandler(async (event) => {
  const userId = event.context.auth.userId
  const query = await getValidatedQuery(event, z.object({
    limit: z.string().optional(),
  }).parse)
  return transactionService.list(userId, query)
})
```

### Database Layer (Drizzle + PostgreSQL)

- Schemas in `server/db/schemas/`
- Soft deletes: `deletedAt` timestamp (check with `isNull()`)
- Repository methods: `findMany`, `findById`, `create`, `update`, `delete`, `count`
- Build filters with `and()`, `eq()`, `gte()`, `ilike()`, `inArray()`

### Service Layer

Business logic lives here, not repositories:
- Enforce tier restrictions (FREE = 7 days max)
- Throw `createError` with proper codes (401, 402, 404)
- Return standardized success objects

```ts
if (tier === 'FREE' && isOldData) {
  throw createError({ statusCode: 402, statusMessage: 'Upgrade required' })
}
```

### Types

- Use Drizzle's `$inferSelect` and `$inferInsert`
- Use Zod schemas with `z.infer<>` for types
- Export from `shared/types/`

### Authentication

- Web: `useUserSession()` composable
- Telegram/bot: HMAC signature verification in middleware
- Context: `userId`, `tier` ('FREE' | 'PRO'), `source`, `isNewUser`

### Naming Conventions

- Files: kebab-case (`transaction-form.vue`, `transaction.service.ts`)
- Components: PascalCase (`TransactionForm.vue`)
- Functions: camelCase (`transactionService.create()`)
- Constants: UPPER_SNAKE_CASE
- DB columns: camelCase

### Styling (Nuxt UI + Tailwind)

- Components: `UButton`, `UCard`, `UDrawer`, `UForm`, etc.
- Color tokens: `text-primary`, `bg-accented`, `text-dimmed`
- Icons: `i-solar:check-circle-outline`, `i-lucide:user`
- Icon packages: `@iconify-json/solar`, `@iconify-json/lucide`

### Composables

- Use `use` prefix (`useAuth()`, `useToast()`)
- Place in `app/composables/`

### Barrel Exports

- Services/repositories use `index.ts` for re-exports
- Import from barrel: `import { transactionService } from '~~/server/services'`

### Date Handling

- Use dayjs (locale: 'id')
- Format for API: `dayjs(date).format('YYYY-MM-DD')`

### Error Handling

- API: `createError()` with status codes (401, 402, 404)
- Components: try/catch with toast notifications
