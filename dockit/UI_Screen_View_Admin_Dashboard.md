### [UC-DASH-03] [View Admin Dashboard]

**Function trigger:** The System Admin logs into the system or accesses the `/admin` page.

**Function description:** This system dashboard enables the System Admin to monitor platform-wide KPIs, company growth charts, subscription plan distributions, pending approval tasks, and recent system activities.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the System Admin's role permissions and active system context.
    *   The screen displays the System Admin dashboard consisting of:
        *   **Header Bar:** Title "Tổng quan hệ thống", time filter selector (Tuần này, Tháng này, Năm nay), and "Làm mới" (Refresh) button.
        *   **System KPI Cards:** 4 summary cards for Total Companies (Tổng công ty), Active Guards (Bảo vệ đang hoạt động), Total Revenue (Tổng doanh thu), and Active SaaS Plans (Gói dịch vụ đang kích hoạt).
        *   **Company Growth Chart:** Line chart visualization rendering tenant company registration trends.
        *   **Plan Distribution Chart:** Donut/Pie chart showing SaaS subscription plan breakdown percentages.
        *   **Pending Tasks Table:** Action table listing company approval requests and pending verification tasks.
        *   **Recent Activities Steps:** Audit log feed displaying recent platform-wide events and administrative actions.
    *   The System Admin views system performance and pending administrative tasks.

*   **Abnormal execution case:**
    *   If API server errors occur while fetching platform metrics, affected widgets render skeleton loading states or error notices while maintaining page navigation.
