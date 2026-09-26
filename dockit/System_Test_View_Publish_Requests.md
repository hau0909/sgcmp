# FEATURE: Publish Request Management

- **Features**: Publish Request Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(admin)/publish-requests/page.tsx, dev/src/features/company/components/PublishRequestTable.tsx
- **Pass**: 8
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 8

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Publish Request list** | | | | | | | | |
| 01 | Verify UI Layout of Publish Requests page | 1. Log in as Admin.<br>2. Navigate to Admin Dashboard > Publish Requests (`/publish-requests`).<br>3. Observe header, navigation breadcrumb, refresh button, filter status tabs, and data table. | Breadcrumb, header title, subtitle, "Làm mới" button, filter status tabs ("Chờ duyệt", "Đã phê duyệt", "Từ chối", "Tất cả yêu cầu"), and data table display correctly. | Admin user is logged in and navigated to `/publish-requests`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Publish Requests List & Formatting | 1. Access `/publish-requests` page when publish requests exist.<br>2. Observe table rows data formatting. | Sequence numbers (STT), company name link, formatted request date (`DD/MM/YYYY HH:mm`), status badge, and "Xem chi tiết" action link display properly. | System contains publish request records. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Status Filter Tabs ("Chờ duyệt", "Đã phê duyệt", "Từ chối", "Tất cả yêu cầu") | 1. Access `/publish-requests` page.<br>2. Click status filter tab "Chờ duyệt" -> "Đã phê duyệt" -> "Từ chối" -> "Tất cả yêu cầu". | Requests list filters accurately according to selected status; badge counters and active page update correctly. | Publish requests across different status states exist in system. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 04 | Verify Refresh Button Action | 1. On `/publish-requests` page, click "Làm mới" button.<br>2. Observe data reloading state. | System re-fetches latest publish requests from API and updates table list successfully. | Admin is on Publish Requests page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Navigation to Publish Request Detail Page | 1. Access `/publish-requests` page.<br>2. Click Company Name link or "Xem chi tiết" link on row 1. | System successfully navigates to Publish Request Detail page (`/publish-requests/[id]`). | User is on Publish Requests page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Pagination Controls and Page Size Handling | 1. Access `/publish-requests` page with > 10 items.<br>2. Observe pagination footer.<br>3. Click page button '2' or Next button (`>`). | Table displays maximum 10 rows per page; footer summary text and pagination controls function properly. | System contains more than 10 publish requests. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 07 | Verify Loading State during Initial Data Fetch | 1. Access `/publish-requests` page.<br>2. Observe page content during data loading. | Centered animated text "Đang tải danh sách yêu cầu công khai..." displays while fetching data from API. | Page request is initiated. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 08 | Verify Empty State when 0 Publish Requests Exist | 1. Access `/publish-requests` under a status filter with 0 items.<br>2. Observe table body. | Table body renders empty state displaying globe icon and message "Chưa có yêu cầu công khai nào." | Selected filter status yields zero publish requests. | Pass | 25/07/2026 | Nguyen Dinh Hau | Empty State |
