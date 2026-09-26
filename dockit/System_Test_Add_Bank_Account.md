# FEATURE: Bank Account Management

- **Features**: Bank Account Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: UC-BANK-02, UI_Screen_Add_Bank_Account.md, dev/src/features/payment/component/BankAccountFormDialog.tsx
- **Pass**: 8
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 8

---

## Bảng Chi Tiết Test Case

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Add Bank Account** | | | | | | | | |
| 01 | Verify UI of Add Bank Account modal dialog | 1. Navigate to `/bank-accounts`.<br>2. Click "Thêm tài khoản" button.<br>3. Observe modal UI elements. | Modal title displays "Thêm tài khoản ngân hàng". Fields include Bank dropdown (*), Bank Name (*), Account Number (*), Account Name (*), helper notes, and buttons ("Huỷ", "Thêm mới"). | Admin is on Bank Accounts page | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 02 | Verify auto-populating Bank Name on selecting Bank dropdown | 1. Open Add Bank Account modal.<br>2. Select "Vietcombank" from Bank dropdown.<br>3. Observe "Tên ngân hàng" input field. | "Tên ngân hàng" field is automatically filled with full name: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)". | Add Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 03 | Verify successful creation of a new bank account | 1. Open Add Bank Account modal.<br>2. Select "Vietcombank" from dropdown.<br>3. Enter Account Number '1012345678'.<br>4. Enter Account Name 'NGUYEN DINH HAU'.<br>5. Click "Thêm mới" button. | Loading spinner displays on button (`loading`). Upon success, modal closes, new account is saved in DB, and parent page list refreshes. | Add Bank Account modal is open with valid inputs | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 04 | Verify submitting form with empty required fields | 1. Open Add Bank Account modal.<br>2. Leave mandatory fields (Bank, Account Number, Account Name) blank.<br>3. Click "Thêm mới" button. | Browser HTML5 default validation blocks form submission and highlights required missing fields. Modal remains open. | Add Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Validation Error |
| 05 | Verify automatic non-numeric character filtering in Account Number field | 1. Open Add Bank Account modal.<br>2. Focus on "Số tài khoản" field.<br>3. Type '123abc456!@#' into field. | System automatically strips non-numeric characters, allowing only digits `0-9` to be entered ('123456'). | Add Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Validation Error |
| 06 | Verify character sanitization and auto-uppercase in Account Name field | 1. Open Add Bank Account modal.<br>2. Focus on "Tên chủ tài khoản" field.<br>3. Type 'nguyen dinh hau 123!' into field. | System removes numbers/symbols and automatically converts text to UPPERCASE ('NGUYEN DINH HAU'). | Add Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify inline error message display on API creation failure | 1. Open Add Bank Account modal.<br>2. Fill Bank 'Vietcombank', Account Number '1012345678', Account Name 'NGUYEN DINH HAU'.<br>3. Click "Thêm mới" when API fails or network drops. | Red inline error block displays above buttons: "Đã xảy ra lỗi. Vui lòng thử lại." (or specific API error message). Modal remains open. | API request failure or network timeout | Pass | 23/7/2026 | Nguyen Dinh Hau | Exception EX-01 |
| 08 | Verify closing modal via Cancel button or Close (X) button | 1. Open Add Bank Account modal.<br>2. Enter Account Number '987654321'.<br>3. Click "Huỷ" button or "X" icon on header. | Modal closes immediately without saving any data or triggering API request. | Add Bank Account modal is open | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
