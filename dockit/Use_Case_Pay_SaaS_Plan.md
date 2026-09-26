# Use Case Specification: Pay SaaS Plan

**UC ID and Name:** UC-BILL-02 - Pay SaaS Plan
**Created By:** Haund
**Date Created:** 14/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** SePay (Payment Gateway), Third-party Bank

**Trigger:**
The Company Admin selects the payment option for a SaaS plan or accesses a pending payment transaction.

**Description:**
The Company Admin completes a SaaS plan subscription payment using bank transfer via a dynamically generated payment QR code. The system automatically verifies the payment status (via SePay webhook or polling) and allows manual verification, updating the company's active subscription status upon success.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system. [Refer to **BR-01**]
- **PRE-02:** The user has the role of Company Admin. [Refer to **BR-38**]
- **PRE-03:** A pending payment transaction for the selected plan has been initiated. [Refer to **BR-47**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The payment status transitions to `completed`.
- **POST-02:** The company's subscription plan is activated/updated. [Refer to **BR-02**, **BR-03**, **BR-48**]
- **POST-03:** The user is redirected to the payment success page.
- **POST-04:** If the payment remains pending, the transaction status remains unchanged.

**Normal Flow (Luồng sự kiện chính):**
**A. Pay SaaS Plan Successfully**

1. The Company Admin accesses the payment page for a selected SaaS plan.
2. The system retrieves and displays the order summary, plan features, pricing, and bank account information.
3. The system dynamically generates and displays a payment QR code containing the correct amount and transaction code.
4. The system starts an automatic background polling loop (every 5 seconds) to check the payment status.
5. The Company Admin scans the QR code and completes the transfer via their mobile banking app.
6. The polling API detects that the payment status has changed to `completed`.
7. The system stops polling and redirects the user to the Payment Success page.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4 Manual Verification**
1. The Company Admin clicks the "Tôi đã thanh toán" (Confirm complete payment) button.
2. The system calls the API to verify the transaction status immediately.
3. If the payment is completed, the system redirects the user to the Payment Success page; otherwise, it displays an error message. [Refer to **MSG116**]

**A.6 Payment is already completed**
1. If the Company Admin accesses the page and the payment is already completed, the system redirects them to the Billing Management page.

**Exceptions (Ngoại lệ):**

- **EX-01:** API or Network Error during status check
  1. The system displays a connection error toast. [Refer to **MSG117**]
  2. The page remains active, allowing the polling to retry or the user to manually verify.

**Priority:** High
**Frequency of Use:** Low (Typically once per subscription cycle)
**Business Rules:** BR-01, BR-02, BR-03, BR-38, BR-47, BR-48
**Other Information:** N/A
**Assumptions:** N/A
