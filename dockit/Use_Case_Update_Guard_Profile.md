# Use Case Specification: Update Guard Profile

**UC ID and Name:** UC-GUARD-04 - Update Guard Profile
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator clicks the "Chỉnh sửa" (Edit Profile) button on the guard detail page.

**Description:**
The Coordinator modifies personal profile details, identity card (CCCD/CMND) information, permanent address, and re-uploads avatar or CCCD photos for a security guard profile.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The target guard belongs to the Coordinator's active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system updates guard profile database records, uploads new photo files, displays a success notification, and refreshes the detail view.
- **POST-02:** If the update fails, the system displays an error notification and no profile changes are saved.

**Normal Flow (Luồng sự kiện chính):**
**A. Update Guard Profile Successfully**

1. The Coordinator views the Guard Detail page (`/guards/[id]`).
2. The Coordinator clicks the "Chỉnh sửa" (Edit Profile) button.
3. The system enables edit mode on form inputs (Full Name, Date of Birth, Gender, CCCD Number, Issue Date, Issue Place, Address, Phone, Email) and photo upload dropzones.
4. The Coordinator updates guard profile details and re-uploads photo files if necessary.
5. The Coordinator clicks the "Lưu" (Save) button.
6. The system validates all form entries, uploads updated photo files, updates guard database records, displays a success toast notification ("Cập nhật thông tin bảo vệ thành công"), and exits edit mode.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Cancel profile editing**
1. The Coordinator clicks the "Hủy" (Cancel) button before saving.
2. The system discards all modified entries, restores original profile data, and exits edit mode.

**A.4b Invalid form input fields**
1. The Coordinator submits invalid or incomplete form inputs (invalid name format, age under 18, CCCD not 9 or 12 digits, future dates, invalid phone or email).
2. The system displays inline field validation errors and a top error banner ("Vui lòng kiểm tra lại các thông tin chưa hợp lệ").
3. The Coordinator corrects the invalid fields and returns to step A.5.

**Exceptions (Ngoại lệ):**

- **EX-01:** File upload failure during photo processing
  1. Image upload fails for avatar or CCCD front/back photo files.
  2. The system displays an error notice ("Không thể tải ảnh đại diện" or "Không thể tải ảnh CCCD") and keeps the form in edit mode.

- **EX-02:** Server or database API failure during profile save
  1. An API error occurs while saving updated guard profile details.
  2. The system displays an error banner ("Không thể cập nhật hồ sơ") and retains modified inputs for retry.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-03, BR-04, BR-05, BR-06, BR-07, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
