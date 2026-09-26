### [3.2.11] [View Contract Shift Schedule]

**Function trigger:** The Customer accesses the "Lịch trực bảo vệ" (Guard Schedule) page from the navigation menu, or selects the shift schedule view from an active contract.

**Function description:** This screen enables Customers to monitor the weekly work shift schedule and guard attendance for their active contracts. Customers can choose specific contract locations, navigate across different weeks, view shift execution statuses, check assigned guard information and check-in photos, and report incidents directly from specific shifts.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![View Contract Shift Schedule](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The Customer opens the page, and the system loads contracts belonging to the Customer.
    *   The toolbar allows choosing a contract location and navigating between weeks (Previous, Next, Today).
    *   The system displays the 7-day schedule grid from Monday to Sunday, highlighting the current day.
    *   Each shift card displays shift time, service location, company name, assigned guards, attendance status tags, and check-in photos.
    *   Clicking a shift card opens the detail window, while clicking "Báo cáo sự cố" redirects to the incident report submission page.

*   **Abnormal execution case:**
    *   If the Customer has no contracts with scheduled shifts, the table displays an empty schedule notice.
    *   If no shifts are scheduled on a particular day, that day column displays an empty state message ("Trống lịch").
    *   If an invalid date is selected, the system displays an error message informing the user of the invalid date.
    *   If the system encounters an error while loading shift data, an error message ("Không thể tải danh sách ca trực") is displayed.
