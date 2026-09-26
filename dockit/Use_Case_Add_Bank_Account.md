# Use Case Specification: Add Bank Account

**UC ID and Name:** UC-BANK-02 - Add Bank Account
**Created By:** [Tên người thực hiện]
**Date Created:** 06/07/2026
**Primary Actor:** Admin
**Secondary Actors:** None

**Trigger:**
The Admin clicks on the "Thêm tài khoản" (Add Account) button on the Bank Accounts management page.

**Description:**
This use case allows the Admin to register a new bank account into the system. This account will be used to receive payments for subscription plans.

**Preconditions (Điều kiện tiên quyết):**
- **PRE-01:** The Admin has successfully logged into the system and accessed the Bank Accounts page.
- **PRE-02:** The system has an active internet connection.

**Post-conditions (Hậu điều kiện):**
- **POST-01:** The new bank account is saved in the system and appears in the Bank Accounts list.

**Normal Flow (Luồng sự kiện chính):**
**A. Add Bank Account Successfully**

1. The system displays the Add Bank Account modal dialog.
2. The Admin selects a bank from the dropdown list.
3. The system automatically populates the "Tên ngân hàng" (Bank Name) field based on the selected bank.
4. The Admin enters the "Số tài khoản" (Account Number) and "Tên chủ tài khoản" (Account Name).
5. The Admin clicks the "Thêm mới" (Add New) button.
6. The system validates the input data.
7. The system sends the request to the server and saves the new bank account.
8. The system closes the modal dialog and refreshes the bank accounts list to display the newly added account.

**Alternative Flows (Luồng rẽ nhánh):**
**A.6.1 Missing Required Fields**
1. The Admin leaves one or more mandatory fields (Bank, Bank Name, Account Number, Account Name) blank and clicks "Thêm mới".
2. The system prevents submission and highlights the missing fields (HTML5 validation).
3. Return to step A.2.

**A.6.2 Invalid Account Number Format**
1. The Admin attempts to enter non-numeric characters into the Account Number field.
2. The system automatically strips non-numeric characters, only allowing digits (0-9) to be inputted.

**A.6.3 Invalid Account Name Format**
1. The Admin attempts to enter numbers or special characters into the Account Name field.
2. The system automatically strips invalid characters, only allowing letters and spaces, and converts the text to uppercase.

**Exceptions (Ngoại lệ):**
- **EX-01:** System fails to create account
  1. The system encounters an error during creation (e.g., server error, network timeout).
  2. The system displays an inline error message within the dialog: "Đã xảy ra lỗi. Vui lòng thử lại." (An error occurred. Please try again).
  3. The dialog remains open for the Admin to retry.

**Priority:** High
**Frequency of Use:** Low
**Business Rules:** N/A
**Other Information:** N/A
**Assumptions:** N/A
