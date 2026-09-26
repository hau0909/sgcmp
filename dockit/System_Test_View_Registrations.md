# FEATURE: Registration Management

- **Features**: Registration Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(admin)/registrations/page.tsx, dev/src/features/registration/components/RegistrationTable.tsx
- **Pass**: 10
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 10

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Registrations** | | | | | | | | |
| 01 | Verify UI Layout of View Registrations page | 1. Log in as Admin.<br>2. Navigate to Admin Dashboard > Registrations (`/registrations`).<br>3. Observe header, navigation breadcrumb, filter status tabs, and data table. | Breadcrumb, header title, filter buttons bar, and data table display correctly with proper layout. | Admin user is logged in and navigated to `/registrations`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Registration List & Data Formatting | 1. Access `/registrations` page when registrations exist.<br>2. Observe table rows data formatting. | Registration ID, company name, submission date (`DD/MM/YYYY`), status badge, and "Xem chi tiết" link display formatted properly. | System contains registration records. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Status Filter Tabs ("Chờ duyệt", "Đã duyệt", "Hồ sơ lỗi", "Tất cả hồ sơ") | 1. Access `/registrations` page.<br>2. Click status filter tab "Chờ duyệt".<br>3. Click "Đã duyệt" -> "Hồ sơ lỗi" -> "Tất cả hồ sơ". | Registrations list filters accurately according to selected tab ("Chờ duyệt", "Đã duyệt", "Hồ sơ lỗi", "Tất cả hồ sơ"); counters and active page update correctly. | System has registrations across different status states (`pending`, `approved`, `rejected`/`action_required`). | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 04 | Verify Visual Highlight for Error / Action Required Registrations | 1. Access `/registrations` page.<br>2. Locate registrations with status `rejected` or `action_required`.<br>3. Observe row styling. | Error profiles highlight ID in red with a left margin indicator and subtitle "Hồ sơ có lỗi cần bổ sung". | Registration records with status `rejected` or `action_required` exist in system. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Navigation to Registration Detail Page | 1. Access `/registrations` page.<br>2. Click Company Name link or "Xem chi tiết" link on row ID 'REG1002'. | System successfully navigates to Registration Detail page (`/registrations/REG1002`). | User is on Registrations table page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Pagination Controls and Page Size Handling | 1. Access `/registrations` page with > 10 items.<br>2. Observe footer summary text.<br>3. Click next page button (`>`) / page '2' / previous page button (`<`). | Table displays maximum 10 rows per page; pagination footer summary and page controls work properly. | System contains more than 10 registration items. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 07 | Verify Automatic Page Reset when Current Page Exceeds Total Pages | 1. Access page 3 of `/registrations` under "Tất cả hồ sơ".<br>2. Switch active filter tab to "Hồ sơ lỗi" (which has only 3 results = 1 page total). | Current page automatically resets to page 1 when filtered list contains fewer pages than current page. | Filter tab change results in total pages less than current page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.2 |
| 08 | Verify Loading Suspense & Initial Fetch State | 1. Access `/registrations` page.<br>2. Observe page content during initial data loading. | Loading indicator text "Đang tải danh sách đăng ký..." displays while fetching data from API. | Page request is initiated. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 09 | Verify Empty State when Filter or Database has 0 Registrations | 1. Access `/registrations` page under a status filter with 0 items.<br>2. Observe table body and pagination footer. | Table body renders empty, footer displays summary text "Hiển thị 0 - 0 trên 0 kết quả". | Selected filter status yields zero registration records. | Pass | 25/07/2026 | Nguyen Dinh Hau | Empty State |
| 10 | Verify Error State on API Fetch Failure | 1. Access `/registrations` page when `requestGetRegistrations` API call fails.<br>2. Observe screen error alert. | Error message "Lỗi: Không thể tải danh sách đăng ký" displays on screen. | Network or API server failure. | Pass | 25/07/2026 | Nguyen Dinh Hau | Exception EX-01 |
