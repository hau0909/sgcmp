### [1.1.0] Add Bank Account

**Function trigger:** The Admin clicks the "Thêm tài khoản" (Add Account) button on the Bank Accounts page.

**Function description:** This modal screen allows the Admin to input information to add a new bank account to the system. It includes fields for selecting the bank, entering the bank name (auto-filled but editable), account number, and account holder's name. It features real-time input formatting (numeric only for account number, uppercase alphabetic only for account name).

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The user opens the modal dialog.
    *   The user selects a bank from the "Ngân hàng" dropdown. The system automatically fills the "Tên ngân hàng" field.
    *   The user enters digits into the "Số tài khoản" field.
    *   The user enters their name into the "Tên chủ tài khoản" field. The system automatically converts the input to UPPERCASE.
    *   The user clicks the "Thêm mới" button.
    *   The system displays a loading spinner on the button, processes the request, closes the modal upon success, and refreshes the parent page's list.

*   **Abnormal execution case:**
    *   If the user tries to submit without filling all required fields, the browser's default validation blocks the submission.
    *   If the user enters invalid characters (letters in account number, numbers in account name), the system automatically removes them, acting as a real-time validation mechanism.
    *   If the API request fails (e.g., server error), the system displays a red inline error message block above the action buttons with the text "Đã xảy ra lỗi. Vui lòng thử lại." (or the specific API error message) and keeps the modal open.
