# SGCMP - MA TRẬN PHÂN QUYỀN MÀN HÌNH & USE CASE (AUTHORIZATION MATRIX)

Tài liệu này chuẩn hóa toàn bộ các chức năng / màn hình (bao gồm cả các màn hình chính và toàn bộ Popup / Modal thao tác) của hệ thống SGCMP.
- **Screen (Screen Flow)**: Tên màn hình chuẩn đối chiếu trực tiếp từ sơ đồ Screen Flow và `SCREEN_DESCRIPTION.md`.
- **Function Name (Use Case)**: Tên nghiệp vụ / Use Case tương ứng từ `Project_Backlog.xlsx`.
- **Role Authorize**: Phân quyền 100% dựa theo mã nguồn thực tế của hệ thống (`RoleGuard`, layouts bảo vệ theo route group: `(admin)`, `(company)`, `(Coordinator)`, `(customer)`, `(guard)` và các route công khai).

---

## 1. Bảng Tổng Hợp Ma Trận Phân Quyền Màn Hình & Use Case

| Screen (Screen Flow) | Function Name (Use Case) | Guest | Customer | Company Admin | Coordinator | Guard | Admin |
| :--- | :--- | :-: | :-: | :-: | :-: | :-: | :-: |
| **--- NHÓM GUEST ---** | | | | | | | |
| Home | View Top rated companies | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Companies | View Companies | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Company Details | View Company Details | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Compare Companies | Compare companies | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Register Company | Register company | ✓ | ✓ | | | | |
| Register | Register | ✓ | | | | | |
| Login | Login | ✓ | | | | | |
| Email verification | Email verification | ✓ | | | | | |
| Forgot password | Forgot password | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **--- NHÓM CUSTOMER ---** | | | | | | | |
| View Profile Detail | View Profile Detail | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Reset Password (Popup) | Reset Password | | ✓ | ✓ | ✓ | ✓ | ✓ |
| Send Service request (Popup) | Send Service request | | ✓ | | | | |
| View my requests | view my requests | | ✓ | | | | |
| View my request detail | view my request detail | | ✓ | | | | |
| Confirm/Deny quotation (Popup) | Confirm/Deny quotation (customer) | | ✓ | | | | |
| View My Contract | View My Contracts | | ✓ | | | | |
| View My Contract Detail | View My Contract Detail | | ✓ | | | | |
| Confirm Contract By Customer (Popup) | Confirm Contract By Customer | | ✓ | | | | |
| Complete Contract (Popup) | Complete Contract (customer) | | ✓ | | | | |
| View contract shift schedule | View Contract Shift Schedule | | ✓ | | | | |
| Send Service Review (Popup) | Send Service Review | | ✓ | | | | |
| View my reports | View my reports | | ✓ | | | | |
| Submit report (Popup) | Submit report | | ✓ | | | | |
| View my report detail | View my report detail | | ✓ | | | | |
| View register request | View register request | | ✓ | | | | |
| Chat with company (Popup) | Chat with company | | ✓ | | | | |
| **--- NHÓM COMPANY ADMIN ---** | | | | | | | |
| Dashboard | Company Dashboard | | | ✓ | | | |
| View Company Profile | View Company Profile (Company) | | | ✓ | | | |
| Add Company Service (Popup) | Add Company Service | | | ✓ | | | |
| Send Publish Request (Popup) | Send Publish Request | | | ✓ | | | |
| View and Manage Subscription | View and Manage Subscription | | | ✓ | | | |
| Pay SaaS Plan | Pay SaaS Plan | | | ✓ | | | |
| View Coordinators | View Coordinator List | | | ✓ | | | |
| View Coordinator detail | View Coordinator detail | | | ✓ | | | |
| Create Coordinator Account | Create Coordinator Account | | | ✓ | | | |
| View Contracts | View Contracts | | | ✓ | | | |
| View Contract Detail | View Contract Detail | | | ✓ | | | |
| Upload Physical Contract (Popup) | Upload Physical Contract | | | ✓ | | | |
| Confirm Contract By Company (Popup) | Confirm Contract By Company | | | ✓ | | | |
| Export Contract (Popup) | Export Contract | | | ✓ | (✓)* | | |
| View requests | view requests | | | ✓ | | | |
| View request detail | view request detail | | | ✓ | | | |
| Update service quotation (Popup) | Update service quotation (company) | | | ✓ | | | |
| Reject Service Request (Popup) | Reject Service Request | | | ✓ | | | |
| View Request Verifications | View Request Verifications | | | ✓ | | | |
| View Request Verification Detail | View Request Verification Detail | | | ✓ | | | |
| Approve/Reject Request Verification (Popup) | Approve/Reject Request Verification | | | ✓ | | | |
| View Review list | View Review list (Company) | | | ✓ | | | |
| Chat with customer | Chat with customer | | | ✓ | | | |
| **--- NHÓM COORDINATOR ---** | | | | | | | |
| Dashboard | Coordinator Dashboard | | | (✓)* | ✓ | | |
| View Guards | View Guards | | | (✓)* | ✓ | | |
| View guard detail | View guard detail | | | (✓)* | ✓ | | |
| Create Guard Account (Popup) | Create Guard Account | | | | ✓ | | |
| Approve/Reject guard profile (Popup) | Approve/Reject guard profile | | | | ✓ | | |
| View Guard Performance | View Guard Performance | | | | ✓ | | |
| View work shifts | View work shifts | | | | ✓ | | |
| Create work shift (Popup) | Create work shift | | | | ✓ | | |
| Dispatch replacement guard (Popup) | Dispatch replacement guard | | | | ✓ | | |
| View Shift Substitute Request | View Shift Substitute Requests | | | | ✓ | | |
| Approve/Reject shift Substitute (Popup) | Approve/Reject shift Substitute | | | | ✓ | | |
| View reports | View reports | | | | ✓ | | |
| Update reports (Popup) | Update reports | | | | ✓ | | |
| View Request Verifications | View Request Verifications (Coor) | | | | ✓ | | |
| View Request Verification Detail | View Request Verification Detail (Coor) | | | | ✓ | | |
| Update Request Verification (Popup) | Update Request Verification | | | | ✓ | | |
| View Bookings | View Bookings | | | | ✓ | | |
| View Booking Detail | View Booking Detail | | | | ✓ | | |
| **--- NHÓM GUARD ---** | | | | | | | |
| View shift schedule | View shift schedule | | | | | ✓ | |
| View my work shift | View my work shift | | | | | ✓ | |
| View work shift detail | View work shift Detail | | | | | ✓ | |
| Check-in work shift | Check-in work shift | | | | | ✓ | |
| Request Shift Substitute (Popup) | Request Shift Substitute | | | | | ✓ | |
| view personal guard profile | View Personal Guard Profile | | | | | ✓ | |
| **--- NHÓM ADMIN ---** | | | | | | | |
| Dashboard | Admin Dashboard | | | | | | ✓ |
| View Companies | View Companies By Admin | | | | | | ✓ |
| Company Detail (Popup) | View Company Details (Admin) | | | | | | ✓ |
| View Registrations | View Registrations | | | | | | ✓ |
| View Registrations Detail | View Registrations Detail | | | | | | ✓ |
| Approve/Reject Company (Popup) | Approve/Reject Company | | | | | | ✓ |
| View Publish Request list | View Publish Request list | | | | | | ✓ |
| View Publish Request Detail | View Publish Request Detail | | | | | | ✓ |
| Approve/Reject publish request (Popup) | Approve/Reject publish request | | | | | | ✓ |
| View Account | View Accounts | | | | | | ✓ |
| View Account Detail | View Account Detail | | | | | | ✓ |
| Ban Account (Popup) | Ban Account | | | | | | ✓ |
| Service Package Management | View Plans By Admin | | | | | | ✓ |
| Add Plan (Popup) | Add Plan | | | | | | ✓ |
| Update Plan (Popup) | Update Plan | | | | | | ✓ |
| Delete Plan (Popup) | Delete Plan | | | | | | ✓ |
| View Services | View Services | | | | | | ✓ |
| Add Services (Popup) | Add Services | | | | | | ✓ |
| Update Services (Popup) | Update Services | | | | | | ✓ |
| Delete Services (Popup) | Delete Services | | | | | | ✓ |
| View Subscription Payments | View Payment history | | | | | | ✓ |
| View Bank Account | View Bank Account | | | | | | ✓ |
| Add Bank Account (Popup) | Add Bank Account | | | | | | ✓ |
| Update Bank Account (Popup) | Update Bank Account | | | | | | ✓ |
| Delete Bank Account (Popup) | Delete Bank Account | | | | | | ✓ |

