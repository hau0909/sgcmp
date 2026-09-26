# Use Case Specification: Update Bank Account

**UC ID and Name:** UC-BANK-03 - Update Bank Account
**Created By:** [Tên người thực hiện]
**Date Created:** 06/07/2026
**Primary Actor:** Admin
**Secondary Actors:** None

**Trigger:**
The Admin clicks on the "Chỉnh sửa" (Edit - Pencil icon) button on a specific bank account card within the Bank Accounts management page.

**Description:**
This use case allows the Admin to modify the details of an existing bank account in the system, such as changing the bank, the account number, or the account holder's name.

**Preconditions (Điều kiện tiên quyết):**
- **PRE-01:** The Admin has successfully logged into the system and is on the Bank Accounts page.
- **PRE-02:** At least one bank account exists in the system.
- **PRE-03:** The system has an active internet connection.

**Post-conditions (Hậu điều kiện):**
- **POST-01:** The bank account's updated details are saved in the system and reflected in the Bank Accounts list.

**Normal Flow (Luồng sự kiện chính):**
**A. Update Bank Account Successfully**

1. The Admin clicks to edit a bank account.
2. The system displays the Update Bank Account modal dialog.
3. The system pre-fills the form fields with the selected account's current details.
4. The Admin modifies one or more fields (Bank, Account Number, Account Name).
5. The Admin clicks the "Lưu thay đổi" (Save Changes) button.
6. The system validates the input data.
7. The system sends the update request to the server and saves the changes.
8. The system closes the modal dialog and refreshes the bank accounts list to display the updated information.

**Alternative Flows (Luồng rẽ nhánh):**
**A.6.1 Missing Required Fields**
1. The Admin clears a mandatory field (e.g., Account Number) and clicks "Lưu thay đổi".
2. The system prevents submission and highlights the missing field (HTML5 validation).
3. Return to step A.4.

**A.6.2 Invalid Account Number Format**
1. The Admin attempts to enter non-numeric characters into the Account Number field.
2. The system automatically strips non-numeric characters, only allowing digits (0-9).

**A.6.3 Invalid Account Name Format**
1. The Admin attempts to enter numbers or special characters into the Account Name field.
2. The system automatically strips invalid characters, only allowing letters and spaces, and converts the text to uppercase.

**Exceptions (Ngoại lệ):**
- **EX-01:** System fails to update account
  1. The system encounters an error during the update process (e.g., server error, network timeout).
  2. The system displays an inline error message within the dialog: "Đã xảy ra lỗi. Vui lòng thử lại." (An error occurred. Please try again).
  3. The dialog remains open for the Admin to retry.

**Priority:** High
**Frequency of Use:** Low
**Business Rules:** N/A
**Other Information:** N/A
**Assumptions:** N/A
