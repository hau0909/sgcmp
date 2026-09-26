# 🎬 KỊCH BẢN & LUỒNG VIDEO DEMO HỆ THỐNG SGCMP (TỐI ĐA 15 PHÚT)

Tài liệu hướng dẫn kịch bản quay Video Demo sản phẩm hệ thống **SGCMP (Smart Guard Company Management Platform)**. Kịch bản được đánh số thứ tự liên tục **từ 1. Register Company đến 47. Complete Contract** (Bao phủ toàn bộ các Chức năng hệ thống, loại trừ chức năng *Add Guard into Contract* không đánh số theo yêu cầu).

---

## ⏱️ BẢNG TỔNG QUAN THỜI LƯỢNG & CHUỖI CHỨC NĂNG ĐÁNH SỐ (47 CHỨC NĂNG)

| Phân đoạn | Thời lượng | Chuỗi Chức Năng Đánh Số (Sequential Steps) | Vai trò | Route |
| :---: | :---: | :--- | :--- | :--- |
| **Phần 0** | **01:00** | Giới thiệu hệ thống SGCMP & 5 Actor | MC / Host | `/` |
| **Giai đoạn 1** | **03:00** | `1. Register Company` ➔ `2. Register` ➔ `3. Email Verification` ➔ `4. View Register Request` ➔ `5. Update Register Request` ➔ `6. Approve/Reject Company` ➔ `7. Login` ➔ `8. View and Manage Subscription` ➔ `9. Pay SaaS Plan` ➔ `10. Add Service` ➔ `11. View Services` ➔ `12. Add Company Service` ➔ `13. Send Publish Request` ➔ `14. View Publish Request Detail` ➔ `15. Approve/Reject Publish Request` | Company Admin,<br/>System Admin | `/register-company`<br/>`/admin/registrations`<br/>`/company/billing`<br/>`/admin/publish-requests` |
| **Giai đoạn 2** | **03:00** | `16. Create Coordinator Account` ➔ `17. Create Guard Account` ➔ `18. View Guards` ➔ `19. View Company Profile` ➔ `20. Send Service Request` ➔ `21. View My Requests` ➔ `22. View My Request Detail` ➔ `23. Edit Service Request` ➔ `24. View Requests` ➔ `25. View Request Detail` ➔ `26. Create Request Verification` | Company Admin,<br/>Customer | `/company/coordinators`<br/>`/company/guards`<br/>`/companies`<br/>`/customer/requests` |
| **Giai đoạn 3** | **03:00** | `27. View Request Verifications` ➔ `28. View Request Verification Detail` ➔ `29. Update Request Verification` ➔ `30. Approve/Reject Request Verification` ➔ `31. Update Service Quotation` ➔ `32. Confirm/Deny Quotation` ➔ `33. View My Contract` ➔ `34. View My Contract Detail` ➔ `35. View Contracts` ➔ `36. View Contract Detail` ➔ `37. Upload Physical Contract` ➔ `38. Confirm Contract by Company` ➔ `39. Confirm Contract by Customer` | Coordinator,<br/>Company Admin,<br/>Customer | `/coordinator/verifications`<br/>`/company/quotations`<br/>`/company/contracts` |
| **Giai đoạn 4** | **03:00** | `40. Create Work Shift` ➔ `41. View Work Shift` ➔ `42. View My Work Shift` ➔ `43. View Work Shift Detail` ➔ `44. Check-in Work Shift` ➔ `45. Dispatch Replacement Guard` ➔ `46. View Guard Performance` | Coordinator,<br/>Security Guard | `/coordinator/shifts`<br/>`/guard/shifts` |
| **Giai đoạn 5** | **02:00** | `47. Complete Contract` & Tổng kết Đánh giá | Customer,<br/>Company Admin | `/customer/contracts`<br/>`/company/profile` |

---

## 🎬 CHI TIẾT TỪNG BƯỚC DEMO THEO THỨ TỰ (ĐÁNH SỐ TỪ 1 ĐẾN 47)

