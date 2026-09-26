# Use Case Specification: View Coordinator Dashboard

**UC ID and Name:** UC-DASH-02 - View Coordinator Dashboard
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator logs into the system or accesses the `/coor-dashboard` page.

**Description:**
The Coordinator views real-time shift monitoring metrics, incident report statistics, past shift history, guard performance radar distribution, available guard lists, and accesses shift creation controls.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator role permissions and an active account status.
- **PRE-02:** The Coordinator is linked to an active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays real-time shift monitoring widgets, guard availability lists, and operational statistics.
- **POST-02:** If retrieval fails, the system displays error state notices for affected widgets.

**Normal Flow (Luồng sự kiện chính):**
**A. View Coordinator Dashboard Successfully**

1. The Coordinator accesses the Coordinator Dashboard page (`/coor-dashboard`).
2. The system verifies Coordinator authentication, role permissions, and active company context.
3. The system retrieves live shift monitoring data, incident report counts, past shift records, available guard lists, and guard performance radar metrics.
4. The system renders the dashboard interface displaying summary KPI cards, shift monitoring tables, radar charts, and quick action buttons.
5. The Coordinator inspects live shift operations and guard status.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Refresh dashboard data**
1. The Coordinator clicks the "Làm mới" (Refresh) button.
2. The system re-fetches and updates all live dashboard metrics.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during dashboard data retrieval
  1. An API error occurs while fetching operational metrics.
  2. The system displays error notices on affected widgets while maintaining overall layout access.
  3. The use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
