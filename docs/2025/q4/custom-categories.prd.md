# PRD: Custom Categories

> **Target Release:** December 2025  
> **Priority:** High  
> **Status:** Completed

---

## 1. Overview

### Problem Statement

Currently, Jolt uses predefined categories (Food, Transport, Salary, etc.) for transaction classification. Users cannot create their own categories, limiting personalization. Additionally, the AI must be able to understand and correctly categorize transactions even when users use custom category names.

### Solution

Enable users to create, manage, and use custom categories while ensuring the LLM-powered categorization system can intelligently recognize and map transactions to these custom categories.

### Success Metrics

| Metric | Target |
|--------|--------|
| Custom category adoption rate | > 40% of active users |
| LLM categorization accuracy for custom categories | > 85% |
| User satisfaction with categorization | > 4/5 rating |

---

## 2. User Stories

| ID | Story | Priority |
|----|-------|----------|
| CC-001 | As a user, I want to create custom categories so I can organize transactions my way | **High** |
| CC-002 | As a user, I want to assign icons and colors to my custom categories | **Medium** |
| CC-003 | As a user, I want the Telegram bot to recognize my custom categories when I log expenses | **High** |
| CC-004 | As a user, I want to edit or delete my custom categories | **Medium** |
| CC-005 | As a user, I want to see my custom categories in the analytics breakdown | **High** |
| CC-006 | As a user, I want to merge a custom category with another category | **Low** |

---

## 3. Functional Requirements

### 3.1 Category Management

| Requirement | Description |
|-------------|-------------|
| **FR-CC-001** | Users can create custom categories with name, description, type (income/expense), and optional icon |
| **FR-CC-002** | Users can edit existing custom categories |
| **FR-CC-003** | Users can delete custom categories (with option to reassign transactions) |
| **FR-CC-004** | System prevents duplicate category names per user |
| **FR-CC-005** | Maximum 50 custom categories per user |

### 3.2 LLM Integration

| Requirement | Description |
|-------------|-------------|
| **FR-CC-010** | n8n workflow fetches user's custom categories before processing transactions |
| **FR-CC-011** | LLM prompt includes user's custom categories with descriptions |
| **FR-CC-012** | LLM can match transaction descriptions to custom categories |
| **FR-CC-013** | System falls back to default categories if no custom match found |
| **FR-CC-014** | System learns from user corrections to improve future categorization |

### 3.3 Dashboard Integration

| Requirement | Description |
|-------------|-------------|
| **FR-CC-020** | Custom categories appear in category filter dropdown |
| **FR-CC-021** | Custom categories appear in analytics breakdown chart |
| **FR-CC-022** | Custom categories can be selected when manually adding transactions |
| **FR-CC-023** | Category management UI accessible from Profile/Settings page |

---

## 4. Technical Design

### 4.1 Database Schema Changes

```sql
-- Modify categories table to support user-specific categories
ALTER TABLE categories ADD COLUMN user_id UUID REFERENCES users(id);
ALTER TABLE categories ADD COLUMN is_default BOOLEAN DEFAULT false;

-- Add index for efficient queries
CREATE INDEX idx_categories_user ON categories(user_id);
```

### 4.2 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/categories` | GET | List all categories (default + user's custom) |
| `/api/categories` | POST | Create custom category |
| `/api/categories/:id` | PUT | Update custom category |
| `/api/categories/:id` | DELETE | Delete custom category |
| `/api/icons` | GET | List available Solar icons (outline collection) |

### 4.3 LLM Prompt Enhancement

```
User's Custom Categories:
{{#each customCategories}}
- {{name}}: {{description}} ({{type}})
{{/each}}

When categorizing, prefer user's custom categories if they match the transaction description.
```

---

## 5. UI/UX Design

### 5.1 Category Management Page

- Accessible from Profile → Manage Categories
- List view showing all custom categories with icons
- "Add Category" button triggers a **Side Drawer**
- Edit/Delete actions per category
- Search/filter by category type and source (Default vs Custom)

### 5.2 Category Creation Form (Drawer)

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Name | Text | ✅ | 2-50 chars, unique per user |
| Description | Text | ✅ | Max 200 chars |
| Type | Radio/Select | ✅ | income / expense |
| Icon | **Icon Picker** | ❌ | Visual picker using Solar "Outline" icons |

---

## 6. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| Delete category with existing transactions | Transactions preserved but category link might break (TODO: reassign feature) |
| LLM cannot match to any category | Use "Other" default category |
| Category name conflicts with default | Allow but warn user |
| User hits 50 category limit | Show error, suggest deleting unused |

---

## 7. Testing Plan

### Unit Tests
- Category CRUD operations
- Validation logic
- Permission checks (users can only manage their own categories)

### Integration Tests
- LLM correctly categorizes with custom categories
- Categories appear correctly in analytics
- Filter by custom category works

### E2E Tests
- Create category → Use in Telegram → View in dashboard flow

---

## 8. Rollout Plan

1. **Phase 1**: Database migration, API endpoints
2. **Phase 2**: Category management UI
3. **Phase 3**: LLM integration in n8n workflow
4. **Phase 4**: Analytics integration
5. **Phase 5**: Beta testing with select users
