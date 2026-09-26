### [UC-GUARD-05] [View Guard Performance]

**Function trigger:** The Coordinator clicks the "Hiệu suất Nhân viên" menu item or accesses the `/guard-performance` page.

**Function description:** This dashboard screen enables the Coordinator to analyze guard performance KPIs, view radar performance distribution charts, select custom date ranges, and inspect guard rankings.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context.
    *   The screen displays the guard performance dashboard consisting of:
        *   **Header Bar:** Title "Hiệu suất Nhân viên", "Làm mới" button, and Date Range popover picker.
        *   **KPI & Radar Chart Section:** 5 attendance KPI metric cards (Đúng giờ, Hoàn thành, Vắng mặt, Điểm danh trễ, Thay ca) and a 5-axis Recharts radar chart.
        *   **Guard Ranking Table:** Displays guard ranking records with search bar, category tabs ("Tất cả", "Top 10"), performance scores, rating badges (XUẤT SẮC, TIÊU CHUẨN, CẦN CẢI THIỆN), and pagination controls.
    *   The Coordinator views performance metrics, selects date filters, and inspects guard rankings.

*   **Abnormal execution case:**
    *   If no performance data exists for the selected date range or search query, the performance table body renders a centered empty state placeholder notice: "Chưa có dữ liệu hiệu suất cho khoảng thời gian này."
    *   If an API or server error occurs while fetching performance summary or guard rankings, the screen displays an error notification banner: "Không thể tải dữ liệu hiệu suất nhân viên".
