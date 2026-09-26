### [UC-SHIFT-02] [View Work Shift (Guard)]

**Function trigger:** The Guard accesses the work shift schedule page from the primary navigation menu.

**Function description:** This screen displays the daily list of work shifts explicitly assigned to the logged-in Guard, showing shift timing, post address, contract location, and status badges, with options to change the view date and navigate into shift details.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the Guard's authentication, company context, and role permissions. [Refer to **BR-01**, **BR-08**, **BR-22**, **BR-41**]
    *   The top header section displays the page title and the formatted date header with a calendar icon.
    *   The list area renders the assigned shift cards for the selected date:
        *   **Shift Card Display:** Displays shift name, status badge ("Đã phân công" in blue, "Đang trực" / "Hoàn thành" in emerald, "Điểm danh trễ" in amber, "Vắng mặt" in red, or "Bảo vệ thay thế" in purple), time duration, work post address, and target location.
    *   Clicking on any shift card navigates the Guard to the detailed shift view page.

*   **Abnormal execution case:**
    *   If an invalid date format or out-of-range date parameter is provided, the system displays an inline date error message. [Refer to **MSG71**]
    *   If no work shifts are assigned to the Guard for the selected date, the screen displays an empty state placeholder icon with a message indicating no shifts are scheduled for that day. [Refer to **MSG77**]
    *   If a network connection or API server error occurs while retrieving assigned shift data, the system displays an error notice banner. [Refer to **MSG73**]
