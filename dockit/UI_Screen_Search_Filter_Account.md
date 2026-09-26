### [UC-ACCT-02] [Search & Filter Account (Admin)]

**Function trigger:** The System Admin enters search keywords or selects role/status filters on the Account Management page (`/accounts`).

**Function description:** This screen action allows the System Admin to search user accounts by full name, email, or phone number, and filter accounts by user role (Tất cả, Khách hàng, Quản lý DN, Bảo vệ, Điều phối, Admin) and account status (Tất cả, Hoạt động, Bị khóa / Inactive).

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The System Admin inputs text into the search bar or clicks role filter tabs (Tất cả, Khách hàng, Quản lý DN, Bảo vệ, Điều phối, Admin) and status filters.
    *   The system filters the user accounts list, updates the dynamic account counts per role, and refreshes the paginated data table.
    *   The table displays matching user accounts with columns: STT, Người dùng (Ảnh & Họ tên), Email, Số điện thoại, Vai trò badge, Ngày tạo, Trạng thái badge, and Thao tác (Chi tiết).

*   **Abnormal execution case:**
    *   If no accounts match the applied search query or filter criteria, the table displays an empty state message.
    *   If a network or server error occurs, the system displays an error notification banner.
