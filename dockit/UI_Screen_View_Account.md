### [UC-ACCT-03] [View Account (Admin)]

**Function trigger:** The System Admin clicks the detail icon/button on an account row in the Account List page (`/accounts`).

**Function description:** This screen displays full profile details of a specific user account, including avatar, personal & contact info, role and account status badges, ban history alert (if banned), and an action button to ban the account.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system loads and displays account profile details for `/accounts/[userId]`.
    *   The header displays a back navigation button, page title "Chi tiết tài khoản", and a "Khóa tài khoản" button (if account status is active).
    *   If the account is currently banned, a red alert banner is rendered displaying the ban justification reason.
    *   The left column displays the user's avatar image, full name, role badge, and status badge.
    *   The right column displays detailed cards for contact information (Email, Phone, Address), personal info (Gender, Date of Birth, CCCD), and account activity timestamps (Created Date, Updated Date).

*   **Abnormal execution case:**
    *   If the user ID is invalid or account record is not found, the system displays an error state message: "Không tìm thấy thông tin tài khoản" with a link back to `/accounts`.
    *   If a network or server error occurs during loading, an error notification is displayed.
