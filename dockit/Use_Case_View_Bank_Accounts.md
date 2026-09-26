# Use Case Specification: View Bank Accounts

**UC ID and Name:** UC-BANK-01 - View Bank Accounts
**Created By:** [Tên người thực hiện]
**Date Created:** 06/07/2026
**Primary Actor:** Admin
**Secondary Actors:** None

**Trigger:**
The Admin clicks on the "Bank Accounts" menu item from the sidebar navigation.

**Description:**
This use case allows the Admin to view the list of system bank accounts used for receiving payments. The system displays account details, active status, and provides actions to manage these accounts.

**Preconditions (Điều kiện tiên quyết):**
- **PRE-01:** The Admin has successfully logged into the system.
- **PRE-02:** The system has an active internet connection.

**Post-conditions (Hậu điều kiện):**
- **POST-01:** The system displays the list of bank accounts.

**Normal Flow (Luồng sự kiện chính):**
**A. View Bank Accounts Successfully**

1. The Admin accesses the Bank Accounts page.
2. The system retrieves the list of all configured bank accounts.
3. The system displays the list of bank accounts, sorting the active account to the top.

**Alternative Flows (Luồng rẽ nhánh):**
**A.2.1 Empty Bank Accounts List**
1. The system retrieves the data and finds no bank accounts configured.
2. The system displays an empty state with a message "Chưa có tài khoản ngân hàng nào." and a button to add the first account.

**A.2.2 No Active Bank Account**
1. The system retrieves the data and finds that no account is currently set as active.
2. The system displays a warning message at the top of the list: "Chưa có tài khoản nào được kích hoạt. Chức năng thanh toán gói dịch vụ hiện không khả dụng. Vui lòng đặt một tài khoản làm mặc định."

**Exceptions (Ngoại lệ):**
- **EX-01:** System fails to load data
  1. The system fails to retrieve the bank accounts due to a connection or server error.
  2. The system displays an error message "Không thể tải danh sách tài khoản." (referencing MSG04 logic if generalized).

**Priority:** High
**Frequency of Use:** Low
**Business Rules:** N/A
**Other Information:** N/A
**Assumptions:** N/A
