### [UC-SHIFT-06] [Dispatch Replacement Guard]

**Function trigger:** The Coordinator clicks the "Điều động bảo vệ thay thế" button inside the Shift Detail Modal for a shift containing absent or late guard slots.

**Function description:** This modal side-panel screen enables the Coordinator to inspect missing guard slots on an active work shift, search and filter eligible replacement guard candidates, assign standby guards to target slots, and confirm emergency dispatch.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context. [Refer to **BR-01**, **BR-08**, **BR-22**, **BR-32**]
    *   Opening the Shift Detail Modal automatically evaluates guard attendance status and identifies slots eligible for replacement.
    *   Clicking "Điều động bảo vệ thay thế" slides open the Dispatch Replacement Panel adjacent to the shift details modal.
    *   The Dispatch Panel displays:
        *   **Panel Header:** Displays title "Điều động bảo vệ thay thế", close button, and target slot selection tabs/badges.
        *   **Search Input:** Allows filtering candidate guards by full name or phone number.
        *   **Candidate Guard Sections:** Categorized into two lists:
            *   "Bảo vệ thuộc hợp đồng": Displays eligible guards assigned to the contract.
            *   "Bảo vệ khả dụng khác": Displays other available active company guards, automatically excluding guards with schedule conflicts. [Refer to **BR-35**, **BR-39**]
        *   **Candidate Cards:** Displays guard avatar, full name, phone number, and a selection toggle button.
    *   Selecting a candidate guard highlights the target slot badge with a green checkmark ("✓ Đã chọn").
    *   When all absent slots have assigned replacement guards, the "Xác nhận điều động" button is enabled. [Refer to **BR-40**]
    *   Clicking "Xác nhận điều động" submits the dispatch request. On success, the system displays a success toast notification "Điều động bảo vệ thay thế thành công", triggers a schedule refresh event, and closes the modal. [Refer to **BR-40**]

*   **Abnormal execution case:**
    *   If the shift has ended or is marked as completed, the dispatch feature is disabled with a notice: "Ca làm việc đã kết thúc, không thể điều động thay thế".
    *   If no eligible replacement candidates exist during the shift hours, the panel displays an empty state notice: "Không có bảo vệ nào khả dụng trong khung giờ này. Vui lòng kiểm tra lại lịch phân công".
    *   If the Coordinator attempts to submit before selecting replacement guards for all required slots, the system displays an error message: "Vui lòng chọn bảo vệ thay thế cho tất cả các vị trí".
    *   If an API or server error occurs during submission, the system displays an error banner notice: "Cập nhật bảo vệ thay thế thất bại" and keeps the panel open for retry.
