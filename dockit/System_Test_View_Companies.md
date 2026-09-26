# FEATURE: Company Marketplace Management

- **Features**: Company Marketplace Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/companies/page.tsx, dev/src/features/company/components/SearchCompanies.tsx
- **Pass**: 6
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 6

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Companies** | | | | | | | | |
| 01 | Verify UI Layout of Companies Marketplace Page | 1. Access Companies Marketplace page (`/companies`).<br>2. Observe header, hero search bar container, explore title "Khám phá các công ty bảo vệ", sort dropdown button, and company card grid. | Header, search bar container, title "Khám phá các công ty bảo vệ", sort dropdown button, and 4-column company cards grid display properly. | User accesses public `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Company Cards Data & Formatting | 1. Access `/companies` page when published companies exist.<br>2. Observe individual company card fields. | Company thumbnail/logo, rating badge ("MỚI" or star rating), company name, location, service tags, hourly price (`/vnđ`), and button "Xem chi tiết" display correctly. | System contains published marketplace companies. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Navigation to Company Detail when Clicking Card | 1. Access `/companies` page.<br>2. Click on a company card (e.g. "Sentinel Prime Security") or its button "Xem chi tiết". | System successfully navigates to Company Detail page (`/companies/[id]`). | User is on Companies page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Sorting Dropdown Options ("Tất cả đề xuất", "Đánh giá cao nhất", "Đánh giá thấp nhất") | 1. Access `/companies` page.<br>2. Click sort dropdown button.<br>3. Select option "Đánh giá cao nhất" -> "Đánh giá thấp nhất" -> "Tất cả đề xuất". | Dropdown displays options ("Tất cả đề xuất", "Đánh giá cao nhất", "Đánh giá thấp nhất"); selecting an option updates company grid sorting immediately. | User is on Companies page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 05 | Verify Loading Skeleton State | 1. Access `/companies` page.<br>2. Observe grid container during initial data loading. | 20 animated skeleton cards display in 4-column grid while data is fetching from API. | Page request is initiated. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Pagination Controls for Companies Grid | 1. Access `/companies` page with > 20 companies.<br>2. Scroll down to pagination bar.<br>3. Click page button '2' or Next button (`>`). | Grid displays maximum 20 companies per page; page counter text and pagination buttons switch pages smoothly. | System contains more than 20 published companies. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
