### [UC-GUARD-04] [Update Guard Profile]

**Function trigger:** The Coordinator clicks the "Chỉnh sửa" button on the guard detail screen.

**Function description:** This page mode enables the Coordinator to update personal information, identity card details, address dropdowns, and re-upload staff avatar or CCCD front/back photo documents for a security guard profile.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context.
    *   The screen layout transitions to edit mode:
        *   **Header:** Title "Chi tiết nhân viên bảo vệ", back navigation arrow, and action buttons ("Lưu", "Hủy").
        *   **Avatar Upload Dropzone:** Interactive avatar image dropzone supporting click to browse and photo preview update.
        *   **Personal Information Form:** Editable fields for Full Name, Date of Birth, Gender (Nam / Nữ), Email, and Phone number.
        *   **Identity Document Form:** Editable fields for CCCD/CMND Number, Issue Date, and Issue Place.
        *   **Permanent Address Form:** Cascading dropdowns for City/Province and Ward/Commune, plus Street address text input.
        *   **Document Upload Cards:** Re-upload dropzone cards for CCCD Front Photo and CCCD Back Photo (supporting JPG/PNG formats up to 2MB).
    *   The Coordinator modifies the desired fields and re-uploads new photo files if necessary.
    *   Clicking "Lưu" validates form inputs, uploads modified photo files, updates guard database records, displays a success toast notification "Cập nhật thông tin bảo vệ thành công", and exits edit mode.

*   **Abnormal execution case:**
    *   If required inputs are missing or invalid (invalid name format, age under 18, CCCD not 9 or 12 digits, future issue date, invalid phone or email), inline red field errors appear with a top error banner: "Vui lòng kiểm tra lại các thông tin chưa hợp lệ".
    *   If re-uploaded image files exceed 2MB or are not JPG/PNG format, an inline error message is displayed: "Ảnh chỉ hỗ trợ định dạng JPG hoặc PNG và dung lượng tối đa 2MB".
    *   If photo upload or API server save fails, an error banner is displayed: "Không thể lưu thông tin bảo vệ" while keeping form inputs in edit mode for retry.
