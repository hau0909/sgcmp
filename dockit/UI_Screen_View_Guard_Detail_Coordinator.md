### [UC-GUARD-03] [View Guard Detail]

**Function trigger:** The Coordinator clicks the "Chi tiết" link on a specific guard row in the guard list or accesses `/guards/[id]`.

**Function description:** This page displays comprehensive profile and legal identity document information of a security guard, with options to edit guard information.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context.
    *   The screen layout displays:
        *   **Header:** Title "Chi tiết nhân viên bảo vệ", back navigation arrow button, and "Chỉnh sửa" action button.
        *   **Profile Card:** Displays circular avatar image, full name, employee code, account status badge ("HOẠT ĐỘNG" / "VÔ HIỆU HÓA"), email, and phone number.
        *   **Personal Details Section:** Displays Date of Birth, Gender (Nam / Nữ), Permanent Address, Email, and Phone number.
        *   **Identity Document Section:** Displays CCCD/CMND Number, Issue Date, Issue Place, and preview images for CCCD Front Photo and CCCD Back Photo.
    *   The Coordinator views and inspects the guard profile details and legal identity documents.

*   **Abnormal execution case:**
    *   If the guard profile record is not found or the guard ID parameter is invalid, the page displays a centered error notice: "Không tìm thấy thông tin bảo vệ."
    *   If an API or server error occurs during profile data retrieval, the page clears loading skeletons and renders an error banner: "Không thể tải thông tin bảo vệ".
