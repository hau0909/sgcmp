### [UC-BILL-02] [View Subscription Payments]

**Function trigger:** The System Admin clicks the "Lịch sử thanh toán" menu item or accesses the `/payment-history` page.

**Function description:** This screen enables the System Admin to monitor company subscription transactions, review aggregate revenue KPIs, and view transaction records.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the System Admin's role permissions and active system context.
    *   The screen displays the payment history dashboard consisting of:
        *   **Header Section:** Title "Lịch sử thanh toán" and subtitle description.
        *   **KPI Metric Cards:** 4 summary cards showing Total Revenue (Tổng doanh thu), Success Transactions (Giao dịch thành công), Pending Transactions (Đang chờ xử lý), and Failed Transactions (Thất bại).
        *   **Payment History Table:** Columns for Mã giao dịch, Tên công ty, Gói dịch vụ, Số tiền, Phương thức thanh toán (Chuyển khoản / Thẻ tín dụng / Ví điện tử), Ngày thanh toán, and Trạng thái badge (green "Thành công", amber "Chờ xử lý", red "Thất bại").
        *   **Pagination Footer:** Page counter ("Trang X / Y") and page navigation buttons (Previous, page numbers, Next).
    *   The System Admin views payment transactions and revenue metrics.

*   **Abnormal execution case:**
    *   If no payment records exist, the table body displays a centered empty state notice: "Không tìm thấy giao dịch thanh toán nào."
    *   If an API or server error occurs during payment history retrieval, the table body renders a red error message: "Không thể tải lịch sử thanh toán".
