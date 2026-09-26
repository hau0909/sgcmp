# FEATURE: Publish Request Management

- **Features**: Publish Request Management
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
| **Send Publish Request** | | | | | | | | |
| 01 | Verify Button Visibility for Active/Unpublished Company | 1. Log in as Company Owner.<br>2. Access My Company page (`/my-company`).<br>3. Observe header status and action buttons. | "Gửi yêu cầu công khai" button displays when company status is `active` (not yet published). | Company account status is `active`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Opening & Canceling Publish Request Confirmation Modal | 1. Access `/my-company`.<br>2. Click "Gửi yêu cầu công khai" button.<br>3. Click "Hủy bỏ" button or close icon `[X]`. | Confirmation modal opens with title "Xác nhận gửi yêu cầu công khai"; closes without sending request when clicking "Hủy bỏ". | Company is eligible to send publish request. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Entering Optional Note for Publish Request | 1. Access `/my-company`.<br>2. Click "Gửi yêu cầu công khai" button.<br>3. Enter optional note: "Đã cập nhật đầy đủ dịch vụ và logo doanh nghiệp". | Note text is entered successfully into textarea in modal. | Publish request modal is open. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Submitting Publish Request Successfully | 1. Access `/my-company`.<br>2. Click "Gửi yêu cầu công khai".<br>3. Enter note and click "Xác nhận gửi". | API request is sent, modal closes, status updates to "Đang chờ duyệt công khai" (`pending_publish`), action button disables, and success toast displays. | Company profile meets publishing requirements. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Profile Completeness Checklist Warning when Profile is Incomplete | 1. Access `/my-company` with incomplete profile (e.g. missing logo or license).<br>2. Observe status banner and publish button. | System displays checklist warning of missing required fields; "Gửi yêu cầu công khai" button remains disabled until profile checklist is completed. | Company profile is missing mandatory information. | Pass | 25/07/2026 | Nguyen Dinh Hau | Warning State |
| 06 | Verify Status Display for Pending Publish Review State | 1. Access `/my-company` when publish request is already submitted.<br>2. Observe status banner. | Status badge displays "Đang chờ duyệt công khai" (`pending_publish`) with info banner explaining request is under review. | Company has pending publish request. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 07 | Verify Status Display for Approved Published State | 1. Access `/my-company` when publish request is approved by Admin.<br>2. Observe status banner. | Status badge displays "Đã công khai" (`published`) with banner confirming business is publicly visible to clients. | Company publish request is approved. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.2 |
