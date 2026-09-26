### [UC-REQ-01] [View Requests]

**Function trigger:** The Company Admin selects the request list/booking management option in the system navigation.

**Function description:** This screen displays the list of security service booking requests from customers belonging to the company in a paginated data table.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the active company context. [Refer to **BR-01**, **BR-14**]
    *   The system retrieves and displays the booking request list in a table with columns: Checkbox, Mã YC, Khách hàng, Loại dịch vụ, Ngày gửi, Ngày thực hiện, and Trạng thái (colored badges: "Mới", "Đang xử lý", "Đã báo giá", "Đã duyệt", "Từ chối").
    *   The pagination controls are positioned above the table on the right side showing "Hiển thị {start}-{end} của {total}" with previous/next buttons.
    *   Clicking on a request code navigates to the booking request detail page.

*   **Abnormal execution case:**
    *   If the company account is not found, the system displays an error message. [Refer to **MSG01**]
    *   If no booking requests are found, the table displays an empty state message. [Refer to **MSG17**]
    *   If a server/network error occurs, the error is logged and no data is displayed. [Refer to **MSG04**]
