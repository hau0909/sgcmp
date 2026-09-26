### [UC-GUARD-02] [View Guards]

**Function trigger:** The Coordinator selects the "Danh sách bảo vệ" option from the system navigation menu or accesses the `/guards` page.

**Function description:** This screen allows the Coordinator to view company security guards, inspect real-time duty status, paginate through guard records, and trigger account creation or profile detail views.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context.
    *   The screen displays the guard management interface consisting of:
        *   **Header:** Title "Danh sách nhân viên bảo vệ", page description, and "Thêm bảo vệ" action button.
        *   **Guards Table:** Displays guard records with columns for STT, Avatar, Full Name & Email, Gender, Phone number, Today's Schedule status badge (ĐANG RẢNH, PHÂN CÔNG, ĐANG TRỰC, VẮNG MẶT, ĐI TRỄ, THAY THẾ), Account Status badge (HOẠT ĐỘNG / VÔ HIỆU HÓA), and "Chi tiết" action link.
        *   **Pagination Footer:** Displays result counter ("Hiển thị X-Y trong số Z kết quả") and page navigation controls.
    *   The Coordinator views and inspects the guard list.

*   **Abnormal execution case:**
    *   If no guard records exist for the company, the table body displays a centered empty state notice: "Chưa có nhân viên bảo vệ."
    *   If an API or server error occurs during guard list retrieval, the table body clears loading skeletons and renders a red error message: "Không thể tải danh sách bảo vệ".
