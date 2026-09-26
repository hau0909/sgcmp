# FEATURE: Registration Management

- **Features**: Registration Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(customer)/my-registration/page.tsx, dev/src/features/registration/components/MyRegistrationView.tsx
- **Pass**: 10
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 10

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Update company registration request** | | | | | | | | |
| 01 | Verify Edit Button Enabled State for Rejected Registration | 1. Access `/my-registration` when status is `rejected`.<br>2. Observe "Chỉnh sửa hồ sơ" button in header. | "Chỉnh sửa hồ sơ" button is enabled, highlighted in primary border style, with tooltip indicating edit is allowed for resubmission. | Registration status is `rejected`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Edit Button Disabled State for Pending Registration | 1. Access `/my-registration` when status is `pending`.<br>2. Observe "Chỉnh sửa hồ sơ" button. | "Chỉnh sửa hồ sơ" button is disabled (grayed out) with tooltip explaining editing is disabled while application is pending review. | Registration status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 03 | Verify Edit Button Disabled State for Approved Registration | 1. Access `/my-registration` when status is `approved`.<br>2. Observe "Chỉnh sửa hồ sơ" button. | "Chỉnh sửa hồ sơ" button is disabled (grayed out) with tooltip explaining editing is disabled after application is approved. | Registration status is `approved`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.2 |
| 04 | Verify Navigating to Registration Edit Form when Clicking Edit | 1. Access `/my-registration` (`rejected`).<br>2. Click "Chỉnh sửa hồ sơ" button. | System navigates to registration edit form pre-populated with existing registration data. | Registration status is `rejected`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Re-submitting Updated Company Registration Data | 1. On Registration Edit form, modify updated info (e.g. re-upload clear CCCD back image, update address).<br>2. Click "Gửi lại hồ sơ" button. | Updated registration data is saved, status updates back to `pending`, and success notification displays. | User is on Registration Edit form. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Validation Error: Empty Company Name during Update | 1. On Registration Edit form, clear `Tên công ty` field.<br>2. Click "Gửi lại hồ sơ". | Red error message "Vui lòng nhập tên công ty" displays; form submission is blocked. | User is on Registration Edit form with empty company name. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify Validation Error: Empty Tax Code / Business License No | 1. On Registration Edit form, clear `Mã số thuế` field.<br>2. Click "Gửi lại hồ sơ". | Red error message "Vui lòng nhập mã số thuế" displays; form submission is blocked. | User is on Registration Edit form with empty tax code. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 08 | Verify Validation Error: Missing Business License PDF | 1. On Registration Edit form, remove attached business license PDF.<br>2. Click "Gửi lại hồ sơ". | Red error message "Vui lòng tải lên Giấy phép kinh doanh" displays; form submission is blocked. | User is on Registration Edit form without license PDF. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 09 | Verify Validation Error: Missing Representative CCCD Image | 1. On Registration Edit form, remove CCCD back photo.<br>2. Click "Gửi lại hồ sơ". | Red error message "Vui lòng tải lên đủ ảnh CCCD mặt trước và mặt sau" displays. | User is on Registration Edit form with missing identity photo. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 10 | Verify Canceling Registration Update without Saving Changes | 1. On Registration Edit form, make changes.<br>2. Click "Hủy" button. | System prompts confirmation or returns to `/my-registration` view without saving edited changes. | User is on Registration Edit form. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.3 |
