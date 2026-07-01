### [UC-BILL-01] [View SaaS Plans]

**Function trigger:** The Company Admin clicks on the billing or subscription management option in the system navigation.

**Function description:** This screen allows the Company Admin to view details of their current active subscription plan, the list of available SaaS plans, and their company's payment/transaction history.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the active company context. [Refer to **BR-01**]
    *   The system displays the page header: "Quản lý Gói dịch vụ & Thanh toán" and a subtitle: "Xem thông tin gói hiện tại, nâng cấp và quản lý lịch sử giao dịch.", alongside an "Xuất hóa đơn" button.
    *   The system displays the current subscription in the "Gói Hiện Tại" card, showing:
        *   An active status badge: "Đang hoạt động" (green badge with a pulse animation) if an active plan exists, or "Chưa kích hoạt" (orange badge) if not.
        *   The plan name (e.g., "Basic", "Pro") or "Chưa có gói dịch vụ". [Refer to **BR-02**, **BR-03**]
        *   The billing cycle ("Hàng tháng" or "N/A").
        *   The next expiration date or "Chưa đăng ký".
        *   The subscription fee in VNĐ/tháng (or 0 VNĐ/tháng if no plan).
    *   The system retrieves available subscription plans and displays them in a grid of cards:
        *   The user's current plan card highlights a "Gói Của Bạn" badge and displays a disabled "Đang sử dụng" button. [Refer to **BR-02**]
        *   If the user has no active subscription plan (`currentPlan` is null), other plans display a "Đăng ký ngay" button. Clicking this button triggers payment creation via bank transfer [Refer to **BR-04**] and redirects the user to `/billing/payment/[planId]?paymentId=[payment_id]`.
        *   If the user has an active subscription plan, other plans display a "Liên Hệ" button for upgrade support. [Refer to **BR-05**]
    *   The system retrieves and displays the company's transaction history in the "Lịch sử giao dịch" table, showing:
        *   Mã Thanh Toán (truncated Payment ID, first 8 characters in uppercase).
        *   Mã Giao Dịch (transaction code or "-").
        *   Ngày (formatted payment date in `vi-VN` format).
        *   Gói Dịch Vụ (resolved Plan Name).
        *   Số Tiền (VNĐ) (formatted payment amount).
        *   Trạng Thái (Status badge: Completed -> "Thành công" in green, Failed -> "Thất bại" in red, Refunded -> "Đã hoàn tiền" in blue, Pending/Other -> "Chờ xử lý" in orange).

*   **Abnormal execution case:**
    *   If the company profile is missing (`companyId` is null), the system displays the message: "Không tìm thấy thông tin tài khoản doanh nghiệp." [Refer to **MSG01**]
    *   If the system is fetching data, it displays the loading message: "Đang tải thông tin gói dịch vụ & thanh toán..." [Refer to **MSG02**]
    *   If the payment initialization fails, the system displays an error warning message: "Không thể khởi tạo giao dịch thanh toán" or the API error message. [Refer to **MSG03**]
    *   If a server or network failure occurs during data retrieval, the system displays the error warning message: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau." [Refer to **MSG04**]
    *   If the transaction history is empty, the table displays the message: "Không có giao dịch nào". [Refer to **MSG05**]
