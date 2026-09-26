### [UC-AUTH-03] [Email Verification]

**Function trigger:** The user clicks the secure email verification link received in their email inbox.

**Function description:** This screen displays the email verification status card, processes token validation upon page load, updates the user's email verification state, and automatically redirects verified users to their role-specific dashboard.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The user accesses the verification link from their email inbox.
    *   The system displays a verification loading state with a spinner ("Đang xác thực email của bạn..."). [Refer to **MSG58**]
    *   The system validates the verification security token against user authentication records.
    *   Upon successful validation, the system marks the email address as verified, updates session auth state, and displays a success status icon and message: "Xác thực email thành công!" [Refer to **MSG59**]
    *   The system displays a redirection message ("Đang chuyển bạn đến trang phù hợp..."). [Refer to **MSG60**]
    *   The system automatically redirects the user to their role-specific dashboard or home page based on role permissions. [Refer to **BR-08**]

*   **Abnormal execution case:**
    *   If the user accesses an expired verification link, the system displays an error status icon and message: "Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại." [Refer to **MSG61**].
    *   If the user accesses an invalid, corrupted, or tampered verification link, the system displays an error status message: "Liên kết xác thực không hợp lệ." [Refer to **MSG62**, **MSG63**].
    *   If a server error or network exception occurs during token validation, the system displays a connection error message: "Xác thực thất bại do lỗi kết nối. Vui lòng thử lại." [Refer to **MSG67**, **MSG04**].
