# FEATURE: Bank Account Management

- **Features**: Bank Account Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: UC-BANK-01, UI_Screen_View_Bank_Accounts.md, dev/src/app/(admin)/bank-accounts/page.tsx
- **Pass**: 9
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 9

---

## Bảng Chi Tiết Test Case

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Bank Accounts** | | | | | | | | |
| 01 | Verify UI of View Bank Accounts page | 1. Log in as Admin.<br>2. Navigate to Admin Dashboard > Bank Accounts (`/bank-accounts`).<br>3. Observe header, buttons, and card layout. | Header title "Tài khoản Ngân hàng", subtitle, Refresh button, and "Thêm tài khoản" button display correctly.<br>Bank account cards display bank logo, bank name, bank code, status badge, account holder name, account number, and role label. | Admin is logged in on Web Browser | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 02 | Verify active bank account sorting and visual highlight | 1. Access `/bank-accounts` page.<br>2. Observe card list ordering and visual styling. | Active bank account card is sorted to top/first position with green badge "Đang hoạt động", blue left border, and "Mặc định" role label. | System has multiple bank accounts configured (including 1 active account) | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 03 | Verify inactive bank account display | 1. Access `/bank-accounts` page.<br>2. Observe inactive card layout and styling. | Inactive bank accounts display gray badge "Ngừng hoạt động", standard border, and empty role status (`—`). | System has inactive bank accounts | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 04 | Verify total accounts counter and active status footer summary | 1. Access `/bank-accounts`.<br>2. Scroll down to page footer.<br>3. Observe summary text. | Summary displays correct counts, e.g. "Tổng {N} tài khoản — 1 đang hoạt động" (or "Chưa có tài khoản mặc định" in amber when zero active). | Admin is on Bank Accounts page with loaded data | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 05 | Verify refreshing bank accounts list | 1. On Bank Accounts page, click "Refresh" button (icon `RefreshCw`).<br>2. Observe button state and list update. | Refresh icon spins (`Loader2`) during data fetch. Bank accounts list reloads updated data from API successfully. | Admin is on Bank Accounts page | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 06 | Verify fallback bank logo display when bank image fails to load | 1. View bank account card with logo load failure (e.g. `bank_code` = "MB").<br>2. Observe bank logo container. | Fallback text abbreviation of `bank_code` ("MB") displays in bold primary color inside logo box. | Image load error (`onError`) triggered on card | Pass | 23/7/2026 | Nguyen Dinh Hau | Normal Flow |
| 07 | Verify empty state when no bank accounts exist | 1. Access `/bank-accounts` when database has 0 bank accounts.<br>2. Observe page content. | Empty state container displays Landmark icon, message "Chưa có tài khoản ngân hàng nào.", and button "Thêm tài khoản đầu tiên". | Database has 0 bank accounts | Pass | 23/7/2026 | Nguyen Dinh Hau | Empty State |
| 08 | Verify warning banner when no bank account is active | 1. Access `/bank-accounts` when accounts exist but 0 are active.<br>2. Observe top alert banner. | Amber warning banner displays: "Chưa có tài khoản nào được kích hoạt. Chức năng thanh toán gói dịch vụ hiện không khả dụng. Vui lòng đặt một tài khoản làm mặc định." | System has bank accounts, but no active account | Pass | 23/7/2026 | Nguyen Dinh Hau | Warning State |
| 09 | Verify error banner on API fetch failure | 1. Access `/bank-accounts` when API fails to fetch data (e.g. server error/network timeout).<br>2. Observe page content. | Red error banner displays message: "Không thể tải danh sách tài khoản." (or specific API error message). | API request failure or network error | Pass | 23/7/2026 | Nguyen Dinh Hau | Exception EX-01 |
