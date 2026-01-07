# Jolt AI – Product Requirements Document (PRD)

> **Version:** 1.0  
> **Date:** January 7, 2026  
> **Product Name:** Jolt AI  
> **Tagline:** *Your AI-Powered Personal Finance Companion*

---

## 1. Executive Summary

**Jolt AI** is an intelligent personal finance management application that makes tracking expenses effortless. By combining a conversational **Telegram bot** with a beautiful **web dashboard**, Jolt AI enables users to log transactions naturally through chat and gain powerful insights into their spending habits.

### Vision
*Making personal finance management as simple as sending a message.*

### Key Value Propositions
- 🤖 **Effortless Tracking** – Log expenses and income through natural conversation
- 🧠 **AI-Powered Intelligence** – Automatic categorization and personalized financial insights
- 📊 **Visual Analytics** – Beautiful charts and graphs to understand spending patterns
- 📱 **Mobile-First Experience** – Designed for on-the-go financial management

---

## 2. Target Users

### Primary Persona: The Busy Professional
- **Demographics:** 25-45 years old, working professionals, entrepreneurs
- **Pain Points:**
  - Forgetting to log expenses manually
  - Spreadsheets are tedious and time-consuming
  - Existing apps require too many taps/clicks
  - Lack of insights into spending patterns
- **Goals:**
  - Quick and effortless expense tracking
  - Understanding where money goes
  - Making better financial decisions

### Secondary Persona: The Budget-Conscious Student
- **Demographics:** 18-25 years old, students, young adults
- **Pain Points:**
  - Limited budget management knowledge
  - Need simple, free tools
  - Want insights without complexity
- **Goals:**
  - Track daily spending easily
  - Stay within budget
  - Build healthy financial habits

---

## 3. Core Features

### 3.1 AI-Powered Transaction Tracking

The heart of Jolt AI is its conversational interface through Telegram, allowing users to log transactions naturally through multiple input methods.

#### Input Methods

| Method | Description | FREE Tier | PRO Tier |
|--------|-------------|-----------|----------|
| **Text Message** | Type naturally: *"Spent 50k on coffee"* | ✅ Unlimited | ✅ Unlimited |
| **Voice Message** | Send voice notes describing your transaction | ⚠️ 3/day | ✅ Unlimited |
| **Image/Receipt** | Send photos of receipts for automatic extraction | ❌ Not available | ✅ Unlimited |

#### AI Capabilities

| Feature | Description |
|---------|-------------|
| **Natural Language Processing** | Understands conversational messages in any format |
| **Smart Categorization** | AI automatically assigns appropriate categories to transactions |
| **Context-Aware Extraction** | Intelligently extracts amount, category, date, and notes from messages |
| **Voice Transcription** | Converts voice messages to text and processes them |
| **Receipt OCR** | Scans receipt images to extract transaction details (PRO) |

**User Flow (Text):**
1. User opens Telegram and messages the Jolt bot
2. Types naturally: *"Lunch with team 150k"*
3. AI processes and extracts: Amount (Rp 150,000), Category (Food & Dining), Note (Lunch with team)
4. Transaction is saved and synced to dashboard instantly

**User Flow (Voice):**
1. User records a voice message: *"Just paid 200 thousand for groceries"*
2. AI transcribes and processes the audio
3. Transaction details extracted and saved automatically

**User Flow (Image – PRO):**
1. User takes a photo of a receipt
2. AI scans and extracts merchant, amount, date, and items
3. Transaction created with full receipt details

---

### 3.2 Financial Dashboard (Home)

The dashboard provides an at-a-glance overview of the user's financial status.

| Element | Description |
|---------|-------------|
| **Current Month Balance** | Prominently displayed net balance (income - expenses) |
| **Income Summary** | Total income for the current month |
| **Expense Summary** | Total expenses for the current month |
| **Recent Transactions** | Quick view of the last 5 transactions |
| **Quick Actions** | One-tap access to view all transactions |

**User Benefits:**
- Instant understanding of financial health
- No need to navigate through multiple screens
- Real-time sync with Telegram transactions

---

### 3.3 Transaction Management

A comprehensive transaction list with powerful filtering and search capabilities.

