### [UC-REQ-02] [View Request Detail]

**Function trigger:** The Company Admin clicks a request code or "Xem chi tiết" link on the request list page.

**Function description:** This screen displays full details of a customer request, including the process timeline, customer info, service specs, survey trigger button, and quotation panel.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system displays the request header with breadcrumbs, ID badge, and "+ Tạo khảo sát" (or "Xem khảo sát") button.
    *   The system renders the process status timeline (Gửi yêu cầu, Khảo sát, Báo giá, Hợp đồng) and customer details card.
    *   The system renders the quotation panel. If the survey is not approved, a warning alert is displayed: "Cần hoàn tất và duyệt 'Khảo sát yêu cầu' trước khi báo giá."

*   **Abnormal execution case:**
    *   If the request is not found or an error occurs during retrieval, the system displays an error notification.
