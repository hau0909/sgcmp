# Use Case Specification: View Admin Dashboard

**UC ID and Name:** UC-DASH-03 - View Admin Dashboard
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** System Admin
**Secondary Actors:** None

**Trigger:**
The System Admin logs into the system or accesses the `/admin` page.

**Description:**
The System Admin views aggregate system metrics, company growth charts, SaaS subscription plan distributions, pending company verification requests, and recent system activities across all tenant companies.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with System Admin role permissions and an active account status.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays system-wide KPI summary cards, analytics charts, pending verification tables, and recent activity logs.
- **POST-02:** If retrieval fails, the system displays error state notices on affected widgets.

**Normal Flow (Luồng sự kiện chính):**
**A. View Admin Dashboard Successfully**

1. The System Admin accesses the Admin Dashboard page (`/admin`).
2. The system verifies System Admin authentication and role permissions.
3. The system retrieves system-wide operational metrics (Total Companies, Active Guards, Total Revenue, Active Subscription Plans), company growth charts, SaaS plan distributions, pending company approval requests, and recent activity logs.
4. The system renders the admin dashboard displaying KPI summary cards, growth line charts, subscription plan distribution pie charts, pending tasks table, and activity feed.
5. The System Admin inspects system performance and pending administrative tasks.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Filter dashboard metrics by time range**
1. The System Admin selects a time range filter (Tuần này, Tháng này, Năm nay).
2. The system recalculates and updates growth charts and KPI metrics.

**A.4b Refresh dashboard data**
1. The System Admin clicks the "Làm mới" (Refresh) button.
2. The system re-fetches real-time metrics across all system widgets.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during metric retrieval
  1. An API error occurs while fetching system metrics.
  2. The system displays error notices on affected widgets while keeping the main page accessible.
  3. The use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
