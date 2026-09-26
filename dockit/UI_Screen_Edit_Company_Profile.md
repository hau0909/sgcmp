### [UC-COMP-01] [Edit Company Profile]

**Function trigger:** The Company Admin clicks the "Chỉnh sửa" button on the My Company profile page.

**Function description:** This page mode enables the Company Admin to update company information, contact details, permanent address (City/Ward dropdowns), attendance shift thresholds (allowed late and absent grace periods), and upload company logo, cover banner, and company activity images.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Company Admin's role permissions and active company context.
    *   The screen displays the company profile edit form consisting of:
        *   **Header Section:** Company status badge, "Hủy" button, and primary "Lưu thay đổi" button.
        *   **Cover Banner & Logo Upload Zone:** Camera upload icons for changing cover banner and company avatar logo (JPG, PNG, WebP up to 5MB).
        *   **Company General Information:** Editable text inputs for Company Name and Description.
        *   **Contact Information:** Editable inputs for Contact Email and Contact Phone.
        *   **Address Information:** Dropdown selectors for City/Province and Ward/Commune, plus Street address text input.
        *   **Attendance Policy Configuration:** Numerical inputs for Allowed Late Minutes (default 5 minutes) and Allowed Absent Minutes (default 35 minutes).
        *   **Company Activity Gallery:** Photo upload card supporting single or batch file selection to add activity photos.
    *   The Company Admin modifies the desired fields or uploads images, and clicks "Lưu thay đổi".
    *   The system validates entries, uploads image files, saves company profile updates, displays a success toast notification ("Cập nhật thông tin công ty thành công"), and exits edit mode.

*   **Abnormal execution case:**
    *   If required inputs are missing (company name, description, address, email, phone) or have invalid formats, red inline field validation messages appear and a warning toast is shown: "Vui lòng kiểm tra lại thông tin chưa hợp lệ."
    *   If an uploaded logo, banner, or activity photo file exceeds 5MB or has an invalid format, an error toast is rendered: "File ảnh vượt quá 5MB hoặc định dạng không hỗ trợ."
    *   If photo upload or API server save fails, an error toast notification is displayed: "Không thể cập nhật thông tin công ty" while keeping entered changes in edit mode for retry.
