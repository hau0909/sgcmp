# Use Case Specification: View Guard Performance

**UC ID and Name:** UC-GUARD-05 - View Guard Performance
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator clicks the "Hiệu suất Nhân viên" (Guard Performance) menu option or accesses the `/guard-performance` page.

**Description:**
The Coordinator analyzes and monitors work performance metrics for company security guards, inspecting overall attendance KPIs (on-time rate, completion rate, late check-in rate, absent rate, replacement rate), radar performance charts, and individual guard ranking lists over selectable date ranges.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The Coordinator is associated with an active security company profile.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays company-wide or single-guard performance KPI cards, radar charts, and guard ranking lists for the selected time range.
- **POST-02:** If retrieval fails, the system displays error state notices and no performance data is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Guard Performance Metrics Successfully**

1. The Coordinator accesses the Guard Performance page (`/guard-performance`).
2. The system verifies Coordinator authentication, role permissions, and active company context.
3. The system retrieves overall performance summary KPIs and guard performance rankings for the active date range.
4. The system renders the performance dashboard displaying summary metric cards (On Time, Completed, Late Check-in, Absent, Replacement rates), radar performance chart, date range picker controls, and guard ranking table.
5. The Coordinator inspects performance metrics and analytics charts.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Select date range or quick preset**
1. The Coordinator opens the date range calendar picker and selects a preset (Hôm nay, 7 ngày qua, 30 ngày qua, Tháng này, Tháng trước) or custom date range.
2. The Coordinator clicks "Áp dụng" (Apply).
3. The system recalculates and updates summary metrics, radar charts, and guard performance lists for the new date scope.

**A.4b Filter guard list by category tabs or search query**
1. The Coordinator toggles between "Tất cả" (All) and "Top 10" tabs or enters a keyword in the search bar.
2. The system filters and displays matching guard performance records.

**A.4c Inspect individual guard performance details**
1. The Coordinator selects a specific guard row from the performance table.
2. The system filters summary KPIs and radar charts to display metrics exclusively for the selected guard.

**A.4d Reset view to company overview**
1. The Coordinator clicks "Xem tổng quan toàn công ty" (View Company Overview).
2. The system clears single-guard filtering and restores company-wide aggregate metrics.

**A.4e Refresh performance data**
1. The Coordinator clicks the "Làm mới" (Refresh) button.
2. The system re-fetches real-time performance summary and guard list data.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during performance data retrieval
  1. An API error occurs while fetching performance metrics.
  2. The system displays an error notice and clears chart loading states.
  3. The use case ends.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
