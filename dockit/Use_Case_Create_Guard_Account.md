# Use Case Specification: Create Guard Account

**UC ID and Name:** UC-GUARD-01 - Create Guard Account
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator clicks the "Tạo tài khoản bảo vệ" (Create Guard Account) button on the guard management page.

**Description:**
The Coordinator registers a new Security Guard account for the company by checking subscription guard quotas, entering personal and identity details, uploading staff portrait and CCCD front/back photos, and submitting the account registration request.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The company has an active SaaS subscription plan and current active personnel count has not reached the plan quota limit.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system creates the Guard account, saves mandatory legal profile details and uploaded photos, issues a verification email, updates company guard quota usage, and displays a success notification.
- **POST-02:** If account creation fails, the system displays appropriate validation error messages or a failure notification and no account is created.

**Normal Flow (Luồng sự kiện chính):**
**A. Create Guard Account Successfully**

1. The Coordinator accesses the Create Guard Account page (`/guards/add`).
2. The system verifies the Coordinator's authentication, role permissions, active company context, and subscription guard quota status.
3. The system displays the guard registration form with sections for Personal Info (Full Name, Date of Birth, Gender, Email, Phone), Identity Document Info (CCCD/CMND Number, Issue Date, Issue Place), Permanent Address (City, Ward, Street address), and Document Photo Uploads (Staff ID Avatar, CCCD Front photo, CCCD Back photo).
4. The Coordinator inputs valid guard profile details (Full Name, Date of Birth, Gender, Email, Phone number, CCCD/CMND number, Issue Date, Issue Place, and Permanent Address).
5. The Coordinator uploads required image files: staff portrait photo, CCCD front photo, and CCCD back photo (JPG/PNG format, maximum 2MB per file).
6. The Coordinator clicks the "Lưu thông tin" (Save Information) button.
7. The system validates all form inputs, creates the Guard user account, uploads photo files, inserts profile records, sends an email verification link to the Guard, displays a success toast notification, and redirects the Coordinator to the Guard list page.

**Alternative Flows (Luồng rẽ nhánh):**

**A.2a Company guard quota limit reached**
1. The system detects that the company's active personnel count has reached or exceeded the subscription quota limit.
2. The system displays an alert message: "Công ty đã đạt giới hạn số lượng bảo vệ được phép. Vui lòng nâng cấp gói sử dụng dịch vụ trước khi thêm bảo vệ mới" and disables form inputs and submission.
3. The use case ends.

**A.4a Invalid or missing required form inputs**
1. The Coordinator submits incomplete or invalid form inputs (missing name, email, phone, address, or CCCD).
2. The system displays inline field errors and a warning banner: "Vui lòng kiểm tra lại các thông tin chưa hợp lệ".
3. The Coordinator corrects the invalid fields and returns to step A.6.

**A.4b Underage guard date of birth**
1. The Coordinator enters a date of birth resulting in an age under 18 years old.
2. The system displays an inline error: "Nhân viên bảo vệ phải từ 18 tuổi trở lên".
3. The Coordinator updates the date of birth to a valid age and returns to step A.6.

**A.4c Duplicate Email, Phone, or CCCD number**
1. The Coordinator enters an Email, Phone number, or CCCD number that is already registered in the system.
2. The system displays the corresponding duplicate error message.
3. The Coordinator provides unique credentials and returns to step A.6.

**Exceptions (Ngoại lệ):**

- **EX-01:** File upload failure during photo processing
  1. An error occurs while uploading staff avatar or CCCD front/back images to storage.
  2. The system displays an error toast notification: "Không thể tải ảnh bảo vệ" or "Không thể tải ảnh mặt trước/sau CCCD".
  3. The submission is halted, allowing the Coordinator to re-upload photos and retry.

- **EX-02:** Server or database failure during profile save
  1. An API server error or database exception occurs during account creation or profile insertion.
  2. The system displays an error toast notification: "Không thể lưu thông tin bảo vệ".
  3. The form retains entered data, allowing the Coordinator to retry.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-02, BR-03, BR-04, BR-05, BR-06, BR-07, BR-08, BR-11, BR-12, BR-13, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
