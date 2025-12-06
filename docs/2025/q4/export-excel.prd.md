# PRD: Export to Excel

> **Target Release:** December 2025  
> **Priority:** High  
> **Status:** Implemented

---

## 1. Overview

### Problem Statement

Users need to export their financial data for external analysis, tax reporting, backup, or sharing with accountants. Currently, there's no way to export transaction data from Jolt.

### Solution

Provide an export feature that generates Excel (.xlsx) files containing transaction data with customizable filters and formatting.

### Success Metrics

| Metric | Target |
|--------|--------|
| Export feature usage | > 20% of monthly active users |
| Export success rate | > 99% |
| Average export time | < 5 seconds for up to 10,000 records |

---

## 2. User Stories

| ID | Story | Priority |
|----|-------|----------|
| EX-001 | As a user, I want to export all my transactions to Excel | **High** |
| EX-002 | As a user, I want to filter transactions before exporting (by date range, category, type) | **High** |
| EX-003 | As a user, I want the export to include category names and formatted dates | **Medium** |
| EX-004 | As a user, I want to export summary statistics alongside transaction data | **Low** |
| EX-005 | As a user, I want to download the export directly to my device | **High** |

---

## 3. Functional Requirements

### 3.1 Export Options

| Requirement | Description |
|-------------|-------------|
| **FR-EX-001** | Export generates .xlsx file format |
| **FR-EX-002** | Users can filter by date range before export |
| **FR-EX-003** | Users can filter by transaction type (income/expense/all) |
| **FR-EX-004** | Users can filter by categories (single or multiple) |
| **FR-EX-005** | Maximum export limit: 50,000 transactions |

### 3.2 Export Content

| Requirement | Description |
|-------------|-------------|
| **FR-EX-010** | Export includes: Date, Type, Category, Amount, Note |
| **FR-EX-011** | Dates formatted as YYYY-MM-DD |
| **FR-EX-012** | Amounts formatted as numbers (no currency symbol) |
| **FR-EX-013** | Header row with column names |
| **FR-EX-014** | Optional summary sheet with totals |

### 3.3 Download Experience

| Requirement | Description |
|-------------|-------------|
| **FR-EX-020** | File downloads directly to user's device |
| **FR-EX-021** | Filename format: `jolt-transactions-{YYYY-MM-DD}.xlsx` |
| **FR-EX-022** | Show progress indicator for large exports |
| **FR-EX-023** | Display success message with file size |

---

## 4. Technical Design

### 4.1 Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│  API Route  │────▶│   ExcelJS   │
│  (Button)   │     │  /export    │     │  Generator  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │  Query      │
                    └─────────────┘
```

### 4.2 Dependencies

```json
{
  "exceljs": "^4.4.0"
}
```

### 4.3 API Endpoint

```http
GET /api/transactions/export
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `startDate` | string | Filter start date (YYYY-MM-DD) |
| `endDate` | string | Filter end date (YYYY-MM-DD) |
| `type` | string | 'income', 'expense', or 'all' |
| `categories` | string | Comma-separated category IDs |
| `includeSummary` | boolean | Include summary sheet |

**Response:**
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="jolt-transactions-2025-12-06.xlsx"`

### 4.4 Excel Structure

**Sheet 1: Transactions**

| Date | Type | Category | Amount | Note |
|------|------|----------|--------|------|
| 2025-12-01 | expense | Food & Dining | 50000 | Lunch at restaurant |

**Sheet 2: Summary (optional)**

| Metric | Value |
|--------|-------|
| Total Transactions | 150 |
| Total Income | 5000000 |
| Total Expenses | 3500000 |
| Net Balance | 1500000 |
| Date Range | 2025-01-01 to 2025-12-06 |

---

## 5. UI/UX Design

### 5.1 Export Button Location

- **Primary:** Profile page (below user info)
- **Secondary:** N/A

### 5.2 Export Modal

```
┌─────────────────────────────────────┐
│  📊 Export Transactions             │
├─────────────────────────────────────┤
│                                     │
│  Date Range                         │
│  [Start Date] ─ [End Date]         │
│                                     │
│  Transaction Type                   │
│  ○ All  ● Income  ○ Expense        │
│                                     │
│  Categories                         │
│  [Select categories... ▼]          │
│                                     │
│  ☑ Include summary sheet           │
│                                     │
├─────────────────────────────────────┤
│  [Cancel]              [📥 Export] │
└─────────────────────────────────────┘
```

### 5.3 States

| State | UI |
|-------|-----|
| Default | Show export modal |
| Loading | Disable button, show spinner, "Generating..." |
| Success | Toast: "Export complete! (245 KB)" |
| Error | Toast: "Export failed. Please try again." |

---

## 6. Edge Cases & Error Handling

| Scenario | Handling |
|----------|----------|
| No transactions in date range | Show message, disable export button |
| Export timeout (> 30s) | Show error, suggest smaller date range |
| Browser blocks download | Show fallback download link |
| User not authenticated | Redirect to login |

---

## 7. Testing Plan

### Unit Tests
- Excel file generation
- Filter logic
- Date formatting

### Integration Tests
- API returns valid Excel file
- Filters applied correctly
- Large dataset handling

### Manual Tests
- Download works on mobile browsers
- File opens correctly in Excel, Google Sheets, LibreOffice

---

## 8. Rollout Plan

1. **Phase 1**: Add ExcelJS dependency, create export API
2. **Phase 2**: Build export modal UI
3. **Phase 3**: Add optional summary sheet
4. **Phase 4**: Performance optimization for large exports
5. **Phase 5**: Add to Analytics page
