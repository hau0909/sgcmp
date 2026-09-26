### [UC-DASH-01] [View Company Dashboard]

**Function trigger:** The Company Admin logs into the system or accesses the `/dashboard` page.

**Function description:** This dashboard screen enables the Company Admin to monitor company operations, view KPI metric cards, inspect weekly shift analytics charts, track today's guard shift roster, and view recent activity logs.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Company Admin's role permissions and active company context.
    *   The screen displays the operational dashboard consisting of:
        *   **Header Section:** Title "Tổng quan hệ thống", company name & date badge, and "Làm mới" (Refresh) button.
        *   **Operational KPI Cards:** 4 summary cards for Active Guards (Bảo vệ đang trực), Active Contracts (Hợp đồng đang chạy), Pending Reports (Báo cáo sự cố cần xử lý), and Rating (Đánh giá trung bình).
        *   **Weekly Shift Chart Section:** Line/Radar chart visualization displaying weekly shift trends (Completed, On-time, Late, Absent, Replacement shifts).
        *   **Today's Guard Roster Table:** Displays guard names, avatars, shift locations, contracts, and duty status badges.
        *   **Recent Activity Feed:** Real-time log of recent company events (check-ins, shift completions, report submissions, replacements).
    *   The Company Admin inspects operational metrics and status indicators.

*   **Abnormal execution case:**
    *   If API server errors occur while fetching metrics, individual dashboard cards display skeleton placeholders or error badges while maintaining overall page layout.
