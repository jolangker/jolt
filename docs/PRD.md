# Product Requirements Document (PRD) - Jolt

## 1. Project Overview
**Jolt** is a modern, mobile-first web application designed for personal finance tracking. It allows users to manage their income and expenses, visualize their financial habits through analytics, and categorize transactions for better organization. The application leverages a modern tech stack including Nuxt 4, TypeScript, and Drizzle ORM to provide a fast and responsive user experience.

## 2. User Stories
- **As a user**, I want to log in using my Telegram account so that I can securely access my data without remembering a password.
- **As a user**, I want to view a dashboard showing my current month's spending and recent transactions to get a quick financial overview.
- **As a user**, I want to add new income or expense transactions with details like amount, category, date, and notes.
- **As a user**, I want to categorize my transactions (e.g., Food, Transport, Salary) to understand where my money goes.
- **As a user**, I want to view detailed analytics and charts to analyze my spending patterns over time.
- **As a user**, I want to see a list of all my transactions with pagination and filtering options.
- **As a user**, I want to manage my profile and view my account details.

## 3. Functional Requirements

### 3.1 Authentication
- **Telegram Login**: Users authenticate via Telegram. The system stores `telegramUserId` and `telegramUsername`.
- **Session Management**: Secure session handling using tokens stored in the `user_tokens` table.

### 3.2 Dashboard
- **Summary Cards**: Display total income, total expenses, and net balance for the current month.
- **Recent Transactions**: Show a list of the 5 most recent transactions.
- **Quick Actions**: Buttons to quickly add a new transaction.

### 3.3 Transaction Management
- **Add Transaction**: Form to input amount, category, date, type (income/expense), and notes.
- **Edit/Delete Transaction**: Ability to modify or remove existing transactions.
- **Transaction List**: View all transactions with support for pagination (infinite scroll or "load more") and filtering by date range and category.
- **Categories**: Pre-defined categories for income and expenses (e.g., Food, Transport, Salary).

### 3.4 Analytics
- **Visualizations**: Interactive charts (using Unovis) to display:
    - Daily spending trends.
    - Category-wise breakdown of expenses.
    - Income vs. Expense comparison.
- **Timeframes**: Ability to filter analytics by different time periods (e.g., this month, last month).

### 3.5 Profile
- **User Info**: Display connected Telegram account details.
- **Settings**: Options to manage app preferences (future scope).

## 4. Non-Functional Requirements
- **Performance**: Fast load times and smooth transitions, optimized for mobile devices.
- **Responsiveness**: Mobile-first design using Tailwind CSS to ensure usability across all screen sizes.
- **Security**: Secure handling of user data and authentication tokens.
- **Scalability**: Database schema designed to support growing user data (using Drizzle ORM and Neon).

## 5. Tech Stack
- **Framework**: Nuxt 4 (Vue 3)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (via Nuxt UI)
- **Database**: Neon (Serverless Postgres)
- **ORM**: Drizzle ORM
- **Validation**: Zod, Valibot
- **Charts**: Unovis
- **Icons**: Iconify (Lucide, Solar, Simple Icons)
- **Package Manager**: Bun (inferred from `bun.lockb`)

## 6. Database Schema
The database is managed using Drizzle ORM with the following core tables:

### `users`
- `id`: UUID (Primary Key)
- `telegramUserId`: Text
- `telegramUsername`: Text
- `createdAt`: Timestamp

### `user_tokens`
- `id`: UUID (Primary Key)
- `userId`: UUID (Foreign Key -> `users.id`)
- `token`: Text (Unique)
- `expiresAt`: Timestamp
- `createdAt`: Timestamp

### `categories`
- `id`: Serial (Primary Key)
- `name`: Text
- `description`: Text
- `type`: Enum ('expense', 'income')
- `icon`: Text
- `createdAt`: Timestamp

### `transactions`
- `id`: Serial (Primary Key)
- `userId`: UUID (Foreign Key -> `users.id`)
- `categoryId`: Serial (Foreign Key -> `categories.id`)
- `type`: Enum ('expense', 'income')
- `note`: Text
- `amount`: Decimal
- `date`: Timestamp
- `createdAt`: Timestamp

### `expenses` (Legacy/Specific Use)
- `id`: Serial (Primary Key)
- `userId`: UUID (Foreign Key -> `users.id`)
- `note`: Text
- `category`: Text
- `amount`: Decimal
- `transactionDate`: Timestamp
- `createdAt`: Timestamp

## 7. API Endpoints

### Auth
- `POST /api/auth/request-login-token`: Request a login token.
- `POST /api/auth/login-with-token`: Exchange token for session.

### Transactions
- `GET /api/transactions`: List transactions (with pagination/filters).
- `POST /api/transactions`: Create a new transaction.
- `PUT /api/transactions/:id`: Update a transaction.
- `DELETE /api/transactions/:id`: Delete a transaction.
- `GET /api/transactions/summary`: Get summary stats (income/expense/balance).

### Analytics
- `GET /api/analytics/daily`: Get daily spending data.
- `GET /api/analytics/categories-breakdown`: Get spending by category.
- `GET /api/analytics/summary`: Get overall analytics summary.

### Master Data
- `GET /api/master/categories`: Get list of available categories.

### Payment (Integration)
- `lynk`: Subdirectory for payment integration (details TBD).