---

## 2. Ghi Chú Phân Quyền Kỹ Thuật (System Role Guard & Layouts)

1. **Trang Cá Nhân (Profile - `/profile`)**:
   - Định nghĩa tại `src/app/profile/page.tsx`:
     ```tsx
     <RoleGuard allowedRoles={["customer", "guard", "coordinator", "admin", "company-admin"]}>
     ```
   - Cho phép tất cả **5 vai trò đã xác thực** (Customer, Guard, Coordinator, Admin, Company Admin) truy cập để xem và cập nhật hồ sơ cá nhân.

2. **Khu Vực Coordinator `(✓)*`**:
   - Định nghĩa tại `src/app/(Coordinator)/layout.tsx`:
     ```tsx
     <RoleGuard allowedRoles={["coordinator", "company-admin"]}>
     ```
   - Cấp quyền chính cho **Coordinator**, đồng thời **Company Admin** có quyền truy cập giám sát trực tiếp các màn hình quản lý bảo vệ, phân ca và báo cáo của công ty mình.

3. **Đăng Ký Doanh Nghiệp (Register Company - `/register-company`)**:
   - Cho phép khách hàng đang đăng nhập (`Customer`) gửi hồ sơ mở công ty an ninh, đồng thời hỗ trợ người dùng vãng lai (`Guest`) tạo tài khoản trực tiếp qua luồng Step SignUp.

4. **Các Màn Hình Công Khai (Public Pages - Home, View Companies, Company Details, Compare Companies)**:
   - Các màn hình này không bị chặn bởi `RoleGuard`, bất kỳ ai (Guest hoặc mọi vai trò đã đăng nhập) đều có thể xem.
