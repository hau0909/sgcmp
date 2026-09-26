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
| **Approve/Reject publish request** | | | | | | | | |
| 01 | Verify Action Buttons Visibility for Pending Publish Requests | 1. Access `/publish-requests/REQ1001` where status is `pending`.<br>2. Observe header action buttons. | "PHÊ DUYỆT ĐĂNG KÝ" (blue) and "TỪ CHỐI HỒ SƠ" (red outline) buttons display in header. | Request status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify Hiding Action Buttons for Approved or Rejected Requests | 1. Access `/publish-requests/REQ1001` where status is `approved` or `rejected`.<br>2. Observe header action area. | Action buttons "PHÊ DUYỆT ĐĂNG KÝ" and "TỪ CHỐI HỒ SƠ" are hidden. | Request status is `approved` or `rejected`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify Opening & Canceling Approval Dialog Modal | 1. Access `/publish-requests/REQ1001` (`pending`).<br>2. Click "PHÊ DUYỆT ĐĂNG KÝ" button.<br>3. Click "Hủy bỏ" or close icon `[X]`. | Approval confirmation modal opens displaying company name; closes without API call when clicking "Hủy bỏ". | Request status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify Executing Successful Publish Request Approval | 1. Access `/publish-requests/REQ1001` (`pending`).<br>2. Click "PHÊ DUYỆT ĐĂNG KÝ" button.<br>3. Click "Đồng ý phê duyệt" in modal. | API request updates status to `APPROVED`, status badge updates to "ĐÃ PHÊ DUYỆT", action buttons hide, and success toast displays. | Request status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify Opening & Canceling Rejection Dialog Modal | 1. Access `/publish-requests/REQ1001` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" button.<br>3. Click "Hủy bỏ" or close icon `[X]`. | Rejection modal opens displaying required reason textarea; closes without API call when clicking "Hủy bỏ". | Request status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify Validation Error on Empty Rejection Reason | 1. Access `/publish-requests/REQ1001` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" button.<br>3. Leave rejection reason textarea empty.<br>4. Click "Từ chối yêu cầu" submit button. | Modal stays open, warning toast "Vui lòng nhập lý do từ chối" displays, and API request is NOT sent. | Rejection modal is open with empty reason field. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify Executing Successful Publish Request Rejection | 1. Access `/publish-requests/REQ1001` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" button.<br>3. Enter reason: "Ảnh logo bị thiếu và Giấy phép kinh doanh đã hết hạn".<br>4. Click "Từ chối yêu cầu" button. | API updates status to `REJECTED` with reason, modal closes, status badge turns to "ĐÃ TỪ CHỐI", rejection reason banner displays, and success toast displays. | Request status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 08 | Verify Rejection Reason Alert Banner for Rejected Requests | 1. Access `/publish-requests/REQ1001` where status is `rejected` with rejection reason.<br>2. Observe top alert banner. | Red warning block displays title "Lý do từ chối phê duyệt" and exact rejection reason note. | Publish request status is `rejected`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
