### [UC-SHIFT-03] [View Work Shift Detail (Guard)]

**Function trigger:** The Guard selects an assigned shift card from the guard schedule page or navigates directly to the shift detail link.

**Function description:** This screen displays comprehensive details for an assigned work shift, including status badges, time slot, location address, assigned Coordinator, check-in photo proof preview, co-assigned guard team roster, and the check-in action button.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the Guard's authentication, role permissions, and verifies assigned shift access. [Refer to **BR-01**, **BR-08**, **BR-41**]
    *   The top header area displays a back navigation button and the section title.
    *   The primary shift card displays shift name, status badge ("Đã hoàn thành", "Đang trực", "Điểm danh trễ", "Vắng mặt", "Chưa điểm danh", "Đã phân công", or "Bảo vệ thay thế"), target location, time duration, and detailed work address.
    *   The shift details section displays shift schedule date, start/end time, target area, assigning Coordinator name ("Người phân công"), and check-in photo proof (preview image if checked-in, or empty placeholder notice if not yet checked-in).
    *   The team section displays the list of co-assigned guards with avatars, full names, phone numbers, replacement badges (if applicable), and individual attendance status tags.
    *   The bottom action container displays the "Thực hiện Check-in" button for active guard assignments.
    *   Clicking the back button returns the user to the previous page.
    *   Clicking "Thực hiện Check-in" navigates the Guard to the shift check-in camera validation page.

*   **Abnormal execution case:**
    *   If the Guard attempts to access a shift that is not assigned to them, the system blocks access and displays an error message. [Refer to **MSG74**]
    *   If the shift ID parameter is missing or invalid, the system displays an inline error notice. [Refer to **MSG72**]
    *   If a network or API server failure occurs while fetching shift details, the system displays an error banner notice. [Refer to **MSG73**]
