# FEATURE: Publish Request Management

- **Features**: Publish Request Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(admin)/publish-requests/[id]/page.tsx, dev/src/features/company/components/PublishRequestDetail.tsx
- **Pass**: 8
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 8

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Publish Request Detail** | | | | | | | | |
| 01 | Verify UI Layout of Publish Request Detail page | 1. Log in as Admin.<br>2. Access `/publish-requests/REQ1001`.<br>3. Observe header, breadcrumbs, requester card, and company info section. | Breadcrumbs, company title, status badge, requested date (`DD/MM/YYYY HH:mm`), requester info card, and company detail cards display correctly. | Admin user is logged in and navigated to `/publish-requests/[id]`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Requester Information Card Display | 1. Access `/publish-requests/REQ1001`.<br>2. Observe "NGƯỜI GỬI YÊU CẦU" section. | Requester full name, phone number, email, and requester attached note display properly. | Request detail data loaded successfully. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Company General Details & Assets Display | 1. Access `/publish-requests/REQ1001`.<br>2. Observe "THÔNG TIN DOANH NGHIỆP" section. | Company name, registration code, tax ID (`business_license_no`), phone, email, address, description, company logo, and banner display accurately. | Company data exists in publish request. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Registered Services List Display | 1. Access `/publish-requests/REQ1001`.<br>2. Scroll to "Dịch vụ đăng ký hiển thị" section. | Registered services list displays service names, sub-descriptions, full descriptions, and formatted prices (`VNĐ`). | Company has registered services. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Business License Document & Download Action | 1. Access `/publish-requests/REQ1001` with business license file.<br>2. Click "Tải về" link or preview card. | Business license thumbnail displays; clicking "Tải về" downloads file blob or opens document preview. | Business license file URL exists. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Image & PDF Lightbox Preview | 1. Access `/publish-requests/REQ1001`.<br>2. Click logo, banner, activity image, or license PDF box.<br>3. Click close button `[X]`. | Lightbox overlay opens displaying zoomed image or embedded PDF viewer; closes upon clicking `[X]`. | Images or PDF document exist on detail page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 07 | Verify Loading State on Request Detail Fetch | 1. Access `/publish-requests/REQ1001`.<br>2. Observe page content during fetch. | Centered spinner animation and text "Đang tải thông tin yêu cầu..." display while loading data. | Detail page request initiated. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 08 | Verify Error State when Request Not Found | 1. Access invalid URL `/publish-requests/INVALID_ID` or when API fails.<br>2. Observe screen alert container. | Error container displays message "Không tìm thấy thông tin yêu cầu." and button "Quay lại danh sách". | Invalid request ID or API error. | Pass | 25/07/2026 | Nguyen Dinh Hau | Exception EX-01 |
