### [UC-AUTH-03] [Reset Password]

**Function trigger:** The user clicks the password reset link received in their email after requesting a password reset (`/update-password`).

**Function description:** This screen enables users to set a new password for their account after verifying the password reset email token, completing the recovery flow and requiring re-login.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system validates the reset token/link from the URL parameters (`code`).
    *   If valid, the system displays an email verification success screen with a "Tiếp tục đặt lại mật khẩu" button.
    *   The user clicks "Tiếp tục", entering their new password (minimum 8 characters) and confirm password.
    *   The user submits the form, the system updates the account password in the backend, signs out active sessions, and opens a success modal ("Cập nhật thành công!").
    *   Clicking "Đăng nhập ngay" in the modal redirects the user to the login page (`/login`).

*   **Abnormal execution case:**
    *   If the reset link is invalid, expired, or previously used, the system displays an error state screen ("Liên kết không hợp lệ hoặc đã hết hạn") with options to resend the reset request (`/forgot-password`) or return to login (`/login`).
    *   If passwords do not match or are shorter than 8 characters, inline validation error messages are displayed under the input fields.
    *   If a server error occurs during password update, a red general error alert is displayed.
