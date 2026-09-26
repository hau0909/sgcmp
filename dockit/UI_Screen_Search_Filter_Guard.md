### [UC-GRD-01] [Search & Filter Guard (Coordinator)]

**Function trigger:** The Coordinator enters search keywords or selects filter options on the Guard List page (`/guards`).

**Function description:** This screen action allows the Coordinator to search security guards by name, phone, or email, and filter the list by work status (Hoàn thành, Phân công, Đang rảnh, Vắng mặt, Đi trễ, Thay thế), account status (Hoạt động, Vô hiệu hóa), and gender (Nam, Nữ).

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The Coordinator inputs text into the search bar (debounced 400ms) or selects dropdown options for work status, account status, or gender.
    *   The system filters and retrieves matching security guard records, updating the table results and pagination controls.
    *   The table displays matching guards with columns: STT, Ảnh, Họ và tên, Giới tính, Số điện thoại, Lịch hôm nay, Trạng thái, and Hành động (Chi tiết).

*   **Abnormal execution case:**
    *   If no matching security guards are found for the applied search/filter criteria, the table displays an empty state message: "Không tìm thấy nhân viên bảo vệ phù hợp."
    *   If a network or server error occurs during filtering, an error message is displayed in the table body.
