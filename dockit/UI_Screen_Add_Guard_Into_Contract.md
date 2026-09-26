### [UC-CONT-01] [Add Guard Into Contract]

**Function trigger:** The user clicks the "Cập nhật bảo vệ" button in the "Phân công bảo vệ" section on the Contract Detail page (`/contracts/[id]`).

**Function description:** This modal enables Company Admins or Coordinators to select and assign active company security personnel to a service contract.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the user's role permissions and active company context.
    *   Clicking "Cập nhật bảo vệ" opens the modal:
        *   **Modal Header:** Title "Cập nhật danh sách bảo vệ" and close "X" icon button.
        *   **Search Bar:** Keyword input placeholder "Tìm kiếm bảo vệ theo tên, số điện thoại, email...".
        *   **Guard Pool Grid:** 2-column grid displaying active security guard cards (Avatar, Full Name, Phone number) with interactive selection checkboxes.
        *   **Pagination Footer:** Page navigation controls (Previous arrow, page counter "Trang X / Y", Next arrow).
        *   **Modal Action Bar:** Selected counter indicator ("Đã chọn: N nhân sự"), "Hủy bỏ" button, and primary "Lưu thay đổi" button.
    *   The user selects/deselects guard cards, and clicks "Lưu thay đổi".
    *   The system updates contract guard assignments, displays a success toast notification ("Cập nhật danh sách bảo vệ thành công!"), closes the modal, and refreshes the assigned guards list on the contract detail screen.

*   **Abnormal execution case:**
    *   If no active guards match the search query, the modal body renders an empty state message: "Không tìm thấy nhân viên bảo vệ hoạt động nào phù hợp."
    *   If an API or server error occurs during guard assignment save, an error toast notification is displayed: "Có lỗi xảy ra khi lưu" while keeping the modal open for retry.
