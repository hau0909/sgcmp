### [UC-SRM-01] [View My Requests (Customer)]

**Function trigger:** The Customer clicks "Yêu cầu của tôi" (My Requests) in the navigation menu or dashboard shortcut.

**Function description:** This screen displays a paginated list of security service booking requests submitted by the Customer, including search filters, date range filters, status badges, and navigation to detailed request views.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system retrieves the Customer's submitted booking requests and displays them in a data table.
    *   The page header displays the title "Yêu cầu của tôi" with a calendar icon and descriptive subtitle.
    *   The filter bar allows searching by request code or company name, filtering by status (Mới, Đang khảo sát, Đã báo giá, Đã chấp nhận, Từ chối, Đã hủy), and filtering by start and end dates.
    *   The data table displays request records with columns: Mã YC, Công ty bảo vệ, Dịch vụ, Thời gian thực hiện, Trạng thái badge, and Thao tác (Xem chi tiết).
    *   Pagination controls allow navigating through pages of results.
    *   Clicking a request row or the "Xem chi tiết" button opens the request detail page (`/my-requests/[id]`).

*   **Abnormal execution case:**
    *   If no booking requests exist, the table displays an empty state message prompting the user to explore security companies and submit a request.
    *   If a network or server error occurs during data retrieval, the loading spinner stops and an error message is displayed.
