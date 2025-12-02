# Jolt

[![Nuxt UI](https://img.shields.io/badge/Made%20with-Nuxt%20UI-00DC82?logo=nuxt&labelColor=020420)](https://ui.nuxt.com)
[![Telegram Bot](https://img.shields.io/badge/Try%20it-Telegram%20Bot-26A5E4?logo=telegram&logoColor=white)](https://t.me/jollexpenser_bot)

**Jolt** is an AI-powered personal finance tracking system that operates primarily through a **Telegram chat bot**. Users interact naturally by sending messages about their expenses and income to the bot, which processes the information using AI workflows and stores it in a database. This repository contains the **web dashboard** component for visualizing and monitoring your financial data.

## 📱 Preview

<p align="center">
  <img src="./public/dashboard-preview.png" alt="Jolt Dashboard Preview" width="400">
</p>

**👉 Try it now:** [https://t.me/jollexpenser_bot](https://t.me/jollexpenser_bot)

## 🤖 How Jolt Works

Jolt is built on a three-part architecture:

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Telegram Bot   │ ───> │  n8n Workflow   │ ───> │  Web Dashboard  │
│  (Primary UI)   │      │  (AI Processing)│      │  (This Repo)    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
         │                        │                         │
         └────────────────────────┴─────────────────────────┘
                                  │
                          ┌───────▼────────┐
                          │  PostgreSQL    │
                          │   Database     │
                          └────────────────┘
```

### 1. **Telegram Bot** (Primary Interface)
Users interact with Jolt by chatting with a Telegram bot. Simply send messages like:
- "I spent $25 on lunch today"
- "Received salary $3000"
- "Coffee $5"

The bot is the main entry point for all user interactions.

### 2. **n8n Workflow** (AI Processing)
When you send a message to the bot:
- The message is forwarded to an n8n workflow
- AI processes the natural language to extract:
  - Amount
  - Category (Food, Transport, Salary, etc.)
  - Transaction type (expense or income)
  - Date and notes
- The structured data is then stored in the database

### 3. **Web Dashboard** (This Repository)
The web dashboard provides:
- **Visualization**: Charts and graphs of your spending patterns
- **Analytics**: Insights into your financial habits
- **Monitoring**: Overview of income, expenses, and balance
- **Transaction History**: Review and manage past transactions

> **Note**: The dashboard is read-focused. While you can manage transactions here, the primary way to add new entries is through the Telegram bot.

## ✨ Key Features

### For Users
- 🗣️ **Natural Language Input**: Just chat normally with the Telegram bot
- 🤖 **AI-Powered**: Automatic categorization and data extraction
- 📊 **Visual Analytics**: Beautiful charts showing spending trends and patterns
- 📱 **Mobile-First**: Access your dashboard on any device
- 🔒 **Secure**: Telegram authentication, no password needed

### Dashboard Features
- **Real-time Sync**: Data from Telegram appears instantly
- **Monthly Overview**: Current month's spending summary
- **Quick Metrics**: Balance, total income, total expenses at a glance
- **Transaction History**: Complete list with filtering and pagination
- **Category Breakdown**: See where your money goes
- **Daily Trends**: Track spending patterns over time

## 🛠️ Tech Stack

### Web Dashboard (This Repository)
- **Framework**: [Nuxt 4](https://nuxt.com) - Vue 3 full-stack framework
- **Language**: TypeScript
- **UI Library**: [Nuxt UI](https://ui.nuxt.com) v4.1.0
- **Styling**: Tailwind CSS
- **Charts**: [Unovis](https://unovis.dev) - Data visualization library
- **Icons**: Iconify (Lucide, Solar, Simple Icons)
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Validation**: Zod & Valibot
- **Authentication**: nuxt-auth-utils (Telegram-based)
- **Runtime**: Node.js with Bun package manager

### External Components
- **Chat Interface**: Telegram Bot API
- **AI Processing**: n8n workflow automation
- **Database**: Neon (Serverless PostgreSQL)
- **Deployment**: Docker containerization

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
├── server/                  # Backend API
│   ├── api/                # REST endpoints
│   │   ├── transactions/   # Transaction CRUD
│   │   ├── analytics/      # Analytics data
│   │   └── auth/           # Authentication
│   └── db/                 # Database schemas
├── shared/                  # Shared types/utils
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
- Secure session token management
- Environment-based configuration
- Data encryption in transit and at rest

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💬 Support

If you have any questions or need help, feel free to:
- Open an issue on GitHub
- Try the bot: [https://t.me/jollexpenser_bot](https://t.me/jollexpenser_bot)
