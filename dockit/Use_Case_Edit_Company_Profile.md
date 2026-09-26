# Use Case Specification: Edit Company Profile

**UC ID and Name:** UC-COMP-01 - Edit Company Profile
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin accesses the "Hồ sơ công ty" (My Company) page and clicks the "Chỉnh sửa" (Edit Profile) button.

**Description:**
The Company Admin updates company profile information, including company name, description, contact email, phone number, permanent address (City/Ward selections), attendance thresholds (allowed late and absent minutes), company logo, cover banner, and company activity images.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Company Admin role permissions and an active account status.
- **PRE-02:** The user is linked to an active security company account.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system saves modified company profile details and image uploads, displays a success notification, and updates the profile display.
- **POST-02:** If updates fail, the system displays validation or API error notifications and no changes are saved.

**Normal Flow (Luồng sự kiện chính):**
**A. Edit Company Profile Successfully**

1. The Company Admin views the My Company page (`/my-company`).
2. The Company Admin clicks the "Chỉnh sửa" (Edit Profile) button.
3. The system enables edit mode on form input fields (Company Name, Description, Email, Phone number, City/Ward dropdowns, Street Address, Allowed Late Minutes, Allowed Absent Minutes) and image upload controls.
4. The Company Admin updates profile text fields or uploads new logo/banner/activity photos.
5. The Company Admin clicks the "Lưu thay đổi" (Save Changes) button.
6. The system validates form inputs, uploads new image files to storage, updates company profile database records, displays a success toast notification ("Cập nhật thông tin công ty thành công"), and exits edit mode.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Cancel company profile editing**
1. The Company Admin clicks the "Hủy" (Cancel) button before saving.
2. The system discards pending edits, restores original profile data, and exits edit mode.

**A.4b Upload company logo or cover banner photo**
1. The Company Admin clicks the logo or banner camera icon and selects an image file (JPG, PNG, WebP up to 5MB).
2. The system validates the file format and size, uploads the image, and updates the profile preview.

**A.4c Upload company activity gallery photos**
1. The Company Admin clicks "Thêm ảnh hoạt động" and selects one or multiple image files.
2. The system uploads the photos and appends them to the company activity gallery.

**A.4d Invalid form input fields**
1. The Company Admin submits empty required fields or invalid email/phone formats.
2. The system displays inline field errors and a top toast notice ("Vui lòng kiểm tra lại thông tin chưa hợp lệ").
3. The Company Admin corrects the invalid fields and returns to step A.5.

**Exceptions (Ngoại lệ):**

- **EX-01:** Image upload failure due to file size or format restrictions
  1. The selected image exceeds 5MB or has an unsupported file extension.
  2. The system displays an error toast notification ("Ảnh vượt quá 5MB hoặc định dạng không hỗ trợ") and cancels the upload.

- **EX-02:** Server or network API failure during profile save
  1. An API error occurs while saving profile updates.
  2. The system displays an error banner ("Không thể cập nhật thông tin công ty") and retains entered changes in edit mode for retry.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