### 📌 GIAI ĐOẠN 1: ONBOARDING CÔNG TY & MUA GÓI SAAS (01:00 - 04:00)

* **1. Register Company** (Phụ trách: **Khang**) — *Route: `/register-company`*  
  Company Admin mở trang đăng ký công ty, nhập tên công ty, MST, địa chỉ và tải file Giấy phép kinh doanh lên Stepper Form.
* **2. Register** (Phụ trách: **Lâm**) — *Route: `/register-company`*  
  Nhập Email, Mật khẩu và tạo thông tin tài khoản người đại diện pháp luật.
* **3. Email Verification** (Phụ trách: **Lâm**) — *Route: `/register-company`*  
  Hệ thống gửi email xác thực tài khoản công ty mới đăng ký.
* **4. View Register Request** (Phụ trách: **Hoàng**) — *Route: `/admin/registrations`*  
  System Admin đăng nhập, mở danh sách hồ sơ xem chi tiết thông tin đăng ký doanh nghiệp mới.
* **5. Update Register Request** (Phụ trách: **Hoàng**) — *Route: `/admin/registrations`*  
  Kiểm tra và cập nhật ghi chú thẩm định hồ sơ đăng ký.
* **6. Approve/Reject Company** (Phụ trách: **Lộc**) — *Route: `/admin/registrations`*  
  System Admin bấm Phê duyệt (Approve) hồ sơ. Kích hoạt tài khoản công ty sang `CompanyStatus: active`.
* **7. Login** (Phụ trách: **Lâm**) — *Route: `/login`*  
  Company Admin đăng nhập vào hệ thống quản lý công ty bảo vệ vừa được phê duyệt.
* **8. View and Manage Subscription** (Phụ trách: **Hậu**) — *Route: `/company/billing`*  
  Company Admin mở trang quản lý gói dịch vụ SaaS, xem danh sách các gói dịch vụ (Basic, Pro, Enterprise).
* **9. Pay SaaS Plan** (Phụ trách: **Hậu**) — *Route: `/company/billing`*  
  Thực hiện thanh toán cước phí gói SaaS Subscription. Hệ thống xác nhận và tự động cấp Hạn ngạch (Quota) nhân sự bảo vệ.
* **10. Add Service** (Phụ trách: **Hoàng**) — *Route: `/admin/services`*  
  System Admin cấu hình danh mục các Dịch vụ Mẫu của Hệ thống (Master Service Catalog).
* **11. View Services** (Phụ trách: **Hoàng**) — *Route: `/company/services`*  
  Company Admin xem danh mục Dịch vụ Mẫu để lựa chọn loại dịch vụ cung cấp.
* **12. Add Company Service** (Phụ trách: **Lộc**) — *Route: `/company/services`*  
  Công ty chọn dịch vụ cung cấp và Cấu hình bảng giá dịch vụ của doanh nghiệp mình.
* **13. Send Publish Request** (Phụ trách: **Hậu**) — *Route: `/company/profile`*  
  Công ty hoàn thiện thông tin giới thiệu và bấm **Gửi Yêu cầu Niêm yết Public**.
* **14. View Publish Request Detail** (Phụ trách: **Lộc**) — *Route: `/admin/publish-requests`*  
  System Admin mở xem chi tiết hồ sơ yêu cầu niêm yết public của công ty.
* **15. Approve/Reject Publish Request** (Phụ trách: **Lộc**) — *Route: `/admin/publish-requests`*  
  System Admin bấm Phê duyệt Niêm yết Công khai (`published`). Công ty xuất hiện trên Marketplace.

---

### 📌 GIAI ĐOẠN 2: KHỞI TẠO NHÂN SỰ & TẠO YÊU CẦU DỊCH VỤ (04:00 - 07:00)

* **16. Create Coordinator Account** (Phụ trách: **Hoàng**) — *Route: `/company/coordinators`*  
  Company Admin tạo tài khoản cho Điều phối viên (Coordinator) vận hành.
* **17. Create Guard Account** (Phụ trách: **Lâm**) — *Route: `/company/guards`*  
  Company Admin khởi tạo tài khoản cho Nhân viên Bảo vệ.
