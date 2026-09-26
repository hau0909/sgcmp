# PROMPT YÊU CẦU AGENT MÔ TẢ MÀN HÌNH / GIAO DIỆN (UI SCREEN)

Mẫu prompt này được sử dụng để yêu cầu Agent tạo tài liệu mô tả chi tiết giao diện và các luồng xử lý trên UI (Screen Layout/Function Details) dựa trên giao diện thực tế hoặc thiết kế, tuân thủ template và phân tách rõ ràng luồng bình thường/bất thường.

---

```markdown
Hãy đóng vai trò là một Business Analyst / UI Designer / Technical Writer, thực hiện viết tài liệu "Mô tả màn hình / Giao diện" cho màn hình dưới đây. Hãy tuân thủ chính xác các yêu cầu và cấu trúc sau:

### 1. THÔNG TIN METADATA CỦA MÀN HÌNH:
- **Screen ID & Name:** [Ví dụ: 3.2.1 Register]
- **Target File:** [Đường dẫn file đích cần ghi mô tả màn hình, ví dụ: d:\SEP490\dev\Screen_Register.md]

### 2. TÀI LIỆU THAM CHIẾU & PHÂN TÍCH:
- **Template Screen Description cần tuân thủ:** UI_Screen_Description_Template.md
- **File Code UI nguồn hoặc Thiết kế cần phân tích:** [Đường dẫn các file UI, ví dụ: d:\SEP490\dev\src\app\register\page.tsx]
- **Tài liệu Business Rules:** Business-rules.md (nếu có để đối chiếu validation trên UI)
- **Tài liệu Application Messages:** Application-messages.md (nếu có để hiển thị thông báo lỗi)

### 3. YÊU CẦU ĐỐI VỚI AGENT (QUAN TRỌNG):
1. **Ngôn ngữ:** Tài liệu Mô tả màn hình phải được viết hoàn toàn bằng **tiếng Anh**.
2. **Cấu trúc:** Giữ nguyên chính xác cấu trúc Markdown từ `UI_Screen_Description_Template.md`. Tuyệt đối không thay đổi format (đặc biệt là các phần bôi đậm). Thay thế các đoạn text trong ngoặc vuông `[...]` bằng thông tin chi tiết tương ứng.
3. **Phong cách viết (UI & Interaction-Oriented):**
   - **Tập trung vào giao diện và tương tác:** Mô tả chi tiết cách người dùng thao tác trên màn hình (nhập liệu, click nút, chọn dropdown) và phản hồi trực tiếp của hệ thống trên UI.
   - **Function trigger:** Mô tả rõ hành động kích hoạt màn hình (ví dụ: click vào link nào, từ màn hình nào dẫn đến).
   - **Screen layout:** Để trống phần này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`.
4. **Mô tả chi tiết chức năng (Function Details):**
   - **Normal execution case:** Liệt kê các bước thao tác thành công trên giao diện dưới dạng danh sách gạch đầu dòng. Chỉ rõ hành động của người dùng và phản hồi/kết quả tương ứng của hệ thống (ví dụ: chuyển hướng trang, hiển thị thông báo thành công).
   - **Abnormal execution case:** Liệt kê cách hệ thống xử lý khi có lỗi hoặc dữ liệu nhập không hợp lệ, và hiển thị thông báo lỗi tương ứng trên UI (ví dụ: hiện lỗi dưới trường nhập liệu, hiển thị popup thông báo lỗi). Sử dụng mã lỗi tương ứng từ `Application-messages.md` hoặc quy tắc từ `Business-rules.md` để ghi cụ thể câu thông báo.
```
