# HƯỚNG DẪN DÀNH CHO AGENT (AGENT INSTRUCTIONS) - MÔ TẢ MÀN HÌNH / GIAO DIỆN
Khi người dùng yêu cầu viết tài liệu "Mô tả màn hình" hoặc "Screen Layout/Function Details", bạn (Agent) **PHẢI** tuân thủ chính xác cấu trúc Markdown dưới đây.
Tuyệt đối không thay đổi format (đặc biệt là các phần bôi đậm). Thay thế các đoạn text trong ngoặc vuông `[...]` bằng thông tin chi tiết của màn hình tương ứng.

---

### [X.Y.Z] [Tên Màn Hình / Chức Năng, ví dụ: 3.2.1 Register]

**Function trigger:** [Mô tả hành động hoặc sự kiện mở ra màn hình này. Ví dụ: The guest clicks the "Đăng ký" button on the header.]

**Function description:** [Mô tả chi tiết mục đích, chức năng của màn hình và cách hệ thống hoạt động đằng sau.]

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   [Hành động 1 của người dùng trên UI, ví dụ: The user fills in all required fields accurately...]
    *   [Hành động tiếp theo...]
    *   [Phản hồi của hệ thống, ví dụ: The system verifies the validity...]
    *   [Kết quả cuối cùng, ví dụ: The system redirects the user to the Login page.]

*   **Abnormal execution case:**
    *   [Cách hệ thống xử lý và hiển thị lỗi 1 trên UI, ví dụ: If data is missing, the system displays an error warning below the corresponding field.]
    *   [Cách hệ thống xử lý lỗi 2, ví dụ: Server connection error; the system shows a connection error message.]
