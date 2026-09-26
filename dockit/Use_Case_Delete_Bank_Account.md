# Use Case Specification: Delete Bank Account

**UC ID and Name:** UC-BANK-04 - Delete Bank Account
**Created By:** [Tên người thực hiện]
**Date Created:** 06/07/2026
**Primary Actor:** Admin
**Secondary Actors:** None

**Trigger:**
The Admin clicks on the "Xóa" (Delete) button (Trash icon) on a specific bank account card within the Bank Accounts management page.

**Description:**
This use case allows the Admin to permanently remove a bank account from the system. To prevent accidental deletion, a confirmation dialog is presented before the action is executed. A special warning is shown if the target account is currently set as active.

**Preconditions (Điều kiện tiên quyết):**
- **PRE-01:** The Admin has successfully logged into the system and is on the Bank Accounts page.
- **PRE-02:** At least one bank account exists in the system.
- **PRE-03:** The system has an active internet connection.

**Post-conditions (Hậu điều kiện):**
- **POST-01:** The bank account is permanently removed from the system and disappears from the Bank Accounts list.

**Normal Flow (Luồng sự kiện chính):**
**A. Delete Bank Account Successfully**

1. The Admin clicks the "Xóa" button on a bank account.
2. The system displays a Delete Confirmation modal dialog.
3. The system shows the account number and bank name to be deleted.
4. The Admin clicks the "Xóa tài khoản" (Delete Account) confirmation button.
5. The system sends a delete request to the server.
6. The system receives a successful response, closes the modal dialog, and refreshes the bank accounts list.

**Alternative Flows (Luồng rẽ nhánh):**
**A.3.1 Delete Active Bank Account Warning**
1. In step A.3, the system detects that the selected account is currently the **active/default** account.
2. The system displays an additional amber warning banner inside the dialog: "Cảnh báo: Đây là tài khoản đang hoạt động. Sau khi xóa, chức năng thanh toán sẽ tạm thời ngưng hoạt động."
3. The Admin can still choose to proceed or cancel.

**A.4.1 Cancel Deletion**
1. The Admin clicks the "Hủy" (Cancel) button or clicks outside the modal.
2. The system closes the modal dialog without making any changes to the data.

**Exceptions (Ngoại lệ):**
- **EX-01:** System fails to delete account
  1. The system encounters an error during the deletion process (e.g., server error, network timeout, constraint violation).
  2. The system closes the confirmation dialog.
  3. The system displays a red error banner at the top of the main Bank Accounts page with the message: "Không thể xóa tài khoản." (Unable to delete account).

**Priority:** High
**Frequency of Use:** Low
**Business Rules:** N/A
**Other Information:** N/A
**Assumptions:** N/A
