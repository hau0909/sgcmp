# FEATURE: Company Marketplace Management

- **Features**: Company Marketplace Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/companies/[id]/page.tsx, dev/src/features/company/components/CompanyDetail.tsx
- **Pass**: 7
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 7

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Company Details** | | | | | | | | |
| 01 | Verify UI Layout of Company Detail Page | 1. Access `/companies/COMP1001`.<br>2. Observe company header banner, logo, company name, address sidebar, about section, services table, and customer reviews section. | Header banner, company logo, official name, ratings, sidebar contact info (Address, Phone, Email), "Về chúng tôi" section, "Danh sách Dịch vụ" table, and "Đánh giá từ khách hàng" display correctly. | User accesses valid company detail page URL. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Company About & Overview Section | 1. Access `/companies/COMP1001`.<br>2. Observe "Về chúng tôi" card content. | Detailed company introduction, experience overview, and description text render properly. | Company detail data loaded successfully. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Displaying Company Contact & Location Sidebar | 1. Access `/companies/COMP1001`.<br>2. Observe right-side contact sidebar card. | Official address, contact phone number, and support email display with map/contact icons. | Company contact details exist. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Displaying Company Services List & Pricing Table | 1. Access `/companies/COMP1001`.<br>2. Scroll to "Danh sách Dịch vụ" section. | Services list renders service names, descriptions, sub-descriptions, unit prices (`VNĐ/giờ` or `/tháng`), and action button "Đặt dịch vụ". | Company has registered services. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Displaying Customer Reviews & Ratings Section | 1. Access `/companies/COMP1001`.<br>2. Scroll to "Đánh giá từ khách hàng" section. | Overall rating score, rating breakdown stars, review count, and individual customer review cards display correctly. | Reviews exist for target company. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Opening New Booking Modal from Detail Page | 1. Access `/companies/COMP1001`.<br>2. Click "Đặt dịch vụ ngay" button in header or "Đặt dịch vụ" on a service row. | Booking modal "Đặt dịch vụ bảo vệ" opens with pre-selected company name and service options. | User is on Company Detail page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 07 | Verify Error State when Company ID is Invalid or Not Found | 1. Access `/companies/INVALID_ID` or when API fails.<br>2. Observe screen content. | Error container displays message "Không tìm thấy thông tin công ty này." or "Tải lại trang" button. | Invalid company ID or API server error. | Pass | 25/07/2026 | Nguyen Dinh Hau | Exception EX-01 |
