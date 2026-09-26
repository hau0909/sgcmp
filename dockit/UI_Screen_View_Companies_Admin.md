### [UC-CMP-01] [View Companies By Admin]

**Function trigger:** The System Admin selects "Quản lý doanh nghiệp" (Company Management) from the admin navigation menu (`/admin/companies`).

**Function description:** This screen displays a paginated list of all security companies registered on the platform, allowing the System Admin to search, filter by publication status, view company details, and update company operational status (e.g. Published, Active, Pending Approval, Suspended).

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system loads and displays all security companies registered in the platform database.
    *   The page header displays breadcrumbs, main title "Quản lý doanh nghiệp", subtitle, search input bar, and a "Làm mới" (Refresh) button.
    *   The status filter tabs bar allows filtering companies by status: Tất cả, Đang công khai (Published), Đã kích hoạt (Active), Chờ phê duyệt (Pending Publish), and Tạm ngưng/Bản nháp (Suspended/Draft), with live record counter badges.
    *   The data table displays company records with columns: STT, Doanh nghiệp (Logo & Tên công ty), Mã số thuế / GPKD, Người đại diện (Tên, Email, SĐT), Số bảo vệ, Trạng thái badge, and Thao tác (Xem chi tiết & Đổi trạng thái).
    *   Pagination controls allow navigating between pages (10 records per page).
    *   Clicking a company row or "Chi tiết" opens a modal displaying full company profile, representative info, legal license files, and status change controls.

*   **Abnormal execution case:**
    *   If no companies match the search query or status filter, the table displays an empty state message: "Không tìm thấy doanh nghiệp phù hợp."
    *   If a network or server error occurs during data fetch, an error message is displayed with a "Thử lại" button.
