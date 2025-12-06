# PRD: Budget Setting & Tracking

> **Target Release:** December 2025  
> **Priority:** High  
> **Status:** Planned

---

## 1. Overview

### Problem Statement

Users can track their expenses but have no way to set spending limits or budgets. Without budget goals, users lack context for whether their spending is healthy or excessive.

### Solution

Enable users to set monthly budgets (overall or per-category) and track spending against these limits with visual progress indicators and optional alerts.

### Success Metrics

| Metric | Target |
|--------|--------|
| Budget feature adoption | > 50% of active users set at least one budget |
| Users staying within budget | > 60% |
| Budget alert engagement | > 30% click-through on alerts |

---

## 2. User Stories

| ID | Story | Priority |
|----|-------|----------|
| BT-001 | As a user, I want to set a total monthly spending budget | **High** |
| BT-002 | As a user, I want to set budgets for specific categories | **High** |
| BT-003 | As a user, I want to see how much of my budget I've used | **High** |
| BT-004 | As a user, I want to receive alerts when approaching my budget limit | **Medium** |
| BT-005 | As a user, I want to see budget vs actual on my dashboard | **High** |
| BT-006 | As a user, I want to view my budget performance over past months | **Medium** |
| BT-007 | As a user, I want the bot to warn me when a transaction exceeds my remaining budget | **Medium** |

---

## 3. Functional Requirements

### 3.1 Budget Management

| Requirement | Description |
|-------------|-------------|
| **FR-BT-001** | Users can set a total monthly expense budget |
| **FR-BT-002** | Users can set individual budgets per category |
| **FR-BT-003** | Users can edit or delete existing budgets |
| **FR-BT-004** | Budgets reset automatically at the start of each month |
| **FR-BT-005** | Users can set budgets for custom categories |

### 3.2 Budget Tracking

| Requirement | Description |
|-------------|-------------|
| **FR-BT-010** | System calculates spent amount vs budget in real-time |
| **FR-BT-011** | System shows percentage of budget used |
| **FR-BT-012** | System shows remaining budget amount |
| **FR-BT-013** | Progress bar visualization with color coding (green → yellow → red) |
| **FR-BT-014** | Track budget performance across multiple months |

### 3.3 Alerts & Notifications

| Requirement | Description |
|-------------|-------------|
| **FR-BT-020** | Optional alert at 50%, 75%, 90%, and 100% of budget |
| **FR-BT-021** | Alerts sent via Telegram bot |
| **FR-BT-022** | Users can configure alert thresholds |
| **FR-BT-023** | Bot warns if a new transaction would exceed remaining budget |

### 3.4 Dashboard Integration

| Requirement | Description |
|-------------|-------------|
| **FR-BT-030** | Dashboard shows overall budget progress |
| **FR-BT-031** | Category breakdown shows budget for each category |
| **FR-BT-032** | Visual indicator when budget is exceeded (over-budget) |

---

## 4. Technical Design

### 4.1 Database Schema

```sql
CREATE TABLE budgets (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL NOT NULL,
  period VARCHAR(20) DEFAULT 'monthly',
  alert_thresholds INTEGER[] DEFAULT '{50, 75, 90, 100}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- NULL category_id means total budget
  UNIQUE(user_id, category_id)
);

CREATE INDEX idx_budgets_user ON budgets(user_id);
```

### 4.2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/budgets` | GET | List user's budgets with current spending |
| `/api/budgets` | POST | Create new budget |
| `/api/budgets/:id` | PUT | Update budget |
| `/api/budgets/:id` | DELETE | Delete budget |
| `/api/budgets/summary` | GET | Get overall budget status |

### 4.3 Budget Status Response

```json
{
  "data": {
    "totalBudget": {
      "amount": 5000000,
      "spent": 3200000,
      "remaining": 1800000,
      "percentage": 64,
      "status": "on-track"
    },
    "categoryBudgets": [
      {
        "categoryId": 1,
        "categoryName": "Food & Dining",
        "amount": 1500000,
        "spent": 1200000,
        "remaining": 300000,
        "percentage": 80,
        "status": "warning"
      }
    ]
  }
}
```

### 4.4 Status Definitions

| Status | Condition | Color |
|--------|-----------|-------|
| `on-track` | < 75% used | Green |
| `warning` | 75-90% used | Yellow |
| `critical` | 90-100% used | Orange |
| `exceeded` | > 100% used | Red |

---

## 5. UI/UX Design

### 5.1 Budget Overview Card (Dashboard)

```
┌─────────────────────────────────────┐
│  📊 Monthly Budget                  │
├─────────────────────────────────────┤
│                                     │
│  Rp 3,200,000 / Rp 5,000,000       │
│  ████████████████░░░░░░░ 64%       │
│                                     │
│  Rp 1,800,000 remaining            │
│  25 days left this month           │
│                                     │
└─────────────────────────────────────┘
```

### 5.2 Category Budget List

```
┌─────────────────────────────────────┐
│  🍽️ Food & Dining                  │
│  Rp 1,200,000 / Rp 1,500,000       │
│  ██████████████████░░░ 80% ⚠️      │
├─────────────────────────────────────┤
│  🚗 Transportation                  │
│  Rp 400,000 / Rp 800,000           │
│  ██████████░░░░░░░░░░░ 50%         │
├─────────────────────────────────────┤
│  🛒 Shopping                        │
│  Rp 900,000 / Rp 700,000           │
│  █████████████████████ 128% 🔴     │
│  Rp 200,000 over budget            │
└─────────────────────────────────────┘
```

### 5.3 Budget Settings Page

- Accessible from Profile → Budget Settings
- Toggle to enable/disable total budget
- Set total monthly budget amount
- List of categories with optional budget for each
- Alert preferences toggle

### 5.4 Budget Creation Modal

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Type | Radio | ✅ | Total / Category |
| Category | Select | If category | Select category to budget |
| Amount | Number | ✅ | Budget amount |
| Enable Alerts | Toggle | ❌ | Send notifications |

---

## 6. Telegram Bot Integration

### 6.1 Budget Warnings

When user logs an expense that puts them near/over budget:

```
💸 -Rp 150,000 Food & Dining

⚠️ Budget Alert: You've used 85% of your Food & Dining budget this month.
Remaining: Rp 225,000
```

### 6.2 Proactive Alerts

Daily/weekly summary via bot:

```
📊 Weekly Budget Update

Total Budget: 68% used (Rp 3,400,000 / Rp 5,000,000)

⚠️ Categories approaching limit:
- Food & Dining: 85%
- Entertainment: 78%

✅ Categories on track:
- Transportation: 45%
- Bills: 50%
```

---

## 7. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| No budget set | Show "Set Budget" CTA on dashboard |
| Budget exceeded mid-month | Show exceeded status, allow continued tracking |
| Delete category with budget | Delete associated budget |
| New month starts | Auto-reset spent amount, keep budget settings |
| User changes budget mid-month | Apply immediately, recalculate status |

---

## 8. Testing Plan

### Unit Tests
- Budget CRUD operations
- Percentage and remaining calculations
- Status determination logic

### Integration Tests
- Budget updates when transaction added
- Month rollover behavior
- Alert triggering at thresholds

### E2E Tests
- Set budget → Add expenses → View dashboard → Receive alerts flow

---

## 9. Rollout Plan

1. **Phase 1**: Database schema, API endpoints, budget CRUD
2. **Phase 2**: Dashboard budget overview card
3. **Phase 3**: Category-level budgets and list view
4. **Phase 4**: Budget settings page
5. **Phase 5**: Telegram bot alerts integration
6. **Phase 6**: Historical budget performance view
