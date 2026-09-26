# Use Case Specification: Ban Account

**UC ID and Name:** UC-ACCT-01 - Ban Account
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** System Admin
**Secondary Actors:** None

**Trigger:**
The System Admin clicks the "Khóa tài khoản" (Ban Account) button on an active user account detail page (`/accounts/[userId]`).

**Description:**
The System Admin restricts user access by banning an active account profile, requiring a mandatory justification reason, and updating account status in the database.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with System Admin role permissions and an active account status.
- **PRE-02:** The target user account exists and currently has an active account status.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system updates the target account status to "Banned", records the ban justification reason, displays a success toast notification, and renders a banned alert banner.
- **POST-02:** If the ban operation fails, the system displays an error notification and account status remains unchanged.

**Normal Flow (Luồng sự kiện chính):**
**A. Ban Account Successfully**

1. The System Admin views the Account Detail page (`/accounts/[userId]`).
2. The System Admin clicks the "Khóa tài khoản" (Ban Account) button.
3. The system opens the ban confirmation modal, displaying warning text and a mandatory reason input field.
4. The System Admin enters a justification reason for locking the account.
5. The System Admin clicks the "Xác nhận" (Confirm) button.
6. The system validates the justification reason, updates account status to "Banned" in the database, displays a success toast notification ("Khóa tài khoản thành công!"), closes the modal, and renders a red banned alert banner displaying the ban reason.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Cancel account ban**
1. The System Admin clicks the "Hủy" (Cancel) button before confirming.
2. The system clears the reason input and closes the modal without altering account status.

**A.4b Missing ban justification reason**
1. The System Admin clicks "Xác nhận" without entering a ban reason.
2. The system displays an inline validation error ("Vui lòng nhập lý do khóa tài khoản").
3. The System Admin enters a valid reason and returns to step A.5.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during account ban
  1. An API error occurs while processing the ban request.
  2. The system displays an error notification ("Không thể khóa tài khoản") and keeps the modal open for retry.
  3. The use case ends.

**Priority:** High
**Frequency of Use:** Low
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
