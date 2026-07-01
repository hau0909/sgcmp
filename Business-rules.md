# HƯỚNG DẪN DÀNH CHO AGENT (AGENT INSTRUCTIONS)

Khi người dùng yêu cầu viết hoặc cập nhật các Quy tắc nghiệp vụ (Business Rules), bạn (Agent) **PHẢI** tuân thủ chính xác cấu trúc Markdown dưới đây:
1. Sử dụng bảng gồm đúng 2 cột: Cột 1 là mã quy tắc (`BR ID`), Cột 2 là nội dung chi tiết của quy tắc (`Business Rule`).
2. Tuyệt đối không tự ý thêm hoặc bớt các cột khác (ví dụ: không thêm cột tên quy tắc, module liên quan) trừ khi được người dùng yêu cầu rõ ràng.
3. Nội dung mô tả quy tắc viết bằng Tiếng Anh, mang tính chất nghiệp vụ thực tế của hệ thống, không quá đặc thù vào tiểu tiết giao diện hay chức năng.

---

# Business Rules List

| BR ID | Business Rule |
| :--- | :--- |
| **BR-01** | Access to business features and data is restricted to authenticated users with a valid company profile. |
| **BR-02** | A business organization (Company) is allowed only one active subscription plan at any given time. |
| **BR-03** | System features and resources available to a company are determined by the limits and quotas of their active subscription plan. |
| **BR-04** | Changing, upgrading, or canceling active subscription plans must follow the organization's billing policy and may require support assistance. |
