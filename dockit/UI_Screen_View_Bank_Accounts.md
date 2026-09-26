### [1.0.0] View Bank Accounts

**Function trigger:** The Admin clicks the "Bank Accounts" tab in the admin dashboard navigation menu.

**Function description:** This screen displays all bank accounts registered in the system for receiving payments. It allows the admin to view account details (Bank Name, Account Number, Account Holder), identify the active default account, and access actions to switch the active account, add new accounts, edit, or delete existing ones.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The user accesses the Bank Accounts page.
    *   The system loads and displays the list of bank accounts as cards.
    *   The active bank account is highlighted with a green "Đang hoạt động" badge and a primary color border.
    *   Other inactive accounts are displayed with a gray "Ngừng hoạt động" badge.
    *   The user can click the "Refresh" button to reload the list.
    *   The system displays the total number of accounts and the count of active accounts at the bottom of the page.

*   **Abnormal execution case:**
    *   If there are no bank accounts, the system displays an empty state placeholder with the text "Chưa có tài khoản ngân hàng nào." and a prominent "Thêm tài khoản đầu tiên" button.
    *   If there are bank accounts but none are active, the system displays an amber warning banner: "Chưa có tài khoản nào được kích hoạt. Chức năng thanh toán gói dịch vụ hiện không khả dụng. Vui lòng đặt một tài khoản làm mặc định."
    *   If the system fails to load the data, a red error banner is displayed with the message "Không thể tải danh sách tài khoản."
