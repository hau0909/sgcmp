# FEATURE: Company Profile Management

- **Features**: Company Profile Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(company)/my-company/page.tsx, dev/src/features/company/components/MyCompanyDetail.tsx
- **Pass**: 10
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 10

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Add Company Service** | | | | | | | | |
| 01 | Verify Opening Add Service Modal ("Thêm dịch vụ mới") | 1. Access `/my-company` as Company Admin.<br>2. Scroll to "Dịch vụ doanh nghiệp" section.<br>3. Click "Thêm dịch vụ mới" button. | Modal "Thêm dịch vụ doanh nghiệp" opens displaying service dropdown list, price input field, and description inputs. | Company Admin is logged in on `/my-company`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Selecting Available Service from System Dropdown | 1. Open Add Service Modal.<br>2. Click service dropdown `Chọn dịch vụ`.<br>3. Select "Bảo vệ sự kiện / Hội nghị". | Selected service is highlighted, and default description/sub-description pre-fill into form fields. | Add Service Modal is open. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Entering Service Price & Custom Details | 1. Select service "Bảo vệ sự kiện / Hội nghị".<br>2. Enter price "250000" into `Giá dịch vụ (VNĐ)` input.<br>3. Modify service description text. | Price is formatted with number separators (`250.000 VNĐ`), custom description text is accepted without errors. | Service is selected in modal. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Validation: Unselected Service Dropdown | 1. Open Add Service Modal.<br>2. Leave `Chọn dịch vụ` dropdown unselected.<br>3. Enter price "250000".<br>4. Click "Thêm dịch vụ" submit button. | Validation error message "Vui lòng chọn dịch vụ" displays under dropdown field; submit is blocked. | Add Service Modal is open with unselected service. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 05 | Verify Validation: Empty / Zero Service Price | 1. Select service "Bảo vệ sự kiện / Hội nghị".<br>2. Leave `Giá dịch vụ (VNĐ)` empty or enter '0'.<br>3. Click "Thêm dịch vụ" submit button. | Validation error message "Giá dịch vụ phải lớn hơn 0" displays under Price field; submit is blocked. | Service selected but price is 0. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 06 | Verify Validation: Negative Service Price Input | 1. Select service "Bảo vệ sự kiện / Hội nghị".<br>2. Enter price "-50000" into `Giá dịch vụ (VNĐ)` input.<br>3. Click "Thêm dịch vụ" submit button. | Validation error message "Giá dịch vụ không được là số âm" displays; submit is blocked. | Service selected with negative price. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify Validation: Empty Service Description Text | 1. Select service "Bảo vệ sự kiện / Hội nghị".<br>2. Clear `Mô tả dịch vụ` textarea (empty string).<br>3. Click "Thêm dịch vụ" submit button. | Validation error message "Vui lòng nhập mô tả chi tiết cho dịch vụ" displays under description field. | Service selected but description empty. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 08 | Verify Submitting Add Service Form Successfully | 1. Fill valid service type, price "250.000", and description.<br>2. Click "Thêm dịch vụ" submit button. | API `requestAddCompanyService` is invoked, modal closes, new service appears immediately in company services table, and success toast displays. | All required fields in Add Service form are valid. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 09 | Verify Canceling Add Service Modal without Saving ("Hủy bỏ") | 1. Open Add Service Modal.<br>2. Enter price "300000".<br>3. Click "Hủy bỏ" button. | Modal closes immediately, and no new service is added to company services table. | Add Service Modal is open. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 10 | Verify Closing Add Service Modal via Close Icon `[X]` | 1. Open Add Service Modal.<br>2. Click close icon `[X]` on top right. | Modal closes immediately without saving changes. | Add Service Modal is open. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.2 |
