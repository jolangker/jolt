# Product Requirements Document (PRD)

## Jolt — AI-Powered Personal Finance Management System

> **Version:** 2.0  
> **Last Updated:** December 2025

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [System Architecture](#3-system-architecture)
4. [User Personas](#4-user-personas)
5. [User Stories](#5-user-stories)
6. [Functional Requirements](#6-functional-requirements)
7. [Non-Functional Requirements](#7-non-functional-requirements)
8. [Database Schema](#8-database-schema)
9. [API Specifications](#9-api-specifications)
10. [Technology Stack](#10-technology-stack)
11. [Security & Authentication](#11-security--authentication)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [UI/UX Design Guidelines](#13-uiux-design-guidelines)
14. [Future Roadmap](#14-future-roadmap)

---

## 1. Executive Summary

**Jolt** is an AI-powered personal finance tracking system that combines conversational AI with a modern web dashboard. The platform allows users to effortlessly track their income and expenses by chatting naturally with a Telegram bot, while providing rich visualizations and analytics through a responsive web dashboard.

### Key Value Propositions

- **Frictionless Data Entry**: Natural language input via Telegram chat
- **AI-Powered Intelligence**: Automatic categorization and data extraction
- **Visual Insights**: Beautiful charts and analytics dashboard
- **Mobile-First Design**: Access financial data anywhere, anytime
- **Secure & Private**: Telegram-based authentication with no passwords

---

## 2. Product Vision & Goals

### Vision Statement

*To simplify personal finance management by making expense tracking as easy as sending a text message, while providing powerful insights to help users achieve their financial goals.*

### Primary Goals

| Goal | Description | Success Metric |
|------|-------------|----------------|
| **Ease of Use** | Zero learning curve for expense tracking | < 5 seconds to log a transaction via bot |
| **Comprehensive Visualization** | Clear understanding of spending patterns | User engagement with analytics page |
| **Real-time Sync** | Instant data availability across platforms | < 1 second sync latency |
| **Data Accuracy** | High accuracy in AI categorization | > 90% correct categorization rate |

### Target Audience

- Individuals seeking simple expense tracking
- Users who prefer conversational interfaces over traditional apps
- Mobile-first users who want quick access to their finances
- Budget-conscious individuals tracking spending habits

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              JOLT ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│    ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐   │
│    │   TELEGRAM BOT   │────▶│  n8n WORKFLOW    │────▶│  WEB DASHBOARD   │   │
│    │  (Primary Input) │     │ (AI Processing)  │     │   (This Repo)    │   │
│    └──────────────────┘     └──────────────────┘     └──────────────────┘   │
│             │                        │                         │            │
│             │                        │                         │            │
│             └────────────────────────┼─────────────────────────┘            │
│                                      │                                       │
│                                      ▼                                       │
│                          ┌──────────────────────┐                           │
│                          │   POSTGRESQL (NEON)  │                           │
│                          │   Serverless Database│                           │
│                          └──────────────────────┘                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Overview

| Component | Responsibility | Technology |
|-----------|----------------|------------|
| **Telegram Bot** | Primary user interface for data entry | Telegram Bot API |
| **n8n Workflow** | AI processing, NLP extraction, data transformation | n8n Automation |
| **Web Dashboard** | Visualization, analytics, transaction management | Nuxt 4, Vue 3 |
| **Database** | Persistent data storage | PostgreSQL (Neon Serverless) |

### Server Architecture

The server follows a **Service-Repository Pattern** for clean separation of concerns:

```
┌─────────────────────────────────────────────────────────────────────┐
│                         API Routes (server/api/)                     │
│                    Validation & Orchestration Only                   │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Services (server/services/)                     │
│                         Business Logic Layer                         │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Repositories (server/repositories/)                │
│                        Data Access Layer                             │
└─────────────────────────────────────┬───────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Database (Drizzle ORM)                       │
└─────────────────────────────────────────────────────────────────────┘
```

| Layer | Location | Responsibility |
|-------|----------|----------------|
| **API Routes** | `server/api/` | Request validation via Zod, authentication context, service orchestration |
| **Services** | `server/services/` | Business logic, data transformation, error handling |
| **Repositories** | `server/repositories/` | Database queries via Drizzle ORM, CRUD operations |
| **Schemas** | `server/db/schemas/` | Database table definitions, Zod insert schemas |

#### Server Directory Structure

```
server/
├── api/                    # HTTP layer (orchestration only)
│   ├── analytics/          # Analytics endpoints
│   ├── auth/               # Authentication endpoints
│   ├── master/             # Master data endpoints
│   └── transactions/       # Transaction CRUD endpoints
├── db/                     # Database definitions
│   ├── schema.ts           # Barrel export
│   └── schemas/            # Table definitions
├── repositories/           # Data access layer
│   ├── analytics.repository.ts
│   ├── auth-token.repository.ts
│   ├── category.repository.ts
│   ├── transaction.repository.ts
│   ├── user.repository.ts
│   └── index.ts
├── services/               # Business logic layer
│   ├── analytics.service.ts
│   ├── auth.service.ts
│   ├── category.service.ts
│   ├── transaction.service.ts
│   └── index.ts
├── middleware/             # Server middleware
└── utils/                  # Shared utilities
```

---

## 4. User Personas

### Persona 1: "Quick Tracker" Andi

- **Age:** 28
- **Occupation:** Software Developer
- **Behavior:** Logs expenses on-the-go via quick messages
- **Pain Points:** Traditional apps are too slow and require too many taps
- **Goals:** Track daily expenses without interrupting workflow

### Persona 2: "Budget Planner" Sari

- **Age:** 35
- **Occupation:** Marketing Manager
- **Behavior:** Reviews weekly spending patterns and adjusts budgets
- **Pain Points:** Difficulty understanding where money goes each month
- **Goals:** Optimize spending and save more efficiently

### Persona 3: "Financial Analyst" Budi

- **Age:** 42
- **Occupation:** Small Business Owner
- **Behavior:** Needs detailed breakdowns and historical comparisons
- **Pain Points:** Lack of visual insights from traditional banking apps
- **Goals:** Better financial planning through data visualization

---

## 5. User Stories

### Authentication & Access

| ID | Story | Priority |
|----|-------|----------|
| US-001 | As a user, I want to log in using my Telegram account so I can securely access my data without remembering a password | **High** |
| US-002 | As a user, I want my session to persist so I don't have to log in repeatedly | **High** |
| US-003 | As a user, I want to see a clear unauthorized page if my session expires | **Medium** |

### Dashboard & Overview

| ID | Story | Priority |
|----|-------|----------|
| US-010 | As a user, I want to see my net balance prominently displayed on the dashboard | **High** |
| US-011 | As a user, I want to see summary cards showing total income and expenses for the current period | **High** |
| US-012 | As a user, I want to see my 5 most recent transactions on the dashboard | **High** |
| US-013 | As a user, I want quick navigation to view all transactions | **Medium** |

### Transaction Management

| ID | Story | Priority |
|----|-------|----------|
| US-020 | As a user, I want to view all my transactions in a scrollable list | **High** |
| US-021 | As a user, I want to search transactions by note or description | **High** |
| US-022 | As a user, I want to filter transactions by type (income/expense) | **High** |
| US-023 | As a user, I want to filter transactions by category | **High** |
| US-024 | As a user, I want to filter transactions by date range | **High** |
| US-025 | As a user, I want infinite scroll for loading more transactions | **Medium** |
| US-026 | As a user, I want to view detailed information about a transaction | **Medium** |
| US-027 | As a user, I want to add new transactions via the web dashboard | **Medium** |
| US-028 | As a user, I want to edit existing transactions | **Low** |
| US-029 | As a user, I want to delete transactions | **Low** |

### Analytics & Visualization

| ID | Story | Priority |
|----|-------|----------|
| US-030 | As a user, I want to see daily spending trends in a chart | **High** |
| US-031 | As a user, I want to see category-wise breakdown of my expenses | **High** |
| US-032 | As a user, I want to filter analytics by time period (7d, 30d, 3m, 6m, all time) | **High** |
| US-033 | As a user, I want to compare income vs expenses visually | **Medium** |
| US-034 | As a user, I want to see monthly spending trends over time | **Medium** |

### Profile & Settings

| ID | Story | Priority |
|----|-------|----------|
| US-040 | As a user, I want to view my connected Telegram account information | **Medium** |
| US-041 | As a user, I want to log out securely | **High** |

---

## 6. Functional Requirements

### 6.1 Authentication Module

| Requirement | Description |
|-------------|-------------|
| **FR-AUTH-001** | System shall authenticate users via Telegram OAuth |
| **FR-AUTH-002** | System shall store user sessions using secure tokens |
| **FR-AUTH-003** | System shall expire tokens after the configured duration |
| **FR-AUTH-004** | System shall redirect unauthenticated users to login page |
| **FR-AUTH-005** | System shall display user's Telegram username after login |

### 6.2 Dashboard Module

| Requirement | Description |
|-------------|-------------|
| **FR-DASH-001** | Dashboard shall display net balance (income - expenses) |
| **FR-DASH-002** | Dashboard shall show total income and total expenses in separate cards |
| **FR-DASH-003** | Dashboard shall display the 5 most recent transactions |
| **FR-DASH-004** | Dashboard shall provide quick navigation link to all transactions |
| **FR-DASH-005** | Dashboard shall use Nuxt UI components with consistent styling |

### 6.3 Transaction Management Module

| Requirement | Description |
|-------------|-------------|
| **FR-TXN-001** | System shall display transactions in a card-based list view |
| **FR-TXN-002** | System shall support pagination via infinite scroll (10 items per page) |
| **FR-TXN-003** | System shall support search with 500ms debounce |
| **FR-TXN-004** | System shall support filtering by transaction type |
| **FR-TXN-005** | System shall support filtering by multiple categories |
| **FR-TXN-006** | System shall support filtering by date range |
| **FR-TXN-007** | System shall display transaction icon, category, amount, date, and note |
| **FR-TXN-008** | System shall color-code income (green/success) and expenses (red/error) |

### 6.4 Analytics Module

| Requirement | Description |
|-------------|-------------|
| **FR-ANA-001** | System shall display interactive daily spending chart |
| **FR-ANA-002** | System shall display category breakdown chart |
| **FR-ANA-003** | System shall support time period filtering (7d, 30d, 3m, 6m, all) |
| **FR-ANA-004** | System shall show income/expense summary cards |
| **FR-ANA-005** | Charts shall be interactive with hover tooltips |
| **FR-ANA-006** | System shall use Unovis library for data visualization |

### 6.5 Profile Module

| Requirement | Description |
|-------------|-------------|
| **FR-PROF-001** | System shall display connected Telegram account details |
| **FR-PROF-002** | System shall provide secure logout functionality |
| **FR-PROF-003** | System shall display user statistics (if available) |

---

## 7. Non-Functional Requirements

### 7.1 Performance

| Requirement | Target |
|-------------|--------|
| **NFR-PERF-001** | Page load time | < 2 seconds on 3G connection |
| **NFR-PERF-002** | API response time | < 500ms for standard queries |
| **NFR-PERF-003** | Chart rendering time | < 1 second for up to 1000 data points |
| **NFR-PERF-004** | Infinite scroll loading | < 300ms per batch |

### 7.2 Usability

| Requirement | Description |
|-------------|-------------|
| **NFR-USE-001** | Mobile-first responsive design |
| **NFR-USE-002** | Minimum touch target size of 44x44 pixels |
| **NFR-USE-003** | Clear visual feedback for all user actions |
| **NFR-USE-004** | Support for dark and light color themes |

### 7.3 Reliability

| Requirement | Target |
|-------------|--------|
| **NFR-REL-001** | System uptime | 99.5% availability |
| **NFR-REL-002** | Data durability | No data loss on server restart |
| **NFR-REL-003** | Error handling | Graceful degradation with user-friendly messages |

### 7.4 Security

| Requirement | Description |
|-------------|-------------|
| **NFR-SEC-001** | All API endpoints require authentication (except auth routes) |
| **NFR-SEC-002** | Tokens stored securely with expiration |
| **NFR-SEC-003** | CORS configured for API routes |
| **NFR-SEC-004** | Environment-based configuration for secrets |
| **NFR-SEC-005** | Data encryption in transit (HTTPS) |

### 7.5 Scalability

| Requirement | Description |
|-------------|-------------|
| **NFR-SCA-001** | Database schema supports horizontal scaling via Neon |
| **NFR-SCA-002** | Stateless server architecture (SSR disabled) |
| **NFR-SCA-003** | Docker containerization for easy deployment |

---

## 8. Database Schema

### Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      USERS       │       │   TRANSACTIONS   │       │   CATEGORIES     │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK, UUID)    │◀──────│ userId (FK)      │       │ id (PK, SERIAL)  │
│ telegramUserId   │       │ id (PK, SERIAL)  │──────▶│ name             │
│ telegramUsername │       │ categoryId (FK)  │       │ description      │
│ createdAt        │       │ type (ENUM)      │       │ type (ENUM)      │
└──────────────────┘       │ note             │       │ icon             │
         │                 │ amount (DECIMAL) │       │ createdAt        │
         │                 │ date             │       └──────────────────┘
         ▼                 │ createdAt        │
┌──────────────────┐       └──────────────────┘
│   USER_TOKENS    │
├──────────────────┤
│ id (PK, UUID)    │
│ userId (FK)      │
│ token (UNIQUE)   │
│ expiresAt        │
│ createdAt        │
└──────────────────┘
```

### Table Definitions

#### `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique user identifier |
| `telegramUserId` | TEXT | NOT NULL | Telegram user ID |
| `telegramUsername` | TEXT | | Telegram display username |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |

#### `user_tokens`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Token identifier |
| `userId` | UUID | FOREIGN KEY → users.id, ON DELETE CASCADE | Owner user |
| `token` | TEXT | UNIQUE, NOT NULL | Session token value |
| `expiresAt` | TIMESTAMP | NOT NULL | Token expiration time |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Token creation time |

#### `categories`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Category identifier |
| `name` | TEXT | NOT NULL | Category display name |
| `description` | TEXT | NOT NULL | Category description |
| `type` | ENUM('expense', 'income') | NOT NULL | Category type |
| `icon` | TEXT | | Icon identifier (Iconify) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Creation timestamp |

#### `transactions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Transaction identifier |
| `userId` | UUID | FOREIGN KEY → users.id, ON DELETE CASCADE | Transaction owner |
| `categoryId` | SERIAL | FOREIGN KEY → categories.id, ON DELETE CASCADE | Associated category |
| `type` | ENUM('expense', 'income') | NOT NULL | Transaction type |
| `note` | TEXT | NOT NULL | Transaction description |
| `amount` | DECIMAL | NOT NULL | Transaction amount |
| `date` | TIMESTAMP | NOT NULL | Transaction date |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation time |

### Predefined Categories

| Category | Type | Icon |
|----------|------|------|
| Food & Dining | expense | 🍽️ |
| Transportation | expense | 🚗 |
| Shopping | expense | 🛒 |
| Entertainment | expense | 🎬 |
| Bills & Utilities | expense | 📄 |
| Healthcare | expense | 🏥 |
| Education | expense | 📚 |
| Salary | income | 💰 |
| Freelance | income | 💻 |
| Investment | income | 📈 |
| Gift | income | 🎁 |
| Other | both | 📦 |

---

## 9. API Specifications

### Base URL

```
/api
```

### Authentication Endpoints

#### Request Login Token

```http
POST /api/auth/request-login-token
```

**Response:**
```json
{
  "token": "string",
  "expiresAt": "ISO8601 timestamp"
}
```

#### Login with Token

```http
POST /api/auth/login-with-token
```

**Request Body:**
```json
{
  "token": "string"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "telegramUsername": "string"
  }
}
```

### Transaction Endpoints

#### List Transactions

```http
GET /api/transactions
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `limit` | number | Items per page (default: 10) |
| `offset` | number | Pagination offset (default: 0) |
| `search` | string | Search in notes |
| `type` | enum | Filter by 'income' or 'expense' |
| `categories` | string | Comma-separated category IDs |
| `startDate` | string | Filter start date (YYYY-MM-DD) |
| `endDate` | string | Filter end date (YYYY-MM-DD) |

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "type": "expense",
      "amount": "50000",
      "note": "Lunch at restaurant",
      "date": "2025-12-06T12:00:00Z",
      "category": {
        "id": 1,
        "name": "Food & Dining",
        "icon": "i-solar:hamburger-outline"
      }
    }
  ],
  "meta": {
    "total": 100,
    "limit": 10,
    "offset": 0
  }
}
```

#### Create Transaction

```http
POST /api/transactions
```

**Request Body:**
```json
{
  "categoryId": 1,
  "type": "expense",
  "amount": "50000",
  "note": "Lunch at restaurant",
  "date": "2025-12-06"
}
```

#### Update Transaction

```http
PUT /api/transactions/:id
```

#### Delete Transaction

```http
DELETE /api/transactions/:id
```

### Analytics Endpoints

#### Daily Analytics

```http
GET /api/analytics/daily
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Start date (YYYY-MM-DD) |
| `endDate` | string | End date (YYYY-MM-DD) |

**Response:**
```json
{
  "data": [
    {
      "date": "2025-12-01",
      "income": 0,
      "expense": 150000
    }
  ]
}
```

#### Category Breakdown

```http
GET /api/analytics/categories-breakdown
```

**Response:**
```json
{
  "data": [
    {
      "categoryId": 1,
      "categoryName": "Food & Dining",
      "total": 500000,
      "percentage": 35.5
    }
  ]
}
```

#### Summary Analytics

```http
GET /api/analytics/summary
```

**Response:**
```json
{
  "data": {
    "income": 5000000,
    "expense": 3500000,
    "nett": 1500000
  }
}
```

### Master Data Endpoints

#### List Categories

```http
GET /api/master/categories
```

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "name": "Food & Dining",
      "description": "Restaurants, groceries, food delivery",
      "type": "expense",
      "icon": "i-solar:hamburger-outline"
    }
  ]
}
```

---

## 10. Technology Stack

### Frontend (Web Dashboard)

| Technology | Version | Purpose |
|------------|---------|---------|
| **Nuxt** | 4.2.1 | Full-stack Vue.js framework |
| **Vue** | 3.5.25 | Reactive UI library |
| **TypeScript** | 5.9.3 | Type-safe JavaScript |
| **Nuxt UI** | 4.1.0 | Component library with Tailwind |
| **Tailwind CSS** | (via Nuxt UI) | Utility-first styling |
| **Unovis** | 1.6.2 | Data visualization |
| **VueUse** | 14.1.0 | Vue composition utilities |
| **Day.js** | 1.11.19 | Date manipulation |

### Backend & Database

| Technology | Version | Purpose |
|------------|---------|---------|
| **Drizzle ORM** | 0.44.7 | Type-safe database access |
| **Neon** | 1.0.2 | Serverless PostgreSQL |
| **Zod** | 4.1.12 | Runtime validation |
| **Valibot** | 1.1.0 | Schema validation |
| **nuxt-auth-utils** | 0.5.25 | Authentication utilities |

### Development & Build

| Technology | Purpose |
|------------|---------|
| **Bun** | Package manager & runtime |
| **ESLint** | Code linting |
| **Docker** | Containerization |
| **Drizzle Kit** | Database migrations |

### Icons

| Library | Usage |
|---------|-------|
| **Lucide** | General UI icons |
| **Solar** | Feature icons |
| **Simple Icons** | Brand icons |

---

## 11. Security & Authentication

### Authentication Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │  Telegram   │     │   n8n       │     │   Jolt      │
│             │     │   Bot       │     │ Workflow    │     │   Server    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       │  /start           │                   │                   │
       │──────────────────▶│                   │                   │
       │                   │                   │                   │
       │                   │  Request token    │                   │
       │                   │──────────────────────────────────────▶│
       │                   │                   │                   │
       │                   │                   │   Return token    │
       │                   │◀──────────────────────────────────────│
       │                   │                   │                   │
       │  Login link       │                   │                   │
       │◀──────────────────│                   │                   │
       │                   │                   │                   │
       │  Click link ─────────────────────────────────────────────▶│
       │                   │                   │                   │
       │                   │                   │   Validate token  │
       │                   │                   │   Create session  │
       │◀─────────────────────────────────────────────────────────│
       │                   │                   │   Return cookie   │
       │                   │                   │                   │
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| **Token-based Auth** | Short-lived tokens for login, cookies for session |
| **Session Cookies** | HTTP-only secure cookies |
| **CORS Protection** | Configured for `/api/**` routes |
| **Environment Variables** | All secrets in `.env` file |
| **Input Validation** | Zod/Valibot schemas on all inputs |
| **SQL Injection Protection** | Drizzle ORM parameterized queries |

### Middleware

- **Auth Middleware**: Applied to all protected pages
- **Redirect Logic**: Unauthenticated → `/login`, unauthorized → `/unauthorized`

---

## 12. Deployment & Infrastructure

### Docker Configuration

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN bun install --production
RUN bun run build
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon PostgreSQL connection string | ✅ |
| `NUXT_SESSION_PASSWORD` | Session encryption key | ✅ |
| `TELEGRAM_BOT_TOKEN` | Bot API token (for auth) | ✅ |

### Deployment Commands

```bash
# Build Docker image
bun run docker:build

# Push to registry
bun run docker:push

# Deploy with Docker Compose
docker compose up -d
```

### Database Migration

```bash
# Generate migration files
bun run db:generate

# Apply migrations
bun run db:migrate
```

---

## 13. UI/UX Design Guidelines

### Design Principles

1. **Mobile-First**: Design for small screens, enhance for larger
2. **Clarity**: Financial data must be instantly understandable
3. **Consistency**: Use Nuxt UI components throughout
4. **Feedback**: Immediate visual feedback for all actions
5. **Accessibility**: WCAG 2.1 AA compliance

### Color Semantics

| Color | Usage | CSS Variable |
|-------|-------|--------------|
| **Primary** | Brand, main CTAs | `--ui-primary` |
| **Success** | Income, positive values | `--ui-success` |
| **Error** | Expenses, negative values | `--ui-error` |
| **Dimmed** | Secondary text | `--ui-text-dimmed` |
| **Muted** | Backgrounds, subtle elements | `--ui-bg-muted` |

### Typography

- **Headlines**: 2xl, lg font weights (bold, semibold)
- **Body**: Base size, regular weight
- **Captions**: xs, dimmed color

### Component Library

All UI components use **Nuxt UI v4**:

- `UDashboardPanel` - Page layout container
- `UDashboardNavbar` - Top navigation bar
- `UCard` - Content cards
- `UButton` - Action buttons
- `UInput` - Form inputs
- `USelectMenu` - Dropdowns
- `UEmpty` - Empty state displays

---

## 14. Future Roadmap

### 🎯 Target: End of 2025

| Feature | Description | Status |
|---------|-------------|--------|
| **Custom Categories** | User-defined categories with LLM understanding — the AI can recognize and properly categorize transactions even with custom category names | 🔲 Planned |
| **Export to Excel** | Export transaction data to Excel (.xlsx) format for external analysis and record-keeping | 🔲 Planned |
| **Budget Setting & Tracking** | Set monthly/weekly budgets per category and track spending against limits with visual progress indicators | 🔲 Planned |

---

### Phase 1: Enhanced Experience (Q1 2026)

- [ ] Recurring transaction support
- [ ] Bill reminders and notifications
- [ ] Savings goals tracking

### Phase 2: Intelligence (Q2 2026)

- [ ] Spending predictions with AI
- [ ] Anomaly detection for unusual transactions
- [ ] Financial health score
- [ ] Financial tips based on spending patterns

### Phase 3: Social Features (Q3 2026)

- [ ] Shared budgets for families/couples
- [ ] Expense splitting with friends
- [ ] Group financial goals

### Phase 4: Integrations (Q4 2026)

- [ ] Bank account sync (via Plaid/similar)
- [ ] Receipt OCR scanning
- [ ] Integration with other finance apps
- [ ] API for third-party developers

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Transaction** | A single income or expense record |
| **Category** | Classification for transactions (e.g., Food, Transport) |
| **Net Balance** | Total income minus total expenses |
| **n8n** | Workflow automation platform used for AI processing |
| **Neon** | Serverless PostgreSQL database provider |
| **Drizzle** | Type-safe ORM for TypeScript/JavaScript |

---

## Appendix B: Reference Documents

- [README.md](./README.md) — Project setup and architecture overview
- [Legacy PRD](./legacy.md) — Previous version of this document
- [Nuxt UI Documentation](https://ui.nuxt.com) — Component library reference
- [Drizzle ORM Docs](https://orm.drizzle.team) — Database ORM reference

---

*Document maintained by the Jolt Development Team*
