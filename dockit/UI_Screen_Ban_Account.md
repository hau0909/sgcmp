### [UC-ACCT-01] [Ban Account]

**Function trigger:** The System Admin clicks the "Khóa tài khoản" button on an active account detail screen (`/accounts/[userId]`).

**Function description:** This modal enables the System Admin to enter a justification reason and confirm banning an active user account.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the System Admin's role permissions and active system context.
    *   Clicking "Khóa tài khoản" opens the ban confirmation modal:
        *   **Modal Header & Warning Icon:** Warning icon badge and title "Xác nhận khóa tài khoản".
        *   **Confirmation Message:** Explanatory text warning about account access restrictions.
        *   **Justification Reason Textarea:** Mandatory text field with label "Lý do khóa tài khoản *" and placeholder "Nhập lý do khóa tài khoản...".
        *   **Modal Footer Actions:** "Hủy" button and primary "Xác nhận" (Confirm Ban) button.
    *   The System Admin enters the ban reason and clicks "Xác nhận".
    *   The system validates the reason, updates account status to "Banned", displays a success toast notification ("Khóa tài khoản thành công"), closes the modal, and renders a red "Tài khoản bị khóa" alert banner with the ban reason on the detail page.

*   **Abnormal execution case:**
    *   If the ban reason textarea is submitted empty, an inline red field error appears: "Vui lòng nhập lý do khóa tài khoản".
    *   If an API server error occurs during the ban operation, an error toast notification is displayed: "Không thể khóa tài khoản" while keeping the modal open for retry.
