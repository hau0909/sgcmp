### [UC-SHIFT-04] [Create Work Shift]

**Function trigger:** The Coordinator clicks the "Tạo ca làm việc" (Create Shift) button on the shift schedule page.

**Function description:** This modal screen enables the Coordinator to configure and create a new work shift for an active contract, select shift dates, set time durations, optionally split time slots, select eligible active security guards, validate schedule conflicts, and submit the shift creation request.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the Coordinator's role permissions and active company context. [Refer to **BR-01**, **BR-08**, **BR-22**, **BR-32**]
    *   The modal header displays the title "Tạo ca làm việc mới" and a close button.
    *   The modal form provides the following interactive sections:
        *   **Contract Dropdown Selector:** Lists active company contracts showing contract code, customer name, and status. Selecting a contract populates its validity date range, target location address, and required guard slot count. [Refer to **BR-33**, **BR-34**]
        *   **Shift Date Picker:** Enables date selection. The selected date must be within the contract's start and end dates. [Refer to **BR-33**]
        *   **Time Duration Inputs:** Inputs for start time and end time. Displays calculated duration and enforces maximum 8-hour shift segment limits. [Refer to **BR-37**]
        *   **Slot Splitting Feature:** Option to split multi-hour booking slots into contiguous, non-overlapping shift segments. [Refer to **BR-38**]
        *   **Guard Selection List:** Displays eligible active security guards with a search bar, guard avatars, full names, phone numbers, and availability indicators. [Refer to **BR-34**, **BR-36**]
    *   Selecting guards automatically validates schedule availability. Eligible guards can be checked, while guards with overlapping shifts are flagged and disabled. [Refer to **BR-35**]
    *   When all form validations pass and guard quota requirements are satisfied, the "Lưu & Tạo ca" button is enabled.
    *   Clicking "Lưu & Tạo ca" submits the request. On success, the system displays a success toast notification "Tạo ca làm việc thành công" [Refer to **MSG24**], closes the modal, and refreshes the schedule grid.

*   **Abnormal execution case:**
    *   If required inputs (Contract, Date, or Guard selection) are incomplete, the submission button remains disabled and inline field warnings are displayed. [Refer to **MSG25**, **MSG26**, **MSG28**]
    *   If the selected shift date is outside the contract validity period, the system displays an error banner: "Ngày bắt đầu ca trực phải nằm trong thời hạn hợp đồng". [Refer to **BR-33**, **MSG32**]
    *   If a shift segment duration exceeds 8 hours, a warning notice is displayed: "Ca trực không được vượt quá 8 tiếng". [Refer to **BR-37**, **MSG31**]
    *   If the number of selected guards does not match the required slot quota, the status displays "cần điều chỉnh" and an inline warning is shown: "Số bảo vệ được chọn phải bằng số lượng bảo vệ cần". [Refer to **BR-34**, **MSG29**]
    *   If a selected guard has an overlapping shift during the specified hours, a red conflict badge ("Trùng lịch ca trực") is displayed and the guard item is disabled. [Refer to **BR-35**, **MSG30**]
    *   If slot splitting configuration contains gaps or overlaps, split error messages are displayed. [Refer to **MSG33**, **MSG34**, **MSG35**]
    *   If an API server error occurs during creation, the system displays an error toast notification: "Tạo ca trực thất bại". [Refer to **MSG36**]
