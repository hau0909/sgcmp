# PROMPT YÊU CẦU AGENT TẠO ĐẶC TẢ USE CASE

Mẫu prompt này được sử dụng để yêu cầu Agent tạo tài liệu đặc tả Use Case Specification chuẩn hóa, tránh lan man, tránh viết chi tiết kỹ thuật/giao diện quá mức và tập trung vào nghiệp vụ chính.

---

```markdown
Hãy đóng vai trò là một Business Analyst / Technical Writer, thực hiện viết tài liệu "Use Case Specification" cho chức năng dưới đây. Hãy tuân thủ chính xác các yêu cầu và cấu trúc sau:

### 1. THÔNG TIN METADATA CỦA USE CASE:
- **Use Case ID & Name:** [Ví dụ: UC-BILL-01 - View SaaS Plans]
- **Created By:** [Tên người thực hiện]
- **Date Created:** [Ngày thực hiện, định dạng DD/MM/YYYY]
- **Primary Actor:** [Tác nhân chính]
- **Secondary Actor:** [Tác nhân phụ, ví dụ: Third-party Payment Gateway hoặc ghi None nếu không có]
- **Target File:** [Đường dẫn file đích cần ghi tài liệu đặc tả, ví dụ: d:\SEP490\dev\Use_Case_View_SaaS_Plans.md]

### 2. TÀI LIỆU THAM CHIẾU & PHÂN TÍCH:
- **Template Use Case cần tuân thủ:** Use_Case_Template.md
- **File Code nguồn cần phân tích logic:** [Đường dẫn các file, ví dụ: d:\SEP490\dev\src\app\(company)\billing\page.tsx]
- **Tài liệu Business Rules:** Business-rules.md
- **Tài liệu Application Messages:** Application-messages.md

### 3. YÊU CẦU ĐỐI VỚI AGENT (QUAN TRỌNG):
1. **Ngôn ngữ:** Tài liệu Use Case Specification phải được viết hoàn toàn bằng **tiếng Anh**.
2. **Cấu trúc:** Giữ nguyên chính xác cấu trúc Markdown từ `Use_Case_Template.md`.
3. **Phong cách viết (Business-Oriented):** 
   - **PHẢI** viết theo thiên hướng nghiệp vụ cao, tập trung vào luồng tương tác cơ bản giữa Người dùng và Hệ thống.
   - **KHÔNG** mô tả quá chi tiết giao diện (ví dụ: không ghi cụ thể màu sắc nút, vị trí CSS, trạng thái hover, tên class).
   - **KHÔNG** đưa các thông tin kỹ thuật vào luồng nghiệp vụ (ví dụ: không ghi đường dẫn URL như `/billing/payment/...`, không ghi tên biến, phương thức API cụ thể, cấu trúc DB).
   - Các mô tả bước cần ngắn gọn, trực quan, ví dụ: "The user accesses the page", "The system displays the transaction history" thay vì viết dài dòng chi tiết cấu trúc bảng.
4. **Phân tích luồng (Flows):**
   - Các logic xử lý thông thường -> **Normal Flow**.
   - Các trường hợp rẽ nhánh nghiệp vụ (không có dữ liệu, chuyển hướng tùy chọn) -> **Alternative Flows**.
   - Lỗi kỹ thuật, mất kết nối, lỗi API -> **Exceptions**.
5. **Ánh xạ BR & MSG:**
   - Đối chiếu và gán mã Business Rule tổng quát từ `Business-rules.md`.
   - Đối chiếu và gán mã Application Message tương ứng từ `Application-messages.md`.
```
