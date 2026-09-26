### [UC-SRM-02] [View My Request Detail (Customer)]

**Function trigger:** The Customer clicks a request code or "Xem chi tiết" button on the My Requests list page (`/my-requests`).

**Function description:** This screen displays full details of a customer's security service request, including the progress timeline, security company contact info, service specifications, quotation panel, and options to respond to quotations or edit/cancel the request.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system loads and displays the request detail view for `/my-requests/[id]`.
    *   The header displays a back navigation button, breadcrumbs, request ID badge, and status badge (Mới, Đang khảo sát, Đã báo giá, Đã chấp nhận, Từ chối, Đã hủy).
    *   The progress stepper shows the 4-step workflow lifecycle: Gửi yêu cầu -> Khảo sát -> Báo giá -> Hợp đồng.
    *   The main view displays the security company's contact info card and service specifications card (dịch vụ, số lượng bảo vệ, ca trực, thời gian, ghi chú).
    *   The quotation panel shows the price proposal provided by the company (if quoted), rate calculations (hourly/monthly/package), and action buttons for the Customer to accept or reject the quote.
    *   If the request is accepted and a contract is generated, a link card to the contract is displayed.

*   **Abnormal execution case:**
    *   If the request ID is invalid or not found, the system displays an error state message: "Không tìm thấy thông tin yêu cầu đặt lịch."
    *   If a network or server error occurs during loading, the system displays an error banner with a retry option.
