### [UC-DASH-02] [View Coordinator Dashboard]

**Function trigger:** The Coordinator logs into the system or accesses the `/coor-dashboard` page.

**Function description:** This operational dashboard enables the Coordinator to monitor live shift status, review incident report statistics, inspect past shift history, analyze guard performance radar charts, view available guards, and launch shift creation modals.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context.
    *   The screen displays the Coordinator operational dashboard consisting of:
        *   **Header Bar:** Title "Bảng điều khiển Điều hành", last updated timestamp, "Tạo ca trực" primary action button, and "Làm mới" (Refresh) button.
        *   **Live Shift Monitor Section:** Real-time shift status cards showing ongoing, upcoming, late, absent, and replacement shifts with color badges.
        *   **Incident Reports Summary:** KPI cards displaying total report counts and unresolved incidents.
        *   **Guard Performance Radar Chart:** 5-axis radar chart rendering guard performance distribution (Đang trực, Hoàn thành, Đi trễ, Vắng mặt, Thay ca).
        *   **Available Guard Roster:** List of available security guards with skill badges and contact details.
        *   **Past Shifts History Table:** Historical shift records with time filters (Hôm nay, Hôm qua, Tuần trước, Tháng trước).
    *   The Coordinator views live shift metrics, monitors guard availability, and manages operations.

*   **Abnormal execution case:**
    *   If API server errors occur while fetching metrics, affected dashboard widgets render skeleton placeholders or error banners while preserving page navigation.