| Feature | Description |
|---------|-------------|
| **Transaction List** | Chronological view of all income and expenses |
| **Search** | Full-text search across transaction notes |
| **Type Filter** | Filter by income, expense, or all |
| **Category Filter** | Filter by specific categories |
| **Date Range Filter** | View transactions within specific time periods |
| **Infinite Scroll** | Smooth loading of transaction history |
| **Transaction Details** | Tap any transaction to view/edit details |

**User Experience Highlights:**
- Clean, card-based transaction display
- Color-coded income (green) vs expenses (red)
- Category icons for visual recognition
- Quick identification of spending patterns

---

### 3.4 Comprehensive Analytics

Visualize financial data through interactive charts and metrics.

#### Summary Cards
| Metric | Description |
|--------|-------------|
| **Balance (Saldo)** | Net financial position |
| **Income (Pemasukan)** | Total money received |
| **Expenses (Pengeluaran)** | Total money spent |

#### Time Period Selection
| Period | Description |
|--------|-------------|
| Last 7 Days | Quick weekly snapshot |
| Last 30 Days | Monthly overview |
| Last 3 Months | Quarterly trends |
| Last 6 Months | Half-year analysis |
| All Time | Complete financial history |

#### Chart Types

**Daily Spending Chart**
- Interactive line/bar chart showing daily spending patterns
- Identify high-spending days
- Spot trends and anomalies

**Category Breakdown Chart**
- Pie/donut chart visualization
- See which categories consume the most money
- Percentage breakdown of each category
- Color-coded by category

**Monthly Comparison** *(Coming Soon)*
- Compare income vs expenses month-over-month
- Track financial progress over time

---

### 3.5 Jolt AI Insights

Personalized, AI-generated financial recommendations based on spending patterns.

| Insight Type | Example |
|--------------|---------|
| **Spending Trends** | *"Your spending increased 15% compared to last month"* |
| **Category Analysis** | *"Food & Dining accounts for 45% of your expenses"* |
| **Income Patterns** | *"Average monthly income is Rp 5,000,000"* |
| **Savings Suggestions** | *"Consider reducing entertainment spending to save more"* |
| **Anomaly Detection** | *"Unusual high spending detected in Transportation"* |

**How It Works:**
1. AI analyzes transaction history
2. Identifies patterns and anomalies
3. Generates 3-5 personalized insights
4. Updates regularly as new data comes in

---

### 3.6 Category Management

Flexible category system with both default and custom options.

| Feature | Description |
|---------|-------------|
| **Default Categories** | Pre-built categories for common expenses and income |
| **Custom Categories** | Create personalized categories with custom names |
| **Icon Selection** | Choose from hundreds of icons for visual recognition |
| **Category Types** | Separate categories for income and expenses |
| **Search & Filter** | Find categories quickly |
| **CRUD Operations** | Create, edit, and delete custom categories |

**Default Category Examples:**
- 🍽️ Food & Dining
- 🚗 Transportation
- 🛒 Shopping
- 💰 Salary
- 💳 Bills & Utilities
- 🎮 Entertainment

---

### 3.7 Data Export

Export transaction data for external analysis or record-keeping.

| Feature | Description |
|---------|-------------|
| **Excel Format** | Export to .xlsx file |
| **Filter Options** | Export by type, category, or date range |
| **Summary Sheet** | Optional summary statistics sheet |
| **Date-Stamped Files** | Automatic filename with export date |

---

### 3.8 User Profile & Settings

Account management and preferences.

| Feature | Description |
|---------|-------------|
| **Profile Display** | Username and Telegram information |
| **Membership Status** | View current tier (FREE/PRO) |
| **Theme Toggle** | Switch between dark and light mode |
| **Category Management** | Quick access to customize categories |
| **Export Data** | Access data export functionality |
| **Data Reset** | Option to clear all transaction data |

---

## 4. User Experience Design

### 4.1 Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Mobile-First** | Optimized for smartphone screens with touch-friendly interactions |
| **Minimal Input** | Reduce taps and typing through smart defaults |
| **Visual Clarity** | Color-coded categories, clear typography, spacious layouts |
| **Instant Feedback** | Real-time updates and toast notifications |
| **Dark Mode** | Eye-friendly dark theme option |

### 4.2 Navigation

