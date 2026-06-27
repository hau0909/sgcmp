# HƯỚNG DẪN DÀNH CHO AGENT (AGENT INSTRUCTIONS)

Khi người dùng yêu cầu viết tài liệu "Use Case Specification", bạn (Agent) **PHẢI** tuân thủ chính xác cấu trúc Markdown dưới đây.
Tuyệt đối không thay đổi format, không tự ý thêm/bớt các trường (fields) trừ khi được người dùng yêu cầu.
Thay thế các đoạn text trong ngoặc vuông `[...]` bằng thông tin chi tiết của Use Case tương ứng.

**🔴 QUY TẮC XỬ LÝ BUSINESS RULES & MESSAGES (QUAN TRỌNG):**

1. **Business Rules (BR):** Agent **PHẢI** dựa trên tài liệu/danh sách Business Rule được cung cấp để lấy ra các mã BR chính xác (ví dụ: BR-01, BR-02).
2. **BR Trùng lặp:** Nếu các Use Case có tính chất liên quan/tương đồng (ví dụ: "Xem danh sách tài khoản" và "Xem chi tiết tài khoản" ở module Admin) mà dùng chung 1 Business Rule, Agent **PHẢI** đặt câu hỏi xác nhận với người dùng trước khi quyết định gán BR đó vào Use Case.
3. **BR Mới:** Nếu trong quá trình phân tích Use Case phát hiện ra một Business Rule mới (chưa có trong file/danh sách hiện tại), Agent **PHẢI** tạm dừng, hỏi ý kiến người dùng để làm rõ nội dung. Sau khi chốt được nội dung, Agent **PHẢI** nhắc nhở/thực hiện thêm BR mới này vào file/danh sách Business Rule trước khi hoàn thiện Use Case.
4. **Phân loại Lỗi:**
   - Lỗi nghiệp vụ / Lỗi nhập liệu (VD: để trống trường, sai định dạng) **PHẢI** đặt trong phần **Alternative Flows**.
   - Lỗi hệ thống / Kỹ thuật (VD: mất mạng, lỗi server, lỗi API) **PHẢI** đặt trong phần **Exceptions**.
5. **Application Messages:** Khi mô tả việc hiển thị thông báo (thành công hoặc thất bại) trong các luồng (Normal, Alternative, Exceptions), Agent **PHẢI** tham chiếu chính xác mã thông báo từ danh sách "Application Messages List" (ví dụ: hiển thị thông báo lỗi MSG01).

Business-rules.md (tạo nếu chưa có)

---

# Use Case Specification: [Tên Use Case]

**UC ID and Name:** [Mã UC, ví dụ: UC-01] - [Tên Use Case]
**Created By:** [Tên người tạo hoặc để trống cho người dùng điền]
**Date Created:** [Ngày tạo, định dạng DD/MM/YYYY]
**Primary Actor:** [Tác nhân chính kích hoạt use case]
**Secondary Actors:** [Tác nhân phụ, hệ thống bên thứ 3. Ghi "None" nếu không có]

**Trigger:**
[Mô tả chi tiết hành động hoặc sự kiện kích hoạt use case này. Ví dụ: Người dùng nhấn vào nút "X".]

**Description:**
[Mô tả ngắn gọn, rõ ràng mục đích và chức năng chính của use case đối với hệ thống.]

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** [Điều kiện 1, ví dụ: Người dùng đã đăng nhập thành công.]
- **PRE-02:** [Điều kiện 2, ví dụ: Có kết nối internet.]
  _(Thêm các dòng PRE-xx tương tự nếu cần)_

**Post-conditions (Hậu điều kiện):**

- **POST-01:** [Trạng thái của hệ thống sau khi use case thực hiện thành công.]
- **POST-02:** [Trạng thái của hệ thống nếu use case thất bại.]
  _(Thêm các dòng POST-xx tương tự nếu cần)_

**Normal Flow (Luồng sự kiện chính):**
**A. [Tên luồng chính, ví dụ: Đăng nhập thành công]**

1. [Bước 1: Hành động của người dùng hoặc hệ thống]
2. [Bước 2: Hệ thống xử lý...]
3. [Bước 3: Hiển thị thông báo thành công (VD: MSG18)]
4. [Bước 4: ...]

**Alternative Flows (Luồng rẽ nhánh):**
_(Ghi chú: Đánh số tương ứng với bước rẽ nhánh ở Normal Flow. Ví dụ rẽ nhánh từ bước 4 thì đặt tên là A.4)_
**A.[X] [Tên luồng rẽ nhánh, ví dụ: Bỏ trống trường bắt buộc]**

1. [Hệ thống hiển thị thông báo lỗi nghiệp vụ, ví dụ: MSG01]
2. [Hành động tiếp theo, ví dụ: Return to step A.2]

**Exceptions (Ngoại lệ):**

- **EX-01:** [Mô tả tình huống lỗi hệ thống, ví dụ: Lỗi kết nối CSDL, Mất mạng]
  1. [Hệ thống hiển thị thông báo lỗi kỹ thuật và xử lý, ví dụ: Connect internet again.]

**Priority:** [High / Medium / Low]
**Frequency of Use:** [High / Medium / Low]
**Business Rules:** [Các quy tắc nghiệp vụ liên quan, ví dụ: BR-01, BR-02. Ghi N/A nếu không có]
**Other Information:** [Các thông tin bổ sung khác. Ghi N/A nếu không có]
**Assumptions:** [Các giả định khi thực hiện Use Case này. Ghi N/A nếu không có]
