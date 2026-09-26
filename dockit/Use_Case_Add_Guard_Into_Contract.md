# Use Case Specification: Add Guard Into Contract

**UC ID and Name:** UC-CONT-01 - Add Guard Into Contract
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Company Admin, Coordinator
**Secondary Actors:** None

**Trigger:**
The user clicks the "Cập nhật bảo vệ" (Update Guards) button on the Contract Detail page (`/contracts/[id]`).

**Description:**
The user assigns security guards to a specific service contract by selecting active security personnel from the company guard pool through a selection modal.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Company Admin or Coordinator role permissions and an active account status.
- **PRE-02:** The target contract belongs to the user's active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system updates guard assignment records for the contract, displays a success toast notification, and refreshes the assigned guard list.
- **POST-02:** If the assignment fails, the system displays an error notification and no changes are saved.

**Normal Flow (Luồng sự kiện chính):**
**A. Add Guard Into Contract Successfully**

1. The user views the Contract Detail page (`/contracts/[id]`).
2. The user clicks the "Cập nhật bảo vệ" (Update Guards) button.
3. The system opens the "Cập nhật danh sách bảo vệ" selection modal, displaying active company security guards with checkboxes.
4. The user selects or deselects security guards to assign to the contract.
5. The user clicks the "Lưu thay đổi" (Save Changes) button.
6. The system validates the guard selection, updates contract guard assignments in the database, displays a success toast notification ("Cập nhật danh sách bảo vệ thành công!"), closes the modal, and refreshes the assigned guards display.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Cancel guard assignment**
1. The user clicks the "Hủy bỏ" (Cancel) button or the modal close icon.
2. The system discards pending guard selections and closes the modal without saving changes.

**A.4b Search guards in selection modal**
1. The user enters a keyword in the modal search bar.
2. The system filters and renders active guard records matching the search term.

**A.4c Navigate modal pagination**
1. The user clicks Previous or Next page navigation arrows in the selection modal.
2. The system displays active guard records for the selected modal page index.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during guard assignment
  1. An API error occurs while saving contract guard assignments.
  2. The system displays an error notification ("Có lỗi xảy ra khi lưu") and keeps the modal open for retry.
  3. The use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