**Bottom Navigation Bar** (Mobile)
- 🏠 Home – Dashboard overview
- 📝 Transactions – Full transaction list
- 📊 Analytics – Charts and insights
- 👤 Profile – Settings and account

### 4.3 Interaction Patterns

| Pattern | Usage |
|---------|-------|
| **Cards** | Transaction items, summary stats, category items |
| **Modals** | Forms for editing, confirmations |
| **Drawers** | Filter panels, additional options |
| **Toasts** | Success/error feedback |
| **Skeleton Loading** | Smooth loading states |
| **Infinite Scroll** | Seamless list loading |

---

## 5. Subscription Tiers

### 5.1 FREE Tier

| Feature | Availability |
|---------|-------------|
| Text-based tracking | ✅ Unlimited |
| Voice-based tracking | ⚠️ 3 messages/day |
| Image/Receipt scanning | ❌ Not available |
| Dashboard access | ✅ Full access |
| Transaction history | ⚠️ Last 7 days only |
| Basic analytics | ✅ 7-day charts |
| Default categories | ✅ All defaults |
| Custom categories | ❌ Not available |
| Dark/Light mode | ✅ Available |

### 5.2 PRO Tier

| Feature | Availability |
|---------|-------------|
| Everything in FREE | ✅ Included |
| Text-based tracking | ✅ Unlimited |
| Voice-based tracking | ✅ Unlimited |
| Image/Receipt scanning | ✅ Full OCR support |
| Full transaction history | ✅ Unlimited access |
| Extended analytics | ✅ 30 days, 3 months, 6 months, all time |
| Custom categories | ✅ Create personalized categories |
| Jolt AI Insights | ✅ Personalized recommendations |
| Data export | ✅ Excel export |
| Priority support | ✅ Included |

### 5.3 PRO Feature Gating

When FREE users attempt to access PRO features:
- Blurred preview of the content
- Clear "PRO Required" messaging
- One-tap upgrade prompt
- Smooth visual overlay

---

## 6. Authentication & Security

### 6.1 Telegram Authentication

| Feature | Description |
|---------|-------------|
| **One-Click Login** | No passwords to remember |
| **Secure OAuth** | Industry-standard Telegram OAuth flow |
| **Session Management** | Encrypted session tokens |
| **Cross-Device Sync** | Same account, any device |

### 6.2 Data Protection

| Measure | Implementation |
|---------|----------------|
| **Encrypted Storage** | All data encrypted at rest |
| **Secure Transport** | HTTPS for all communications |
| **User Isolation** | Complete data separation between users |
| **Data Ownership** | Users can export or delete all their data |

---

## 7. Future Roadmap

### Phase 1: Core Enhancements
- [ ] Budget planning and alerts
- [ ] Recurring transactions
- [ ] Multi-currency support

### Phase 2: Advanced Features
- [ ] Shared household budgets
- [ ] Receipt image scanning (OCR)
- [ ] Bank account integration

### Phase 3: Intelligence Upgrades
- [ ] Predictive spending analysis
- [ ] Smart budget recommendations
- [ ] Savings goal tracking

---

## 8. Success Metrics

### User Engagement
| Metric | Target |
|--------|--------|
| Daily Active Users (DAU) | Growth of 10% MoM |
| Transactions per user/week | 5+ |
| Dashboard visits/week | 3+ |

### Feature Adoption
| Metric | Target |
|--------|--------|
| AI categorization accuracy | >90% |
| PRO conversion rate | >5% of active users |
| Custom category creation | >50% of users |

### User Satisfaction
| Metric | Target |
|--------|--------|
| App Store rating | 4.5+ stars |
| Feature request completion | 2+ per month |
| Support response time | <24 hours |

---

## 9. Appendix

### A. Glossary

| Term | Definition |
|------|------------|
| **Transaction** | Any financial activity (income or expense) |
| **Category** | Classification bucket for transactions |
| **Insight** | AI-generated financial observation or recommendation |
| **Tier** | Subscription level (FREE or PRO) |

### B. Related Documents

- [README.md](../README.md) – Technical setup and documentation
- [LICENSE](../LICENSE) – MIT License terms

---

<p align="center">
  <strong>Jolt AI</strong> – Making personal finance management effortless ⚡
</p>
