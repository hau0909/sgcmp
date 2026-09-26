# Use Case Specification: Complete Contract (Customer)

**UC ID and Name:** UC-CTR-01 - Complete Contract (Customer)
**Created By:** Haund
**Date Created:** 14/07/2026
**Primary Actor:** Customer
**Secondary Actors:** None

**Trigger:**
The Customer clicks the "Hoàn thành hợp đồng" (Complete Contract) button on the contract detail page.

**Description:**
The Customer confirms the completion of an active contract whose duration has ended. This transitions the contract state to completed and locks it from further modifications.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system. [Refer to **BR-01**]
- **PRE-02:** The contract status is "active". [Refer to **BR-45**]
- **PRE-03:** The contract's end date is today or in the past. [Refer to **BR-45**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The contract status transitions to `completed`. [Refer to **BR-46**]
- **POST-02:** The contract is marked as completed in the database.
- **POST-03:** If the use case fails, the contract status remains active.

**Normal Flow (Luồng sự kiện chính):**
**A. Complete Contract Successfully**

1. The Customer accesses the contract detail page.
2. The system checks if the contract is active and if its end date has reached or passed. [Refer to **BR-45**]
3. If these conditions are met, the system displays and enables the "Hoàn thành hợp đồng" button.
4. The Customer clicks the "Hoàn thành hợp đồng" button.
5. The system displays a confirmation modal warning that this action cannot be undone.
6. The Customer clicks the "Xác nhận" (Confirm) button in the modal.
7. The system updates the contract status to `completed`, closes the modal, and displays a success toast. [Refer to **BR-46**, **MSG114**]
8. The system updates the contract detail page UI to show the "completed" status badge and details.

**Alternative Flows (Luồng rẽ nhánh):**

**A.2 Contract is not eligible for completion**
1. The system hides or disables the "Hoàn thành hợp đồng" button.
2. The use case ends.

**A.6 Customer cancels completion**
1. In the confirmation modal, the Customer clicks "Hủy bỏ" (Cancel).
2. The system closes the modal and returns the user to the contract detail page. No changes are made.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network connection failure during completion
  1. The system displays a system error message. [Refer to **MSG115**]
  2. The confirmation modal remains open, and the contract status remains active.

**Priority:** Medium
**Frequency of Use:** Low (Typically once per contract lifecycle)
**Business Rules:** BR-01, BR-45, BR-46
**Other Information:** N/A
**Assumptions:** N/A
