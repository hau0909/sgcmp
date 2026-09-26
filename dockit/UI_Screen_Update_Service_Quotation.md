### [UC-SRM-04] [Update Service Quotation (Company)]

**Function trigger:** The Company Admin accesses the Request Detail page (`/requests/[id]`) and navigates to the Quotation Panel on the right column.

**Function description:** This screen action allows the Company Admin to create, configure, or update a service quotation for a customer's security service request. The Company Admin can select between three quotation calculation methods (Hourly, Monthly, or Package), preview automated price suggestions, customize negotiated rates, view live total price calculations, and submit the quotation to the customer.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The Company Admin selects a quotation method tab: **Theo Giờ (Hourly)**, **Theo Tháng (Monthly)**, or **Trọn Gói (Package)**.
    *   The system pre-populates suggested rates based on the company's listed base price per hour, guards count, time slots, working days, and contract duration.
    *   The Company Admin inputs/adjusts negotiated rates or clicks "Dùng giá gợi ý" to restore calculated baseline figures.
    *   The system dynamically recalculates total guard hours, equivalent hourly rate, and total quoted price in real-time within the vertical math breakdown container.
    *   The Company Admin clicks "Cập nhật & Gửi khách hàng" (or "Cập nhật & Gửi báo giá lại" if the previous quotation was rejected).
    *   The system opens the "Xác nhận gửi báo giá" confirmation modal displaying a summary of the total quoted price.
    *   The Company Admin clicks "Xác nhận gửi".
    *   The system saves the quotation, updates the request status to `quoted`, displays a success notification message, and renders the quotation panel in read-only mode.

*   **Abnormal execution case:**
    *   If the field verification (site survey) report is not yet approved (`verificationStatus !== "approved"`), the system displays a warning message: "Cần hoàn tất và duyệt 'Khảo sát yêu cầu' trước khi báo giá." and disables all quotation input fields and submission buttons (BR-23).
    *   If the request status is already `quoted` or `accepted`, the system renders the quotation panel in read-only mode and disables modification actions.
    *   If the Company Admin clicks "Từ chối yêu cầu", the system opens a warning confirmation modal ("Từ chối yêu cầu dịch vụ"). Upon confirmation, the request status updates to `rejected`.
    *   If the Company Admin cancels any modal dialog, the modal closes and no changes are saved.
    *   If a network or server error occurs during submission, the system displays an error notification message.
