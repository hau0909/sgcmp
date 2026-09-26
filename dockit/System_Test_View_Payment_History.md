# FEATURE: Subscription Management

- **Features**: Subscription Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: UC-??-View and Manage Subscription, dev/src/features/subscription/components/TransactionHistory.tsx, dev/src/app/(company)/billing/page.tsx
- **Pass**: 8
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 8

---

## Bảng Chi Tiết Test Case

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Payment History** | | | | | | | | |
| 01 | Verify UI Layout of Transaction History Table | 1. Access `/billing` page as Company Admin.<br>2. Scroll down to Transaction History section.<br>3. Observe section header and table headers. | Card section header displays "Lịch sử giao dịch".<br>Table headers display 6 columns: Mã Thanh Toán, Mã Giao Dịch, Ngày, Gói Dịch Vụ, Số Tiền (VNĐ), and Trạng Thái. | PRE-01: User is logged in as Company Admin.<br>PRE-02: User is associated with a valid company account. | Pass | 01/06/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Payment Transaction Records | 1. Access `/billing` page when company has existing payment records.<br>2. Observe transaction table data rows. | Payment ID displays first 8 uppercase characters (e.g. `PAY12345`).<br>Transaction code displays exact code (e.g. `FT26072389`) or '-' fallback.<br>Date is formatted correctly according to locale (`DD/MM/YYYY`).<br>Gói dịch vụ displays matched plan name (e.g. "Gói Chuyên Nghiệp").<br>Amount displays formatted number (e.g. `500.000`). | Payment records exist in company payment history. | Pass | 01/06/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Status Badge Color Coding & Labels | 1. Access `/billing` page.<br>2. Observe "Trạng Thái" column for payments with different statuses. | `completed` -> Green badge "Thành công" (`bg-emerald-50 text-emerald-700`).<br>`pending` -> Amber badge "Chờ xử lý" (`bg-amber-50 text-amber-700`).<br>`failed` -> Red badge "Thất bại" (`bg-rose-50 text-rose-700`).<br>`refunded` -> Blue badge "Đã hoàn tiền" (`bg-blue-50 text-blue-700`). | Payments with various status states exist in DB. | Pass | 01/06/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Empty State when Company has no Payment History | 1. Access `/billing` page when company has 0 payment records.<br>2. Observe Transaction History table body. | Single table row spanning all 6 columns displays empty state message text: "Không có giao dịch nào". | Company has zero payment history. | Pass | 01/06/2026 | Nguyen Dinh Hau | Alternative Flow A.3 |
| 05 | Verify Loading Indicator while fetching Payment History | 1. Access `/billing` page.<br>2. Observe page during initial API fetch. | Animated pulse text "Đang tải thông tin gói dịch vụ & thanh toán..." displays until API data loading completes. | Billing page is loading data. | Pass | 01/06/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Warning Message when Company Account Profile is missing | 1. Access `/billing` page as a user with missing company context (`company_id` is null).<br>2. Observe page content. | System displays warning message: "Không tìm thấy thông tin tài khoản doanh nghiệp." and halts further data rendering. | PRE-02 not met (`company_id` missing). | Pass | 01/06/2026 | Nguyen Dinh Hau | Alternative Flow A.2 |
| 07 | Verify Graceful Degradation on Payment History API Error | 1. Access `/billing` page when `requestGetPaymentHistory` API call fails or network drops.<br>2. Observe Transaction History table and page layout. | System catches API error, logs to console, and falls back to empty array `[]` ("Không có giao dịch nào"). Current Plan Card and SaaS Plans grid remain rendered and functional. | Payment history API request failure or timeout. | Pass | 01/06/2026 | Nguyen Dinh Hau | Exception EX-01 |
| 08 | Verify Date and Currency Formatting Localization | 1. Switch application language between Vietnamese ('vi') and English ('en').<br>2. Observe date and amount columns in Transaction History table. | Date format changes accordingly (`DD/MM/YYYY` for `vi-VN`, `MM/DD/YYYY` for `en-US`). Amount values update digit separator formatting. | Payment history records exist. | Pass | 01/06/2026 | Nguyen Dinh Hau | Normal Flow A |
