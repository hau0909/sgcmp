### 4.1.5 View Request Verification Detail

**Function trigger:** The user clicks "Xem khảo sát" on the Request Detail header or selects a verification record from the Verifications List page.

**Function description:** This screen displays full site verification information alongside customer and service request details, customized by user role (Company Admin vs Coordinator).

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The system loads header breadcrumbs, request title, ID badge, and top cards ("Thông tin khách hàng" & "Yêu cầu dịch vụ").
    *   The system renders the main verification report card with status `CHỜ DUYỆT`.
    *   **Admin View**: Site description is read-only; displays "GHI CHÚ" input and action buttons ("✕ Từ chối", "✓ Duyệt khảo sát").
    *   **Coordinator View**: "MÔ TẢ HIỆN TRẠNG" is editable; displays photo upload dropzone and "✓ Cập nhật thông tin khảo sát" button.

*   **Abnormal execution case:**
    *   If loading verification details fails, the system displays an error banner.


