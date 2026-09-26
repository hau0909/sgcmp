# FEATURE: Company Marketplace Management

- **Features**: Company Marketplace Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/companies/page.tsx, dev/src/features/company/components/CompanySearchBar.tsx, dev/src/features/company/components/SearchCompanies.tsx
- **Pass**: 14
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 14

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Search & Filter companies** | | | | | | | | |
| 01 | Verify Searching Companies by Name / Keyword | 1. Access `/companies` page.<br>2. Enter search term "Sentinel" into search bar input `Tên công ty...`.<br>3. Click "Tìm kiếm" button. | Company grid filters to show only companies matching keyword "Sentinel"; header displays matching result count "Hiển thị 1–X của Y nhà cung cấp". | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Filtering Companies by Location: "Hồ Chí Minh" | 1. Access `/companies` page.<br>2. Click location filter dropdown `Tất cả địa điểm`.<br>3. Select city "Hồ Chí Minh" -> Click "Tìm kiếm". | Grid filters to display companies located in "Hồ Chí Minh"; URL updates with location parameter. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 03 | Verify Filtering Companies by Location: "Hà Nội" | 1. Access `/companies` page.<br>2. Click location filter dropdown `Tất cả địa điểm`.<br>3. Select city "Hà Nội" -> Click "Tìm kiếm". | Grid filters to display companies located in "Hà Nội". | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.2 |
| 04 | Verify Filtering Companies by Location: "Đà Nẵng" | 1. Access `/companies` page.<br>2. Click location filter dropdown `Tất cả địa điểm`.<br>3. Select city "Đà Nẵng" -> Click "Tìm kiếm". | Grid filters to display companies located in "Đà Nẵng". | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.3 |
| 05 | Verify Filtering Companies by Service Tag: "Bảo vệ sự kiện" | 1. Access `/companies` page.<br>2. Click service filter dropdown `Tất cả dịch vụ`.<br>3. Select service "Bảo vệ sự kiện" -> Click "Tìm kiếm". | Grid filters to display companies offering "Bảo vệ sự kiện" service tag. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.4 |
| 06 | Verify Filtering Companies by Service Tag: "Bảo vệ mục tiêu cố định" | 1. Access `/companies` page.<br>2. Click service filter dropdown `Tất cả dịch vụ`.<br>3. Select service "Bảo vệ mục tiêu cố định" -> Click "Tìm kiếm". | Grid filters to display companies offering "Bảo vệ mục tiêu cố định" service tag. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.5 |
| 07 | Verify Filtering Companies by Service Tag: "Bảo vệ cá nhân/Yếu nhân" | 1. Access `/companies` page.<br>2. Click service filter dropdown `Tất cả dịch vụ`.<br>3. Select service "Bảo vệ cá nhân/Yếu nhân" -> Click "Tìm kiếm". | Grid filters to display companies offering "Bảo vệ cá nhân/Yếu nhân" service tag. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.6 |
| 08 | Verify Filtering Companies by Price Range (Min & Max Price) | 1. Access `/companies` page.<br>2. Open price filter dropdown.<br>3. Select Min price "100.000" and Max price "500.000" -> Click "Áp dụng". | Company grid filters to display companies with hourly rates between 100.000 VNĐ and 500.000 VNĐ. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.7 |
| 09 | Verify Validation: Min Price Greater Than Max Price | 1. Open price filter dropdown.<br>2. Enter Min price "500.000" and Max price "200.000".<br>3. Click "Áp dụng" button. | Validation warning "Giá tối thiểu không thể lớn hơn giá tối đa" displays; filter submit is blocked. | Price filter dropdown is open. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 10 | Verify Sorting Companies by "Tất cả đề xuất" (Default) | 1. Access `/companies` page.<br>2. Open sort dropdown.<br>3. Select option "Tất cả đề xuất". | Company grid displays all recommended companies sorted by system recommendation algorithm. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.8 |
| 11 | Verify Sorting Companies by "Đánh giá cao nhất" | 1. Access `/companies` page.<br>2. Open sort dropdown.<br>3. Select option "Đánh giá cao nhất". | Company grid re-orders displaying companies with highest star ratings at the top. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.9 |
| 12 | Verify Sorting Companies by "Đánh giá thấp nhất" | 1. Access `/companies` page.<br>2. Open sort dropdown.<br>3. Select option "Đánh giá thấp nhất". | Company grid re-orders displaying companies with lower star ratings at the top. | User is on `/companies` page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.10 |
| 13 | Verify Clear All Filters Action ("Xóa lọc") | 1. Apply multiple active filters.<br>2. Click "Xóa lọc" button. | All search keywords, location, service, and price filters reset to default; full list of companies reloads. | Active filters are applied on page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 14 | Verify No Results Found Empty State | 1. Search keyword "XYZ99999" that yields zero matching companies.<br>2. Observe screen content. | Screen renders empty state with search icon, title "Không tìm thấy kết quả phù hợp", description note, and button "Xóa lọc". | Search query yields 0 results. | Pass | 25/07/2026 | Nguyen Dinh Hau | Empty State |
