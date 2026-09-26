# FEATURE: Bank Account Management

- **Features**: Bank Account Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: UC-BANK-04, UI_Screen_Delete_Bank_Account.md, dev/src/app/(admin)/bank-accounts/page.tsx
- **Pass**: 8
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 8

---

## Bảng Chi Tiết Test Case

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Delete Bank Account** | | | | | | | | |
| 01 | Verify UI of Delete Confirmation modal dialog | 1. Navigate to `/bank-accounts`.<br>2. Click "Xóa" button on target bank account card.<br>3. Observe modal UI elements. | Modal title displays "Xác nhận xóa tài khoản". Displays trash icon, confirmation text with target account number & bank name in bold, and buttons ("Huỷ", "Xóa tài khoản"). | At least 1 bank account exists in system | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 02 | Verify active bank account deletion warning banner | 1. Click "Xóa" button on the **active** bank account card.<br>2. Observe modal body. | Amber warning banner displays inside modal: "Cảnh báo: Đây là tài khoản đang hoạt động. Sau khi xóa, chức năng thanh toán sẽ tạm thời ngưng hoạt động." | Target bank account `is_active` is true | Pass | 23/7/2026 | Nguyen Dinh Hau | Warning State |
| 03 | Verify confirmation modal content for inactive bank account | 1. Click "Xóa" button on an **inactive** bank account card.<br>2. Observe modal body. | Modal displays confirmation message with target account details without displaying the active warning banner. | Target bank account `is_active` is false | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 04 | Verify successful deletion of an inactive bank account | 1. Click "Xóa" button on an inactive bank account card (e.g. Vietcombank '1012345678').<br>2. Click "Xóa tài khoản" button in confirmation modal. | Loading spinner displays on button (`deleting`). Upon API success, modal closes, account is deleted from DB, and parent list refreshes without target account. | Target inactive bank account exists | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 05 | Verify successful deletion of an active bank account | 1. Click "Xóa" button on the active bank account card (e.g. MB Bank '999888777').<br>2. Click "Xóa tài khoản" button in confirmation modal. | Account is deleted. Modal closes, parent list reloads, and parent page shows top amber warning "Chưa có tài khoản nào được kích hoạt...". | Target active bank account exists | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 06 | Verify cancelling deletion via "Huỷ" button | 1. Click "Xóa" button on a bank account card.<br>2. Click "Huỷ" button in modal dialog. | Modal closes immediately. Account is NOT deleted and remains intact in system and on parent list. | Delete confirmation modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 07 | Verify button disabling during deletion request | 1. Click "Xóa tài khoản" button in confirmation modal.<br>2. Observe action buttons while API call is pending. | "Huỷ" and "Xóa tài khoản" buttons are disabled (`deleting=true`) to prevent double submission during API processing. | Delete request is currently pending | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 08 | Verify error banner display on deletion failure | 1. Click "Xóa tài khoản" button when API backend fails or returns error.<br>2. Observe page banner. | Confirmation modal closes, and a red error banner displays at the top of the main Bank Accounts page: "Không thể xóa tài khoản." (or specific API error message). | API request failure or network timeout | Pass | 23/7/2026 | Nguyen Dinh Hau | Exception EX-01 |
