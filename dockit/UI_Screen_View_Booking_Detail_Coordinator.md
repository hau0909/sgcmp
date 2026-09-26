### [UC-SCHED-02] [View Booking Detail (Coordinator)]

**Function trigger:** The Coordinator clicks on a booking code or "Xem chi tiết" link on the booking list page.

**Function description:** This screen displays the detailed customer information, service specifications, and linked active contract details for a specific booking request in a full-width card layout.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the active company context and Coordinator role permissions. [Refer to **BR-01**, **BR-15**]
    *   The system retrieves and displays the detailed booking screen containing:
        *   **Header**: Booking code, status badge ("Đã duyệt"), creation date, active contract link, and a back button to the list.
        *   **Customer Info**: Company name, contact person, phone, email, and address.
        *   **Service Specifications**: Service name, guards count, implementation period, time slots, days per week, and special instructions.
    *   *Note: Unlike the Company Admin view, the Quotation Panel is hidden and the detail cards span the full layout width.*

*   **Abnormal execution case:**
    *   If the booking request is not found, the system displays an error message. [Refer to **MSG20**]
    *   If a server/network error occurs, the system logs the error and displays a general exception toast. [Refer to **MSG04**]
