# FEATURE: Company Profile Management

- **Features**: Company Profile Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(company)/my-company/page.tsx, dev/src/features/company/components/MyCompanyDetail.tsx
- **Pass**: 7
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 7

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View Comapny Profile (Company)** | | | | | | | | |
| 01 | Verify UI Layout of My Company Profile Page | 1. Log in as Company Admin/Owner.<br>2. Access My Company page (`/my-company`).<br>3. Observe header profile card, status badge, company info grid, activity images, and services table. | Header logo, banner, company official name, tax ID (`business_license_no`), registration code, status badge, contact details, activity photos, and services table display properly. | Logged-in user has associated company profile. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Company Information & Contact Details | 1. Access `/my-company`.<br>2. Observe "Thông tin doanh nghiệp" section. | Official company name, tax code, phone number, email, address, description, and attendance rules (allowed late/absent minutes) render correctly. | Company profile data loaded from backend. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Displaying Company Brand Assets (Logo, Banner & Activity Gallery) | 1. Access `/my-company`.<br>2. Observe Company Logo, Banner image, and "Hình ảnh hoạt động công ty" grid. | Logo thumbnail, banner background image, and uploaded activity photos render cleanly. | Company has uploaded brand assets. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Displaying Company Offered Services List | 1. Access `/my-company`.<br>2. Scroll to "Dịch vụ doanh nghiệp" section. | Services list table displays service name, sub-description, full description, price (`VNĐ`), and action buttons ("Chỉnh sửa", "Xóa"). | Services are registered for company. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Displaying Business License Document Preview | 1. Access `/my-company`.<br>2. Observe "Giấy phép kinh doanh" section card. | Attached business license document preview (PDF/Image) displays with "Tải về" link or lightbox preview button. | Business license URL exists. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Image Lightbox Preview for Logo, Banner, & Activity Photos | 1. Access `/my-company`.<br>2. Click on Logo thumbnail, Banner, or Activity photo.<br>3. Click close button `[X]`. | Fullscreen dark backdrop lightbox opens displaying enlarged high-res image; closes upon clicking `[X]`. | Images exist on profile page. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 07 | Verify Loading State during Profile Initial Fetch | 1. Access `/my-company`.<br>2. Observe page content during initial data loading. | Loading spinner animation and text display while fetching company profile data from backend. | Page request is initiated. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
