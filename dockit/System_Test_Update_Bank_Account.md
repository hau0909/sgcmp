# FEATURE: Bank Account Management

- **Features**: Bank Account Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: UC-BANK-03, UI_Screen_Update_Bank_Account.md, dev/src/features/payment/component/BankAccountFormDialog.tsx
- **Pass**: 9
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 9

---

## Bảng Chi Tiết Test Case

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Update Bank Account** | | | | | | | | |
| 01 | Verify UI of Update Bank Account modal dialog | 1. Navigate to `/bank-accounts`.<br>2. Click "Chỉnh sửa" icon on target bank account card.<br>3. Observe modal UI elements. | Modal title displays "Cập nhật tài khoản ngân hàng". Form displays pre-filled inputs and action buttons ("Huỷ", "Lưu thay đổi"). | At least 1 bank account exists in system | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 02 | Verify pre-filling existing account details into form fields | 1. Open Update Bank Account modal for selected account (e.g. Vietcombank '1012345678').<br>2. Inspect value of all fields. | Bank dropdown, Bank Name, Account Number, and Account Name are pre-filled with the exact current data of the selected account. | Selected bank account exists | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 03 | Verify updating Bank selection & auto-filling new Bank Name | 1. Open Update Bank Account modal.<br>2. Select "MB Bank" from Bank dropdown.<br>3. Observe "Tên ngân hàng" input field. | "Tên ngân hàng" input field automatically updates to reflect MB Bank's full name ("Ngân hàng TMCP Quân đội (MB)"). | Update Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 04 | Verify successful update of bank account details | 1. Open Update Bank Account modal.<br>2. Modify Account Number to '999888777' and Account Name to 'NGUYEN DINH HAU UPDATED'.<br>3. Click "Lưu thay đổi" button. | Loading spinner displays on button (`loading`). Upon success, modal closes, updated data is saved in DB, and parent page list refreshes displaying new values. | Update Bank Account modal is open with valid modifications | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 05 | Verify submitting form after clearing a required field | 1. Open Update Bank Account modal.<br>2. Clear "Số tài khoản" field.<br>3. Click "Lưu thay đổi" button. | Browser HTML5 default validation blocks submission and highlights the cleared mandatory field. Modal remains open. | Update Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Validation Error |
| 06 | Verify automatic non-numeric filtering when editing Account Number | 1. Open Update Bank Account modal.<br>2. Type '999abc888!' into "Số tài khoản" field. | System automatically strips non-numeric characters, permitting only digits `0-9` to be entered ('999888'). | Update Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify character sanitization and auto-uppercase when editing Account Name | 1. Open Update Bank Account modal.<br>2. Type 'hau test 123!' into "Tên chủ tài khoản" field. | System removes numbers/symbols and automatically converts lowercase letters to UPPERCASE ('HAU TEST'). | Update Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Validation Error |
| 08 | Verify inline error message display on API update failure | 1. Open Update Bank Account modal.<br>2. Modify Account Number to '999888777'.<br>3. Click "Lưu thay đổi" when server returns an error or network drops. | Red inline error alert displays above buttons: "Đã xảy ra lỗi. Vui lòng thử lại." (or specific API error message). Modal remains open. | API request failure or network error | Pass | 23/7/2026 | Nguyen Dinh Hau | Exception EX-01 |
| 09 | Verify closing Update modal without saving changes | 1. Open Update Bank Account modal.<br>2. Edit Account Number to '111222333'.<br>3. Click "Huỷ" button or "X" icon on header. | Modal closes immediately. Original bank account data remains unchanged in system and on parent list. | Update Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
