### [UC-SCHED-01] [View Bookings (Coordinator)]

**Function trigger:** The Coordinator selects the booking/scheduling option in the system navigation.

**Function description:** This screen displays the list of approved bookings with active contracts in a paginated data table for coordination and scheduling purposes.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the Coordinator context and permissions. [Refer to **BR-01**, **BR-15**]
    *   The system retrieves and displays the active booking list in a table with columns: STT, Mã Booking, Khách hàng, Dịch vụ, Bảo vệ, Ngày Thực hiện, Trạng thái (always shown as "Đã duyệt" in emerald badge), and Hành Động ("Xem chi tiết" link).
    *   The search bar allows filtering by customer name, service name, or address.
    *   The date filters allow filtering by start and end submission dates (No status selection filter is available).
    *   The header contains:
        *   "Xuất Báo cáo" button to download data export.
        *   "Tạo Yêu cầu Mới" button.
    *   The pagination footer shows current range and total count with navigation buttons.
    *   Clicking a booking code or "Xem chi tiết" navigates to the booking detail/scheduling page.

*   **Abnormal execution case:**
    *   If the company account is not found, the system displays an error message. [Refer to **MSG01**]
    *   If no bookings match the criteria, the table shows an empty state message. [Refer to **MSG17**]
    *   If the Coordinator clicks the "Tạo Yêu cầu Mới" button, an alert dialog is displayed: "Điều phối viên không có quyền trực tiếp tạo đơn mới! Vui lòng liên hệ Admin hoặc Khách hàng." [Refer to **MSG24**]
    *   If a server/network error occurs, the error is logged and no data is shown. [Refer to **MSG04**]
