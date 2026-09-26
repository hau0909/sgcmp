# Use Case Specification: View Subscription Payments

**UC ID and Name:** UC-BILL-02 - View Subscription Payments
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** System Admin
**Secondary Actors:** None

**Trigger:**
The System Admin selects the "Lịch sử thanh toán" (Payment History) menu option or accesses the `/payment-history` page.

**Description:**
The System Admin views company SaaS subscription payment history records across all tenant security companies, inspecting total revenue KPIs, transaction status breakdowns (Completed, Pending, Failed), and payment method details.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with System Admin role permissions and an active account status.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays aggregate revenue KPI cards and the paginated subscription payment transaction table.
- **POST-02:** If retrieval fails, the system displays an error message and no payment history is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Subscription Payment History Successfully**

1. The System Admin accesses the Subscription Payment History page (`/payment-history`).
2. The system verifies System Admin authentication and role permissions.
3. The system retrieves subscription payment records across all security companies.
4. The system renders the payment history dashboard showing summary KPI cards (Total Revenue, Success Transactions, Pending Transactions, Failed Transactions), payment transactions table, and pagination controls.
5. The System Admin inspects transaction details and revenue metrics.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Navigate table pagination**
1. The System Admin clicks Previous, Next, or page number controls.
2. The system displays payment records for the target page index.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during payment data retrieval
  1. An API error occurs while fetching payment history records.
  2. The system displays an error message ("Không thể tải lịch sử thanh toán").
  3. The use case ends.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
