### 3.2.5 Register company

**Function trigger:** The user clicks "Đăng ký công ty" (Register Company) on the landing page header or accesses the registration wizard (`/register-company`).

**Function description:** This multi-step form screen enables new security companies to register on the platform through a 4-step wizard process: Account Setup -> Personal Info & Identity -> Company Info & Licensing -> Review & Submit.

**Screen layout:**
*(Insert company registration UI mockup screenshots with step numbers 1 through 15 here)*

**Function Details:**

*   **Step-by-Step UI Component Breakdown:**
    1. **[Header Link] "Đăng ký công ty":** Navigation bar action button on landing header to initiate registration.
    2. **[Step 1 Input] "Họ và tên *":** Full name input field for account setup (Required).
    3. **[Step 1 Input] "Số điện thoại *":** Representative contact phone number (Required).
    4. **[Step 1 Input] "Địa chỉ Email *":** System login email address (Required).
    5. **[Step 1 Inputs] "Mật khẩu *" & "Xác nhận mật khẩu *":** Password creation and password matching validation fields (Required).
    6. **[Step 1 Button] "Thiết lập tài khoản & Tiếp tục":** Form action to validate Step 1 inputs and navigate to Step 2.
    7. **[Step 2 Inputs] "Họ và tên *" & "Số điện thoại *":** Legal representative's full name and phone number (Required).
    8. **[Step 2 Upload] "Ảnh đại diện (Avatar)":** Representative avatar photo upload picker ("Chọn ảnh").
    9. **[Step 2 Inputs] "Số CMND / CCCD *", "Ngày cấp *", "Nơi cấp *":** National Citizen Identity Card details (Required).
    10. **[Step 2 Drag & Drop] "Mặt trước CCCD *" & "Mặt sau CCCD *":** Double-sided identity card photo upload dropzones (Required).
    11. **[Step 2 Button] "Tiếp tục":** Form action to validate Step 2 profile data and advance to Step 3.
    12. **[Step 3 Inputs] "Tên Doanh nghiệp *", "Mã số doanh nghiệp / Mã số thuế *", "Email liên hệ *", "Số điện thoại doanh nghiệp *":** Core business entity information (Required).
    13. **[Step 3 Inputs] "Tỉnh / Thành phố *", "Quận / Huyện / Phường / Xã *", "Số nhà, Tên đường *", "Mô tả về doanh nghiệp":** Headquarter address selection dropdowns, street detail, and optional business summary.
    14. **[Step 3 Uploads] "Logo doanh nghiệp *", "Giấy phép đăng ký kinh doanh (Bản scan PDF/Ảnh) *", "Hình ảnh thực tế hoạt động công ty":** Business logo upload zone, official business license PDF/image attachment, and operational company photo gallery uploads.
    15. **[Step 3 Button] "Tiếp tục":** Form action to validate Step 3 company details and advance to Step 4 (Review & Submit).

*   **Normal execution case:**
    *   The user clicks "Đăng ký công ty" on the top header [1] and accesses `/register-company`.
    *   **Step 1 (Tài khoản):** User fills full name [2], phone number [3], email address [4], creates and confirms password [5], then clicks "Thiết lập tài khoản & Tiếp tục" [6].
    *   **Step 2 (Cá nhân & CCCD):** User verifies personal details [7], uploads avatar [8], inputs CCCD number, date, and place of issue [9], uploads front and back photos of CCCD [10], and clicks "Tiếp tục" [11].
    *   **Step 3 (Doanh nghiệp & Giấy phép):** User inputs company name, tax code, contact email, and business phone [12], selects headquarter address and enters business description [13], uploads company logo, business registration license (PDF/Image), and operational photos [14], then clicks "Tiếp tục" [15].
    *   **Step 4 (Xác nhận & Gửi):** User reviews the compiled summary, agrees to legal compliance terms, and submits the registration request.
    *   Upon successful submission, the system routes the application to the System Admin for moderation and redirects to `/my-registration`.

*   **Abnormal execution case:**
    *   If required inputs (fields 2-5, 7, 9, 10, 12, 13, 14) are missing or improperly formatted, inline field error messages display and wizard step progress is blocked.
    *   If non-matching passwords, invalid email syntax, or duplicate tax code/phone values are entered, validation warnings are shown under the relevant inputs.
    *   If file size limit exceeds maximum allowable thresholds during photo/PDF uploads [8, 10, 14], upload dropzone error toasts trigger.