* **18. View Guards** (Phụ trách: **Lâm**) — *Route: `/company/guards`*  
  Mở xem danh sách lực lượng nhân sự bảo vệ hiện có của công ty.
* **19. View Company Profile** (Phụ trách: **Lộc**) — *Route: `/companies/[id]`*  
  Khách hàng xem trang giới thiệu công ty, danh mục dịch vụ và mức giá công khai trên Marketplace.
* **20. Send Service Request** (Phụ trách: **Khang**) — *Route: `/companies/[id]/book`*  
  Khách hàng điền thông tin nhu cầu và bấm **Tạo Yêu cầu Đặt Dịch vụ (Booking)** (`pending`).
* **21. View My Requests** (Phụ trách: **Khang**) — *Route: `/customer/requests`*  
  Khách hàng xem danh sách các yêu cầu dịch vụ đã gửi của cá nhân.
* **22. View My Request Detail** (Phụ trách: **Khang**) — *Route: `/customer/requests/[id]`*  
  Khách hàng xem chi tiết thông tin và tiến độ của yêu cầu dịch vụ.
* **23. Edit Service Request** (Phụ trách: **Lộc**) — *Route: `/customer/requests/[id]`*  
  Chỉnh sửa/bổ sung thông tin yêu cầu dịch vụ nếu cần.
* **24. View Requests** (Phụ trách: **Hậu**) — *Route: `/company/requests`*  
  Company Admin vào danh sách tiếp nhận các yêu cầu dịch vụ mới từ khách hàng.
* **25. View Request Detail** (Phụ trách: **Hậu**) — *Route: `/company/requests/[id]`*  
  Company Admin mở xem chi tiết địa điểm, số lượng và yêu cầu mục tiêu của khách hàng.
* **26. Create Request Verification** (Phụ trách: **Hậu**) — *Route: `/company/requests/[id]`*  
  Company Admin tạo Phiếu Khảo sát Địa bàn Thực tế và phân công Coordinator phụ trách.

---

### 📌 GIAI ĐOẠN 3: KHẢO SÁT, BÁO GIÁ & KÝ HỢP ĐỒNG SỐ (07:00 - 10:00)

* **27. View Request Verifications** (Phụ trách: **Hậu**) — *Route: `/coordinator/verifications`*  
  Coordinator đăng nhập, mở danh sách các phiếu khảo sát được giao phụ trách.
* **28. View Request Verification Detail** (Phụ trách: **Hậu**) — *Route: `/coordinator/verifications/[id]`*  
  Coordinator xem chi tiết thông tin mục tiêu cần khảo sát.
* **29. Update Request Verification** (Phụ trách: **Hậu**) — *Route: `/coordinator/verifications/[id]`*  
  Coordinator đi khảo sát địa bàn và cập nhật nội dung khảo sát, số chốt trực & hình ảnh thực địa.
* **30. Approve/Reject Request Verification** (Phụ trách: **Hậu**) — *Route: `/company/verifications`*  
  Company Admin xem báo cáo khảo sát từ Coordinator và bấm **Phê duyệt Báo cáo Khảo sát**.
* **31. Update Service Quotation** (Phụ trách: **Khang**) — *Route: `/company/quotations`*  
  Company Admin dựa trên báo cáo khảo sát đã duyệt để lập & gửi **Bảng Báo giá Chi tiết** cho khách hàng (`quoted`).
* **32. Confirm/Deny Quotation** (Phụ trách: **Khang**) — *Route: `/customer/requests/[id]`*  
  Khách hàng xem chi tiết báo giá và bấm **Chấp nhận Báo giá** (`accepted`).
* **33. View My Contract** (Phụ trách: **Hoàng**) — *Route: `/customer/contracts`*  
  Khách hàng kiểm tra danh sách hợp đồng được tự động tạo sơ bộ.
* **34. View My Contract Detail** (Phụ trách: **Hoàng**) — *Route: `/customer/contracts/[id]`*  
  Khách hàng mở xem bản hợp đồng PDF sơ bộ.
