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
    *   The user performs an action on the UI (e.g., clicks a button, inputs data).
    *   The system processes the request and validates the input/context.
    *   The system updates the UI and redirects the user or displays the success outcome.

*   **Abnormal execution case:**
    *   If a specific business error occurs (e.g., missing data, invalid format), the system displays the corresponding error message.
    *   If a technical exception occurs (e.g., server down, network timeout), the system shows a system error message or retries.
