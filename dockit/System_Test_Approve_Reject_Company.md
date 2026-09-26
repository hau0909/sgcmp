# FEATURE: Registration Management

- **Features**: Registration Management
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: dev/src/app/(admin)/registrations/[id]/page.tsx, dev/src/features/registration/components/RegistrationApproval.tsx
- **Pass**: 10
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: 10

---

## Detailed Test Case Table

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **Approve/Reject Company** | | | | | | | | |
| 01 | Verify visibility of Approve & Reject buttons for Pending registrations | 1. Access `/registrations/REG1002` where status is `pending`.<br>2. Observe header action buttons. | "PHÊ DUYỆT ĐĂNG KÝ" (blue) and "TỪ CHỐI HỒ SƠ" (red outline) buttons display prominently in header. | Registration status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 02 | Verify hiding of Action Buttons for Approved or Rejected registrations | 1. Access `/registrations/REG1002` where status is `approved` or `rejected`.<br>2. Observe header action area. | "PHÊ DUYỆT ĐĂNG KÝ" and "TỪ CHỐI HỒ SƠ" buttons are hidden from header. | Registration status is `approved` or `rejected`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 03 | Verify opening & canceling Approval Dialog Modal | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "PHÊ DUYỆT ĐĂNG KÝ" button.<br>3. Click "Hủy bỏ" button or close icon `[X]`. | Modal "Phê duyệt Đăng ký" opens with company name and warning note; closes without making API call when clicking "Hủy bỏ". | Registration status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 04 | Verify executing successful Company Registration Approval | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "PHÊ DUYỆT ĐĂNG KÝ" button.<br>3. Click "Đồng ý phê duyệt" button in modal. | Modal closes, API request updates status to `approved`, UI status badge changes to green "ĐÃ PHÊ DUYỆT", action buttons hide, and success toast displays. | Registration status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 05 | Verify opening & canceling Rejection Dialog Modal | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" button.<br>3. Click "Hủy bỏ" button or close icon `[X]`. | Modal "Từ chối hồ sơ đăng ký" opens with rejection reason textarea; closes without making API call when clicking "Hủy bỏ". | Registration status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 06 | Verify validation error when submitting Rejection without reason | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" button.<br>3. Leave rejection reason textarea empty.<br>4. Click "Từ chối hồ sơ" submit button. | Modal stays open, warning toast "Vui lòng nhập lý do từ chối!" pops up, and no API request is sent. | Rejection modal is open with empty reason field. | Pass | 25/07/2026 | Nguyen Dinh Hau | Validation Error |
| 07 | Verify executing successful Company Registration Rejection | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" button.<br>3. Enter reason: "Ảnh CCCD mặt sau bị mờ, không rõ thông tin".<br>4. Click "Từ chối hồ sơ" submit button. | Modal closes, API request updates status to `rejected` with note, UI badge turns red "ĐÃ TỪ CHỐI", rejection reason banner displays, action buttons hide, and success toast displays. | Registration status is `pending`. | Pass | 25/07/2026 | Nguyen Dinh Hau | Normal Flow A |
| 08 | Verify Rejection Reason pre-filling when re-opening Rejection Modal | 1. Access a registration that was previously rejected or has a stored note.<br>2. Open Rejection Modal. | Reason textarea is pre-filled with existing note text. | Registration has pre-existing note content. | Pass | 25/07/2026 | Nguyen Dinh Hau | Alternative Flow A.1 |
| 09 | Verify Error Toast handling when Approval API fails | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "PHÊ DUYỆT ĐĂNG KÝ" -> Click "Đồng ý phê duyệt" when server returns error. | Modal remains open or closes gracefully, and error toast displays: "Không thể phê duyệt hồ sơ". Status remains `pending`. | Approval API request encounters server/network error. | Pass | 25/07/2026 | Nguyen Dinh Hau | Exception EX-01 |
| 10 | Verify Error Toast handling when Rejection API fails | 1. Access `/registrations/REG1002` (`pending`).<br>2. Click "TỪ CHỐI HỒ SƠ" -> Enter reason -> Click "Từ chối hồ sơ" when server returns error. | Modal remains open or closes gracefully, and error toast displays: "Không thể từ chối hồ sơ". Status remains `pending`. | Rejection API request encounters server/network error. | Pass | 25/07/2026 | Nguyen Dinh Hau | Exception EX-01 |
