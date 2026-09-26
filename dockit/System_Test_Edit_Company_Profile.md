# FEATURE: Company Profile Management

- **Features**: Company Profile Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(company)/my-company/page.tsx, dev/src/features/company/components/MyCompanyDetail.tsx
- **Pass**: 12
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 12

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Edit Company Profile** | | | | | | | | |
| 01 | Verify Switching to Profile Edit Mode ("Chỉnh sửa thông tin") | 1. Access `/my-company` as Company Admin.<br>2. Click "Chỉnh sửa thông tin" button. | Profile fields change to editable input textareas/inputs, header displays "Lưu thay đổi" and "Hủy" action buttons. | Company Admin is on `/my-company`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Modifying Company Text Information (Name, Description, Address, Phone, Email) | 1. Enable Edit Mode.<br>2. Modify `Tên công ty` to "Công ty Dịch vụ Bảo vệ Sentinel VIỆT NAM".<br>3. Update description, phone number, and address fields. | Text input fields accept updated character values smoothly. | Profile Edit Mode is active. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Validation: Empty Company Name | 1. Enable Edit Mode.<br>2. Clear `Tên công ty` input (empty string).<br>3. Click "Lưu thay đổi" button. | Validation error message "Tên công ty không được để trống" displays under field; save is blocked. | Profile Edit Mode is active with empty company name. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 04 | Verify Validation: Empty Phone Number | 1. Enable Edit Mode.<br>2. Clear `Số điện thoại` input.<br>3. Click "Lưu thay đổi" button. | Validation error message "Số điện thoại không được để trống" displays under field. | Profile Edit Mode is active with empty phone. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 05 | Verify Validation: Invalid Phone Number Format | 1. Enable Edit Mode.<br>2. Enter `Số điện thoại` = 'abc12345'.<br>3. Click "Lưu thay đổi" button. | Validation error message "Số điện thoại không hợp lệ" displays under field. | Profile Edit Mode is active with invalid phone format. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 06 | Verify Validation: Empty Email Address | 1. Enable Edit Mode.<br>2. Clear `Email liên hệ` input.<br>3. Click "Lưu thay đổi" button. | Validation error message "Email liên hệ không được để trống" displays under field. | Profile Edit Mode is active with empty email. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify Validation: Invalid Email Address Format | 1. Enable Edit Mode.<br>2. Enter `Email liên hệ` = 'invalidemail'.<br>3. Click "Lưu thay đổi" button. | Validation error message "Địa chỉ email không hợp lệ" displays under field. | Profile Edit Mode is active with invalid email format. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 08 | Verify Uploading & Updating Company Logo | 1. In Edit Mode, click camera icon on Logo container.<br>2. Select a valid PNG image file (`logo-new.png`, < 5MB). | Image file uploads via API `requestUploadCompanyImage`, logo container preview updates immediately with new image. | Profile Edit Mode is active. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 09 | Verify Uploading & Updating Company Banner | 1. In Edit Mode, click camera/upload icon on Banner section.<br>2. Select a valid JPG image file (`banner-new.jpg`, < 5MB). | Banner image uploads successfully, updating background preview image immediately. | Profile Edit Mode is active. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 10 | Verify Validation: Upload Image Exceeding Maximum Size (> 5MB) | 1. In Edit Mode, select image file `large-logo.png` (> 5MB).<br>2. Attempt upload. | Toast error notification "Kích thước ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn." displays. | Profile Edit Mode is active with oversized file. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 11 | Verify Saving Updated Company Profile Successfully | 1. After making valid edits to company info and images, click "Lưu thay đổi" button. | API `requestUpdateCompanyProfile` is called, edit mode turns off, updated company information displays, and success toast notification pops up. | Valid profile changes are made in Edit Mode. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 12 | Verify Canceling Profile Edits without Saving Changes ("Hủy") | 1. In Edit Mode, modify company description text.<br>2. Click "Hủy" button. | Edit mode turns off, modified changes are discarded, and original company profile data is restored. | Profile Edit Mode is active with unsaved changes. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
