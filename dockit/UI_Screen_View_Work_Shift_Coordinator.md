### [UC-SHIFT-01] [View Work Shift (Coordinator)]

**Function trigger:** The Coordinator selects the shift schedule/management option in the system navigation bar.

**Function description:** This screen enables the Coordinator to view, inspect, and manage daily and weekly work shift schedules across active contract locations, navigate between dates, inspect guard assignments and shift status badges, and trigger modal actions for creating work shifts or inspecting shift details.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's authentication, company context, and role permissions. [Refer to **BR-01**, **BR-08**, **BR-22**, **BR-31**, **BR-32**]
    *   The system fetches the list of active service contract locations belonging to the Coordinator's company.
    *   The system automatically selects the primary contract location and initializes the current date key.
    *   The top toolbar (`ShiftToolbar`) displays:
        *   View mode toggle ("Day" view / "Week" view).
        *   Contract location selector dropdown displaying contract address, customer name, and contract status.
        *   Date navigation bar with previous date, next date, "Today" button, and date picker controls.
        *   "Tạo ca làm việc" (Create Shift) action button.
    *   The schedule view area (`ShiftScheduleTable`) retrieves and displays the scheduled shifts:
        *   **Day View Mode:** Displays a grid layout organized by contract locations and time slots for the selected single day.
        *   **Week View Mode:** Displays a 7-day column grid (Monday through Sunday) showing shift cards within their corresponding date columns.
        *   **Shift Card Display:** Each shift card shows shift title/time slot, assigned guard names with avatars, and status badges ("Chưa bắt đầu" in yellow, "Đang diễn ra" in green, "Đã hoàn thành" in blue, "Đã hủy" in gray).
    *   Clicking the "Tạo ca làm việc" button opens the Create Shift Modal for scheduling new shifts.
    *   Clicking on a specific shift card opens the Shift Detail Modal displaying detailed post and guard assignment information.

*   **Abnormal execution case:**
    *   If the Coordinator account is not linked to an active company, the system displays an error message. [Refer to **MSG70**]
    *   If an invalid date format or out-of-range date parameter is selected, the system displays an inline date error message. [Refer to **MSG71**]
    *   If no work shifts exist for the selected location or date scope, the table displays an empty placeholder notice: "Không có ca trực trong ngày này" (Day view) or "Trống lịch" (Week view). [Refer to **MSG76**, **MSG77**]
    *   If a network connection error or API server exception occurs during schedule data retrieval, the system displays an error notice banner. [Refer to **MSG69**, **MSG75**]
