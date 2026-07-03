# HƯỚNG DẪN DÀNH CHO AGENT (AGENT INSTRUCTIONS)

Khi người dùng yêu cầu viết hoặc cập nhật danh sách Thông báo ứng dụng (Application Messages), bạn (Agent) **PHẢI** tuân thủ chính xác cấu trúc Markdown dưới đây:
1. Sử dụng bảng gồm đúng 5 cột: Cột 1 là số thứ tự (`#`), Cột 2 là mã thông báo (`Message Code`), Cột 3 là phân loại thông báo (`Message Type`), Cột 4 là ngữ cảnh (`Context`), Cột 5 là nội dung thông báo hiển thị trên giao diện (`Content`).
2. Tuyệt đối không tự ý thêm hoặc bớt các cột khác trừ khi được người dùng yêu cầu.
3. Nội dung thông báo hiển thị ở cột `Content` phải trùng khớp với văn bản/chuỗi hiển thị thực tế trên giao diện hệ thống (có thể là tiếng Việt hoặc tiếng Anh tùy thuộc vào mã nguồn).

---

# Application Messages List

| # | Message Code | Message Type | Context | Content |
| :--- | :--- | :--- | :--- | :--- |
| **1** | MSG01 | Inline Error | Company not found | *Không tìm thấy thông tin tài khoản doanh nghiệp.* |
| **2** | MSG02 | Loading State | Loading billing data | *Đang tải thông tin gói dịch vụ & thanh toán...* |
| **3** | MSG03 | Toast Error | Payment creation failed | *Không thể khởi tạo giao dịch thanh toán* |
| **4** | MSG04 | Toast Error | System exception | *Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.* |
| **5** | MSG05 | Table Info | Empty transaction history | *Không có giao dịch nào* |
| **6** | MSG06 | Inline Error | Empty email input | *Vui lòng nhập email* |
| **7** | MSG07 | Inline Error | Invalid email format | *Email không hợp lệ* |
| **8** | MSG08 | Inline Error | Empty password input | *Vui lòng nhập mật khẩu* |
| **9** | MSG09 | Inline Error | Password too short | *Mật khẩu phải có ít nhất 6 ký tự* |
| **10** | MSG10 | Toast/Inline Error | Invalid login credentials | *Email hoặc mật khẩu không đúng* |
| **11** | MSG11 | Toast/Inline Error | Email not confirmed | *Email chưa được xác thực. Vui lòng kiểm tra email.* |
| **12** | MSG12 | Toast/Inline Error | Account role not found | *Không tìm thấy vai trò của tài khoản* |
| **13** | MSG13 | Success Message | Login success redirecting | *Đăng nhập thành công. Đang chuyển hướng...* |