* **35. View Contracts** (Phụ trách: **Hậu**) — *Route: `/company/contracts`*  
  Company Admin xem danh sách hợp đồng đang chờ ký số.
* **36. View Contract Detail** (Phụ trách: **Hậu**) — *Route: `/company/contracts/[id]`*  
  Company Admin kiểm tra chi tiết các điều khoản trong hợp đồng.
* **37. Upload Physical Contract** (Phụ trách: **Hậu**) — *Route: `/company/contracts/[id]`*  
  Tải lên bản sao hợp đồng giấy/dấu mộc nếu cần bổ sung.
* **38. Confirm Contract by Company** (Phụ trách: **Hậu**) — *Route: `/company/contracts/[id]`*  
  Company Admin thực hiện **Ký số Điện tử phía Công ty** (`company_agreed = true`).
* **39. Confirm Contract by Customer** (Phụ trách: **Hoàng**) — *Route: `/customer/contracts/[id]`*  
  Khách hàng xem PDF và thực hiện **Ký số Điện tử phía Khách hàng** (`customer_agreed = true`).  
  *Hệ thống tự động kích hoạt Hợp đồng sang trạng thái **`ACTIVE`**.*

---

### 📌 GIAI ĐOẠN 4: LẬP LỊCH CA TRỰC, ĐIỂM DANH ÁNH LIVE & ĐIỀU ĐỘNG KHẨN CẤP (10:00 - 13:00)

*(Lưu ý: Thao tác phân công bảo vệ vào hợp đồng/ca trực - Add Guard into Contract - được thực hiện lồng trong các bước tạo lịch).*

* **40. Create Work Shift** (Phụ trách: **Lâm**) — *Route: `/coordinator/shifts`*  
  Coordinator chọn Hợp đồng ACTIVE, tạo các Khung ca trực & chọn bảo vệ gán vào ca.
* **41. View Work Shift** (Phụ trách: **Lâm**) — *Route: `/coordinator/shifts`*  
  Coordinator xem và kiểm tra danh sách ca trực, hệ thống tự động validation chống trùng ca.
* **42. View My Work Shift** (Phụ trách: **Lâm**) — *Route: `/guard/shifts`*  
  Bảo vệ đăng nhập app mobile/web xem danh sách ca trực được phân công.
* **43. View Work Shift Detail** (Phụ trách: **Lâm**) — *Route: `/guard/shifts/[id]`*  
  Bảo vệ xem vị trí mục tiêu, thời gian ca trực và yêu cầu nhiệm vụ.
* **44. Check-in Work Shift** (Phụ trách: **Lâm**) — *Route: `/guard/shifts/[id]`*  
  Bảo vệ thực hiện **Check-in bằng Ảnh chụp đồng phục Live**. Hệ thống ghi nhận mốc thời gian và chấm công `ON_TIME`.
* **45. Dispatch Replacement Guard** (Phụ trách: **Lâm**) — *Route: `/coordinator/incidents`*  
  Giả lập ca trực quá giờ check-in chuyển `ABSENT`. Coordinator bấm **Kích hoạt Điều động Khẩn cấp** gán Bảo vệ Dự phòng thế chỗ.
* **46. View Guard Performance** (Phụ trách: **Lâm**) — *Route: `/coordinator/performance`*  
  Coordinator theo dõi tình hình nhận ca của bảo vệ dự phòng và đánh giá hiệu suất nhân sự.

---

### 📌 GIAI ĐOẠN 5: HOÀN THÀNH HỢP ĐỒNG, ĐÁNH GIÁ & TỔNG KẾT (13:00 - 15:00)

* **47. Complete Contract** (Phụ trách: **Hậu**) — *Route: `/customer/contracts/[id]`*  
  Khi hết thời hạn hợp đồng, Khách hàng bấm **Xác nhận Hoàn thành Hợp đồng** (`COMPLETED`), gửi **Đánh giá 5 Sao** và Công ty gửi **Phản hồi Chính thức**. Tổng kết video.
