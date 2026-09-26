# Use Case Specification: View Company Dashboard

**UC ID and Name:** UC-DASH-01 - View Company Dashboard
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin logs into the system or accesses the `/dashboard` page.

**Description:**
The Company Admin views aggregate operational metrics, including active guards on shift, active contracts, pending incident reports, customer review ratings, weekly shift trend charts, today's guard list, and recent system activities.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Company Admin role permissions and an active account status.
- **PRE-02:** The user account is associated with an active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system renders the company dashboard with real-time operational KPI cards, charts, and activity logs.
- **POST-02:** If retrieval fails, the system displays error state notices for affected data widgets.

**Normal Flow (Luồng sự kiện chính):**
**A. View Company Dashboard Successfully**

1. The Company Admin accesses the Dashboard page (`/dashboard`).
2. The system verifies Company Admin authentication, role permissions, and active company context.
3. The system retrieves dashboard operational metrics (active guards, active contracts, pending incident reports, average rating, SaaS subscription status), weekly shift trend charts, today's guard roster, and recent activity logs.
4. The system renders the dashboard interface displaying summary KPI cards, trend charts, guard roster table, and activity feed.
5. The Company Admin inspects operational metrics and system status.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Refresh dashboard metrics**
1. The Company Admin clicks the "Làm mới" (Refresh) button.
2. The system re-fetches and updates all dashboard metric widgets.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during dashboard data retrieval
  1. An API error occurs while fetching operational metrics.
  2. The system displays error notices on affected widgets while keeping the page layout accessible.
  3. The use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
