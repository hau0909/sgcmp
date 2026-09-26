# HƯỚNG DẪN TẠO SYSTEM TEST SHEET (SYSTEM TEST AGENT)

## Quy tắc xử lý khi nhận yêu cầu từ người dùng:
1. **Xác định Tên Chức năng (Sub-Feature / Function)**:
   - Tên chức năng truyền vào (ví dụ: `View Bank Accounts`, `Add Bank Account`, `Pay SaaS Plan`, `View Payment History`, `Login`, `Register`) là một **Sub-Feature / Function** duy nhất.
2. **Nguyên tắc Phạm vi Kiểm thử (Strict Scope Boundary)**:
   - **CHỈ viết Test Case cho CHÍNH XÁC Sub-Feature được yêu cầu**. Cấm tuyệt đối thêm/lồng ghép test case của các chức năng khác vào.
   - **Ví dụ với chức năng xem (`View ...` / `View Bank Accounts` / `View Payment History`)**:
     - **CHỈ kiểm thử**: Giao diện (UI layout, labels, fields), hiển thị danh sách, phân loại/sắp xếp/định dạng dữ liệu, tổng số lượng/thống kê (counters), làm mới (Refresh), hiển thị logo/ảnh fallback, mã màu trạng thái (Status badge), trạng thái rỗng (Empty state), cảnh báo (Warning banner), báo lỗi (Error banner).
     - **KHÔNG ĐƯỢC ĐƯA VÀO**: Tất cả các hành động Thêm, Sửa, Xóa, Kích hoạt/Ngừng hoạt động, Mở Modal, Khởi tạo thanh toán,... vì những hành động này thuộc các Sub-Feature riêng biệt (`Add Bank Account`, `Pay SaaS Plan`, v.v.).
3. **Quy tắc Viết Bước Thực Hiện (Test Case Procedure)**:
   - Viết các bước thực hiện theo **kịch bản cụ thể (Concrete Scenario Steps)**, điền trực tiếp giá trị dữ liệu kiểm thử thực tế vào bước thực hiện thay vì chỉ mô tả chung chung.
   - **Ví dụ chuẩn**:
     - Thay vì ghi `Enter invalid email` -> Ghi rõ: `1. Enter Email 'erspprsegmail.com'.<br>2. Click Register.`
     - Thay vì ghi `Enter invalid phone` -> Ghi rõ: `1. Enter Phone '0912abc'.<br>2. Click Register.`
     - Thay vì ghi `Enter password length < min` -> Ghi rõ: `1. Enter Password '123'.<br>2. Click Register.`
     - Thay vì ghi `Enter valid account info` -> Ghi rõ: `1. Open Add Bank Account modal.<br>2. Select Vietcombank from dropdown.<br>3. Enter Account Number '1012345678'.<br>4. Enter Account Name 'NGUYEN DINH HAU'.<br>5. Click "Thêm mới" button.`
     - Thay vì ghi `Select plan and pay` -> Ghi rõ: `1. Access '/billing/payment/2?paymentId=PAY12345678'.<br>2. Click 'Xác nhận hoàn tất thanh toán' button.`
4. **Quy tắc Sử dụng Cột Ghi Chú (Note Column)**:
   - Sử dụng cột `Note` để ghi nhận **luồng tương ứng trong tài liệu Use Case / Kịch bản nghiệp vụ (Traceability Mapping)**.
   - Các giá trị Note phổ biến: `Normal Flow A`, `Alternative Flow A.2`, `Alternative Flow A.3`, `Alternative Flow A.4`, `Exception EX-01`, `Empty State`, `Warning State`, `Validation Error`, `POST-01 / POST-03`.
   - Khi kiểm thử thực tế: Nếu test case `Fail`, bổ sung mã lỗi/bug ticket ID (ví dụ: `Fail - Bug #102: API error`).
5. **Xác định Nhóm Chức năng Chính (Main Feature)**:
   - Tự động map Sub-Feature vào nhóm Feature tổng thể tương ứng (ví dụ: `View Bank Accounts` -> Main Feature: `Bank Account Management`; `Pay SaaS Plan` / `View Payment History` -> Main Feature: `Subscription Management`).
6. **Cấu trúc Bảng Test Case**:
   - Tiêu đề khối màu/nổi bật là tên **Sub-Feature / Function** được yêu cầu (ví dụ: `View Bank Accounts`, `Pay SaaS Plan`).
   - Cột `Result`: mặc định `Pass`.
   - Cột `Test date`: Ngày truyền vào từ yêu cầu hoặc ngày tạo UC (ví dụ: `14/07/2026`, `23/07/2026`).
   - Cột `Tester`: Tên người kiểm thử truyền vào (ví dụ: `Nguyen Dinh Hau`).

---

# FEATURE: <Main Feature Name - Ví dụ: Subscription Management / Bank Account Management>

- **Features**: <Main Feature Name>
- **Test Requirement**: Test Sheet is run Website
- **Reference Document**: <Mã tài liệu / SRS / Link Code / Use Case ID nếu có>
- **Pass**: <Tổng số Test Case>
- **Fail**: 0
- **Untested**: 0
- **Number of test cases**: <Tổng số Test Case>

---

## Bảng Chi Tiết Test Case

| ID | Test Case Description | Test Case Procedure | Expected Results | Pre-Conditions | Result | Test date | Tester | Note |
|---|---|---|---|---|---|---|---|---|
| **<Sub-Feature / Function Name - Ví dụ: Pay SaaS Plan / View Payment History / View Bank Accounts>** | | | | | | | | |
| 01 | Verify UI of <Sub-Feature Page/Component> | 1. Navigate to <URL/Page>.<br>2. Observe UI elements. | All headers, fields, buttons, labels, and layouts display correctly. Mandatory fields marked with (*). | User is on <Page> | Pass | <Test Date> | <Tester Name> | Normal Flow A |
| 02 | Verify displaying <Data List/Details> | 1. Access <Sub-Feature Page>.<br>2. Observe displayed data. | Data items are retrieved and displayed correctly according to specifications. | Data exists in system | Pass | <Test Date> | <Tester Name> | Normal Flow A |
| 03 | Verify <Invalid Input Validation> | 1. Enter <Field> '<Concrete_Value_e.g._erspprsegmail.com>'.<br>2. Click <Submit_Button>. | Error message regarding invalid format displays correctly under field. | User is on <Page> | Pass | <Test Date> | <Tester Name> | Validation Error |
| 04 | Verify Refresh / Polling functionality | 1. Access <Sub-Feature Page>.<br>2. Observe background polling / refresh state. | Polling loop checks API status periodically. Loader displays during fetch. | User is on <Page> | Pass | <Test Date> | <Tester Name> | Normal Flow A |
| 05 | Verify Empty State when no data exists | 1. Access <Sub-Feature Page> when system has no data.<br>2. Observe page content. | Empty state placeholder image, icon, and empty message display correctly. | No data in database | Pass | <Test Date> | <Tester Name> | Empty State |
| 06 | Verify Warning Banner / Alert state | 1. Access <Sub-Feature Page> under specific condition.<br>2. Observe alert banner. | Warning banner displays correct warning message and styling. | Trigger condition met | Pass | <Test Date> | <Tester Name> | Warning State |
| 07 | Verify Error Banner on data fetch failure | 1. Access <Sub-Feature Page> when API fails.<br>2. Observe error alert. | Red error banner displays error notification message. | API or network error | Pass | <Test Date> | <Tester Name> | Exception EX-01 |