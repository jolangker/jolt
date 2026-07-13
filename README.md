# Jolt

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Telegram Bot](https://img.shields.io/badge/Try%20it-Telegram%20Bot-26A5E4?logo=telegram&logoColor=white)](https://t.me/jollexpenser_bot)

**Jolt** is an AI-powered personal finance tracking system that operates through a **Telegram chat bot** and a **web dashboard**. Users interact naturally by sending messages about their expenses and income to the bot, which processes the information using an in-process LLM agent and stores it in a PostgreSQL database. The web dashboard provides visualization, analytics, and transaction management.

## 📱 Preview

<p align="center">
  <img src="./public/dashboard-preview.png" alt="Jolt Dashboard Preview" width="400">
</p>

**👉 Try it now:** [https://t.me/jollexpenser_bot](https://t.me/jollexpenser_bot)

## 🤖 How Jolt Works

Jolt runs as a single Nuxt process handling both the Telegram bot and the web dashboard:

```
┌─────────────────┐      ┌─────────────────────────────────────┐      ┌─────────────────┐
│  Telegram Bot   │ ───> │  Jolt Server (Nuxt + Nitro)         │ <─── │  Web Dashboard  │
│  (Primary UI)   │      │  ┌───────────┐  ┌──────────────┐   │      │  (Charts/Stats) │
└─────────────────┘      │  │  GrammY   │  │  LLM Agent   │   │      └─────────────────┘
                         │  │  Adapter   │─>│  (8 tools)   │   │               │
                         │  └───────────┘  └──────┬───────┘   │               │
                         │                        │           │               │
                         │              ┌─────────▼─────────┐ │               │
                         │              │  Service Layer    │ │               │
                         │              │  (shared logic)   │ │               │
                         │              └─────────┬─────────┘ │               │
                         └────────────────────────┼───────────┘               │
                                                  │                           │
                                          ┌───────▼────────┐                  │
                                          │  PostgreSQL    │◄─────────────────┘
                                          │   Database     │
                                          └────────────────┘
```

### 1. **Telegram Bot** (Primary Interface)
Users interact with Jolt by chatting with a Telegram bot. Send messages like:
- "lunch 25rb" — logs a Rp 25,000 expense under Food
- "gajian 5jt" — logs a Rp 5,000,000 income under Salary
- "how much did I spend on food this month?" — returns a summary
- "show my last 5 transactions" — lists recent activity
- "change that one to 30rb" — updates the most recently referenced transaction
- "delete the bakso one" — removes a matching transaction

### 2. **LLM Agent** (In-Process)
When a message arrives:
- The **Telegram Adapter** (GrammY) receives the webhook update
- The **Agent** forwards the message to an LLM (via Vercel AI SDK) with 8 tools
- The LLM decides which tools to invoke; each tool wraps an existing service method
- The agent can chain multiple tool calls in one turn (e.g., create a category AND log a transaction)
- Conversation memory is in-memory, windowed to the last 10 turns, dropped after 30 min inactivity

### 3. **Web Dashboard**
The web dashboard provides:
- **Visualization**: Charts and graphs of your spending patterns
- **Analytics**: Insights into your financial habits
- **Monitoring**: Overview of income, expenses, and balance
- **Transaction Management**: Create, edit, delete, and export transactions

## ✨ Key Features

### For Users
- 🗣️ **Natural Language Input**: Just chat normally with the Telegram bot
- 🤖 **AI-Powered**: Automatic categorization and data extraction via LLM agent
- 📊 **Visual Analytics**: Beautiful charts showing spending trends and patterns
- 📱 **Mobile-First**: Access your dashboard on any device
- 🔒 **Secure**: Telegram authentication, no password needed
- 🔄 **Multi-Action**: Chain multiple operations in a single message

### Dashboard Features
- **Real-time Sync**: Transactions from Telegram appear instantly in the dashboard
- **Monthly Overview**: Current month's spending summary
- **Quick Metrics**: Balance, total income, total expenses at a glance
- **Transaction History**: Complete list with filtering and pagination
- **Category Breakdown**: See where your money goes
- **Daily Trends**: Track spending patterns over time

## 🛠️ Tech Stack

- **Framework**: [Nuxt 4](https://nuxt.com) - Vue 3 full-stack framework
- **Language**: TypeScript
- **UI Library**: [Nuxt UI](https://ui.nuxt.com) v4
- **Styling**: Tailwind CSS
- **Charts**: [Unovis](https://unovis.dev) - Data visualization library
- **Icons**: Iconify (Lucide, Solar, Simple Icons)
- **Database ORM**: Drizzle ORM with PostgreSQL (Neon serverless)
- **Validation**: Zod + drizzle-zod
- **Authentication**: nuxt-auth-utils (Telegram-based)
- **Telegram Bot**: [grammY](https://grammy.dev) — webhook-based Telegram bot framework
- **LLM Agent**: [Vercel AI SDK](https://ai-sdk.dev) (`ai`) + `@ai-sdk/openai-compatible`
- **Runtime**: Bun

## 📊 Database Schema

All transaction data is stored in PostgreSQL:

### Core Tables
- **`users`**: Telegram user accounts
- **`user_tokens`**: Authentication session management
- **`transactions`**: All income and expense records
- **`categories`**: Pre-defined transaction categories (Food, Transport, Salary, etc.)
- **`expenses`**: Legacy table for backward compatibility

## 📱 Dashboard Pages

### 🏠 Homepage (Dashboard)
- Monthly spending summary
- Quick metrics cards (balance, income, expenses)
- 5 most recent transactions
- Quick action buttons

### 💳 Transactions
- Complete transaction history
- Pagination with "load more"
- Filters: date range, category, transaction type
- Transaction cards with icons and details

### 📈 Analytics
- Interactive charts powered by Unovis
- Daily spending trends
- Category-wise breakdown
- Income vs. Expense comparison
- Time period filters

### 👤 Profile
- Telegram account information
- User statistics
- Settings and preferences

## 🏗️ Project Structure

```
jolt/
├── app/                      # Frontend code
│   ├── pages/               # Routes (Dashboard, Analytics, etc.)
│   ├── components/          # Vue components
│   └── layouts/             # Page layouts
├── server/                  # Backend (Nitro)
│   ├── api/                # REST endpoints
│   │   ├── transactions/   # Transaction CRUD + export
│   │   ├── analytics/      # Analytics data
│   │   ├── categories/     # Category CRUD
│   │   ├── auth/           # Login token flow
│   │   └── telegram/       # Telegram webhook
│   ├── agent/              # LLM agent (Vercel AI SDK)
│   │   ├── index.ts        # generateText loop + system prompt
│   │   ├── memory.ts       # Conversation window (in-memory)
│   │   └── tools/          # 8 tool definitions
│   ├── telegram/           # GrammY adapter
│   │   ├── adapter.ts      # Bot, webhook, message handler
│   │   └── user.ts         # Telegram userId → internal userId
│   ├── services/           # Business logic layer
│   ├── repositories/       # Data access layer (Drizzle)
│   ├── plugins/            # Nitro plugins (bot startup)
│   └── db/                 # Database schemas & migrations
├── shared/                  # Shared types/utils
├── tests/                   # Bun tests
└── docs/                    # Documentation
```

## 🔌 API Endpoints

The dashboard connects to these API endpoints:

- `GET /api/transactions` - List transactions (with pagination/filters)
- `GET /api/analytics/daily` - Daily spending trends
- `GET /api/analytics/categories-breakdown` - Category breakdown
- `GET /api/analytics/summary` - Overall summary
- `GET /api/master/categories` - Available categories
- `POST/PUT/DELETE /api/transactions` - Manage transactions (optional)

## 🎯 Use Cases

1. **Daily Tracking**: Send expenses to Telegram bot throughout the day
2. **Weekly Review**: Check dashboard to see spending patterns
3. **Monthly Analysis**: Review analytics charts to understand your financial habits
4. **Budget Monitoring**: Track if you're staying within budget
5. **Category Insights**: See which categories consume most of your budget

## 🔐 Security

- Telegram authentication (no passwords)
- Session-based auth for the web dashboard (HTTP-only cookies)
- The Telegram bot resolves users in-process — no external auth boundary
- Environment-based configuration for all secrets
- Data encryption in transit and at rest

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Try the bot: [https://t.me/jollexpenser_bot](https://t.me/jollexpenser_bot)
