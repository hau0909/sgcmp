# FEATURE: Registration Management

- **Features**: Registration Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(customer)/my-registration/page.tsx, dev/src/features/registration/components/MyRegistrationView.tsx
- **Pass**: 8
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 8

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **View company registration request** | | | | | | | | |
| 01 | Verify UI Layout of My Registration Page | 1. Log in as Customer/Applicant.<br>2. Access My Registration page (`/my-registration`).<br>3. Observe page header, registration code, created date, status badge, and 2-column detail grid. | Page title "Hồ sơ đăng ký của tôi", registration code, formatted created date (`DD/MM/YYYY HH:mm`), status badge, and 2-column details grid display properly. | Customer is logged in and has submitted a company registration. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Displaying Registered Company Information | 1. Access `/my-registration`.<br>2. Observe "THÔNG TIN DOANH NGHIỆP" section. | Registered company name, tax code/license no, phone, email, formatted address, description, and logo display correctly. | Registration record loaded successfully. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Displaying Legal Representative & Identity Info | 1. Access `/my-registration`.<br>2. Observe "NGƯỜI ĐẠI DIỆN PHÁP LUẬT" section. | Representative name, phone, email, CCCD number, issue date, issue place, and front/back identity photos display properly. | Representative details exist in registration. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Displaying Business License Document | 1. Access `/my-registration`.<br>2. Observe "GIẤY PHÉP ĐĂNG KÝ KINH DOANH" card. | Business license card displays document preview (PDF/Image) with click-to-view option. | Business license URL exists. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Status Badge & Rejection Alert Banner for Rejected Application | 1. Access `/my-registration` when registration status is `rejected`.<br>2. Observe top alert banner. | Status badge displays "Bị từ chối" (red), red alert box displays rejection note reason and action guide hint. | Registration status is `rejected` with note. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 06 | Verify Image & File Preview Lightbox | 1. Access `/my-registration`.<br>2. Click on Logo, CCCD images, Gallery photo, or Business License file.<br>3. Click `[X]`. | Lightbox overlay opens displaying zoomed image or PDF document; closes upon clicking `[X]`. | Media files exist in registration profile. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 07 | Verify Loading State during Registration Fetch | 1. Access `/my-registration`.<br>2. Observe page content while fetching data. | Animated spinner and loading text display while loading registration details. | Page request initiated. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 08 | Verify Empty State when User Has No Company Registration | 1. Access `/my-registration` with a customer account that has 0 registration records.<br>2. Observe page content. | Empty state card displays icon, title "Chưa có hồ sơ đăng ký", description text, and button "Đăng ký doanh nghiệp" linking to `/register-company`. | User has no registration records in system. | Pass | 25/07/2026 | Nguyen Dinh Hau | Empty State |
