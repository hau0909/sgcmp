### [UC-GUARD-01] [Create Guard Account]

**Function trigger:** The Coordinator clicks the "Tạo tài khoản bảo vệ" button on the guard management list screen.

**Function description:** This page allows the Coordinator to register a new security guard account for the company by entering personal details, identity card (CCCD/CMND) information, selecting permanent address dropdowns, uploading staff ID portrait and CCCD front/back images, and submitting profile registration.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Coordinator's role permissions and active company context. [Refer to **BR-01**, **BR-08**, **BR-22**, **BR-32**]
    *   The system evaluates the company's active subscription personnel quota. If quota is available, the form renders with default fields and gender selection "Nam". [Refer to **BR-11**, **BR-12**]
    *   The screen layout consists of:
        *   **Header Section:** Displays title "Thêm nhân viên bảo vệ mới", back navigation arrow, and action buttons ("Lưu thông tin", "Hủy").
        *   **Personal Information Section:** Form fields for Full Name, Date of Birth, Gender radio buttons (Nam/Nữ), Email address, and Phone number.
        *   **Identity Document Section:** Form fields for CCCD/CMND Number, Issue Date, and Issue Place.
        *   **Permanent Address Section:** Dropdowns for City/Province and Ward/Commune, plus Street address text input.
        *   **Document Upload Section:** File dropzone cards for Staff ID Avatar Photo, CCCD Front Photo, and CCCD Back Photo (supporting JPG/PNG formats up to 2MB).
    *   The Coordinator inputs valid information across all required fields and uploads the 3 required image files.
    *   Clicking "Lưu thông tin" validates entries, creates the Guard user account, uploads photo files, saves profile records, displays a success toast notification "Tạo tài khoản bảo vệ thành công. Email xác thực đã được gửi", and redirects to the guard list page.

*   **Abnormal execution case:**
    *   If the company guard quota is exceeded, the system displays an alert banner: "Công ty đã đạt giới hạn số lượng bảo vệ được phép. Vui lòng nâng cấp gói sử dụng dịch vụ trước khi thêm bảo vệ mới" and disables all inputs and submission. [Refer to **BR-12**, **BR-13**]
    *   If required inputs are missing or invalid (invalid name format, age under 18, CCCD not 9 or 12 digits, issue date in future, invalid email or phone format, missing images), inline field errors appear with a top warning banner: "Vui lòng kiểm tra lại các thông tin chưa hợp lệ". [Refer to **BR-05**, **BR-06**, **BR-07**]
    *   If uploaded images exceed 2MB or are not JPG/PNG format, an inline error is displayed: "Ảnh chỉ hỗ trợ định dạng JPG hoặc PNG và dung lượng tối đa 2MB".
    *   If email, phone, or CCCD number is already registered in the system, an error notice is displayed: "Email / Số điện thoại / Số CCCD đã được sử dụng". [Refer to **BR-03**, **BR-04**, **BR-05**]
    *   If photo upload or API server submission fails, an error toast notice is displayed: "Không thể lưu thông tin bảo vệ" while preserving filled form data for retry.
