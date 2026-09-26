### [1.2.0] Update Bank Account

**Function trigger:** The Admin clicks the "Chỉnh sửa" (Edit) button, represented by a Pencil icon, on a specific bank account card in the Bank Accounts page.

**Function description:** This modal screen allows the Admin to modify the information of an existing bank account. The form is pre-populated with the account's current data. It includes real-time input formatting for the account number (numeric only) and account name (uppercase letters only).

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The user clicks edit, and the modal dialog opens.
    *   The system pre-fills the "Ngân hàng" (dropdown), "Tên ngân hàng", "Số tài khoản", and "Tên chủ tài khoản" fields with the account's existing data.
    *   The user edits the information in the fields.
    *   The user clicks the "Lưu thay đổi" (Save Changes) button.
    *   The system displays a loading spinner on the button, processes the update request, closes the modal upon success, and refreshes the parent page's list to show the changes.

*   **Abnormal execution case:**
    *   If the user clears a required field and tries to submit, the browser's default validation blocks the submission.
    *   If the user enters invalid characters during editing, the system automatically removes them (real-time validation).
    *   If the API update request fails (e.g., server error), the system displays a red inline error message block above the action buttons with the text "Đã xảy ra lỗi. Vui lòng thử lại." (or the specific API error message) and keeps the modal open.
