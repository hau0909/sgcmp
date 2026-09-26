# HƯỚNG DẪN DÀNH CHO AGENT (AGENT INSTRUCTIONS)

Khi người dùng yêu cầu viết hoặc cập nhật danh sách Thông báo ứng dụng (Application Messages), bạn (Agent) **PHẢI** tuân thủ chính xác cấu trúc Markdown dưới đây:

1. Sử dụng bảng gồm đúng 5 cột: Cột 1 là số thứ tự (`#`), Cột 2 là mã thông báo (`Message Code`), Cột 3 là phân loại thông báo (`Message Type`), Cột 4 là ngữ cảnh (`Context`), Cột 5 là nội dung thông báo hiển thị trên giao diện (`Content`).
2. Tuyệt đối không tự ý thêm hoặc bớt các cột khác trừ khi được người dùng yêu cầu.
3. Nội dung thông báo hiển thị ở cột `Content` phải trùng khớp với văn bản/chuỗi hiển thị thực tế trên giao diện hệ thống (có thể là tiếng Việt hoặc tiếng Anh tùy thuộc vào mã nguồn).

---

# Application Messages List

| #      | Message Code | Message Type  | Context                      | Content                                                         |
| :----- | :----------- | :------------ | :--------------------------- | :-------------------------------------------------------------- |
| **1** | MSG01 | Inline Error | Company not found | _Không tìm thấy thông tin tài khoản doanh nghiệp._ |
| **2** | MSG02 | Loading State | Loading billing data | _Đang tải thông tin gói dịch vụ & thanh toán..._ |
| **3** | MSG03 | Toast Error | Payment creation failed | _Không thể khởi tạo giao dịch thanh toán_ |
| **4** | MSG04 | Toast Error | System exception | _Đã xảy ra lỗi hệ thống, vui lòng thử lại sau._ |
| **5** | MSG05 | Table Info | Empty transaction history | _Không có giao dịch nào_ |
| **6** | MSG06 | Loading State | Loading contract list | _Đang tải danh sách hợp đồng..._ |
| **7** | MSG07 | Table Info | Empty contract list | _Không tìm thấy hợp đồng nào._ |
| **8** | MSG08 | Toast Success | Contract file uploaded | _Tải lên tệp hợp đồng thành công!_ |
| **9** | MSG09 | Toast Error | Contract file upload failed | _Tải lên tệp hợp đồng thất bại._ |
| **10** | MSG10 | Toast Success | Contract file deleted | _Đã xóa tệp hợp đồng đính kèm!_ |
| **11** | MSG11 | Toast Error | Contract file delete failed | _Xóa tệp hợp đồng thất bại._ |
| **12** | MSG12 | Alert | Invalid file format | _Hệ thống chỉ chấp nhận tệp định dạng PDF!_ |
| **13** | MSG13 | Toast Success | Company signed contract | _Ký duyệt hợp đồng với tư cách Công ty thành công!_ |
| **14** | MSG14 | Toast Error | Company sign contract failed | _Ký duyệt hợp đồng thất bại._ |
| **15** | MSG15 | Inline Error | Contract not found | _Không tìm thấy thông tin hợp đồng._ |
| **16** | MSG16 | Loading State | Loading request list | _Đang tải danh sách yêu cầu..._ |
| **17** | MSG17 | Table Info | Empty request list | _Không tìm thấy yêu cầu dịch vụ nào._ |
| **18** | MSG18 | Alert | Feature under construction | _Chức năng tạo yêu cầu trực tiếp đang được xây dựng!_ |
| **19** | MSG19 | Loading State | Loading request detail | _Đang tải chi tiết yêu cầu..._ |
| **20** | MSG20 | Inline Error | Request not found | _Không tìm thấy thông tin yêu cầu đặt lịch._ |
| **21** | MSG21 | Toast Success | Quote sent successfully | _Đã cập nhật báo giá & gửi phản hồi cho khách hàng thành công!_ |
| **22** | MSG22 | Toast Success | Request rejected | _Yêu cầu đặt lịch đã bị từ chối thành công._ |
| **23** | MSG23 | Loading State | Loading booking list | _Đang tải danh sách đơn đặt lịch..._ |
| **24** | MSG24 | Toast Success | Create shift success | _Tạo ca trực thành công_ |
| **25** | MSG25 | Inline Error | Missing contract selection | _Vui lòng chọn hợp đồng_ |
| **26** | MSG26 | Inline Error | Missing Shift Name | _Vui lòng nhập tên ca trực_ |
| **27** | MSG27 | Inline Error | Invalid guard count | _Số lượng bảo vệ phải lớn hơn 0_ |
| **28** | MSG28 | Inline Error | Missing location details | _Vui lòng nhập vị trí trực cụ thể_ |
| **29** | MSG29 | Inline Error | Guard count mismatch | _Số bảo vệ được chọn phải bằng số lượng bảo vệ cần_ |
| **30** | MSG30 | Inline/Toast Error | Guard shift conflict | _Một hoặc nhiều bảo vệ đã có ca trực trong khung giờ này_ |
| **31** | MSG31 | Inline/Toast Error | Shift duration limit | _Ca trực không được vượt quá 8 tiếng._ |
| **32** | MSG32 | Inline/Toast Error | Date outside contract | _Ngày bắt đầu ca trực phải nằm trong thời hạn hợp đồng_ |
| **33** | MSG33 | Inline/Toast Error | Split shift gap | _Các ca tách phải liên tục, không được bị hở thời gian._ |
| **34** | MSG34 | Inline/Toast Error | Split shift overlap | _Các ca tách không được trùng thời gian._ |
| **35** | MSG35 | Inline/Toast Error | Split duration mismatch | _Tổng thời gian sau khi tách phải bằng tổng thời gian ca ban đầu._ |
| **36** | MSG36 | Toast Error | Shift creation failure | _Tạo ca trực thất bại_ |
| **37** | MSG37 | Inline Error | Missing full name | _Vui lòng nhập họ và tên_ |
| **38** | MSG38 | Inline Error | Full name too short | _Họ và tên phải có ít nhất 2 ký tự_ |
| **39** | MSG39 | Inline Error | Missing email | _Vui lòng nhập email_ |
| **40** | MSG40 | Inline Error | Invalid email format | _Email không đúng định dạng_ |
| **41** | MSG41 | Inline Error | Disposable email not allowed | _Không cho phép sử dụng email tạm thời_ |
| **42** | MSG42 | Inline Error | Missing phone number | _Vui lòng nhập số điện thoại_ |
| **43** | MSG43 | Inline Error | Invalid phone number format | _Số điện thoại không hợp lệ_ |
| **44** | MSG44 | Inline Error | Email already registered | _Email này đã được đăng ký_ |
| **45** | MSG45 | Inline Error | Phone number already registered | _Số điện thoại này đã được đăng ký_ |
| **46** | MSG46 | Inline Error | Missing password | _Vui lòng nhập mật khẩu_ |
| **47** | MSG47 | Inline Error | Password complexity failed | _Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số_ |
| **48** | MSG48 | Inline Error | Missing confirm password | _Vui lòng xác nhận mật khẩu_ |
| **49** | MSG49 | Inline Error | Password mismatch | _Mật khẩu xác nhận không khớp_ |
| **50** | MSG50 | Toast Success | Account registration success | _Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản._ |
| **51** | MSG51 | Toast Error | Account registration failure | _Đăng ký thất bại. Vui lòng thử lại._ |
| **52** | MSG52 | Inline/Toast Error | Login credentials invalid | _Email hoặc mật khẩu không đúng_ |
| **53** | MSG53 | Inline/Toast Error | Login email unverified | _Email chưa được xác thực. Vui lòng kiểm tra email_ |
| **54** | MSG54 | Inline/Toast Error | Login role not found | _Không tìm thấy vai trò của tài khoản_ |
| **55** | MSG55 | Loading State | Logging in | _Đang đăng nhập..._ |
| **56** | MSG56 | Toast Success | Login success | _Đăng nhập thành công. Đang chuyển hướng..._ |
| **57** | MSG57 | Toast Error | Account suspended or inactive | _Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động._ |
| **58** | MSG58 | Loading State | Verifying email | _Đang xác thực email của bạn..._ |
| **59** | MSG59 | Toast Success | Email verified successfully | _Xác thực email thành công!_ |
| **60** | MSG60 | Loading State | Redirecting after verification | _Đang chuyển bạn đến trang phù hợp..._ |
| **61** | MSG61 | Toast Error | Verification link expired | _Liên kết xác thực đã hết hạn. Vui lòng đăng ký lại._ |
| **62** | MSG62 | Toast Error | Verification link invalid | _Liên kết xác thực không hợp lệ._ |
| **63** | MSG63 | Toast Error | Verification token rejected | _Xác thực thất bại. Liên kết có thể đã hết hạn._ |
| **64** | MSG64 | Toast Error | Profile fetch failed after verification | _Không thể lấy thông tin người dùng sau xác thực._ |
| **65** | MSG65 | Toast Success | Verification email resent | _Đã gửi lại email xác thực. Vui lòng kiểm tra hộp thư của bạn._ |
| **66** | MSG66 | Toast Error | Verification email resend failed | _Gửi lại email thất bại. Vui lòng thử lại._ |
| **67** | MSG67 | Toast Error | Verification connection error | _Xác thực thất bại do lỗi kết nối. Vui lòng thử lại._ |
| **68** | MSG68 | Loading State | Loading shift schedule | _Đang tải danh sách ca trực..._ |
| **69** | MSG69 | Toast/Inline Error | Shift schedule load failed | _Không thể tải danh sách ca trực_ |
| **70** | MSG70 | Inline Error | Coordinator not linked to company | _Tài khoản điều phối chưa được liên kết với công ty_ |
| **71** | MSG71 | Inline Error | Invalid shift view date | _Ngày xem ca trực không hợp lệ_ |
| **72** | MSG72 | Inline Error | Missing or invalid shift ID | _Không tìm thấy mã ca trực._ |
| **73** | MSG73 | Inline Error | Shift detail fetch failed | _Không thể lấy ca trực trong ngày._ |
| **74** | MSG74 | Toast Error | Unauthorized shift access | _Bạn không có quyền xem thông tin ca trực này._ |
| **75** | MSG75 | Inline Error | Weekly schedule fetch failed | _Không thể lấy lịch trực theo tuần._ |
| **76** | MSG76 | Table Info | Empty schedule placeholder | _Trống lịch_ |
| **77** | MSG77 | Table Info | Empty daily shift placeholder | _Không có ca trực trong ngày này._ |
| **78** | MSG78 | Alert | Company guard quota exceeded | _Công ty đã đạt giới hạn số lượng bảo vệ được phép. Vui lòng nâng cấp gói sử dụng dịch vụ trước khi thêm bảo vệ mới._ |
| **79** | MSG79 | Alert | Form validation warning | _Vui lòng kiểm tra lại các thông tin chưa hợp lệ._ |
| **80** | MSG80 | Inline Error | Full name format invalid | _Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ._ |
| **81** | MSG81 | Inline Error | Guard under age | _Nhân viên bảo vệ phải từ 18 tuổi trở lên._ |
| **82** | MSG82 | Inline Error | Invalid CCCD format | _CCCD/CMND phải gồm 9 hoặc 12 chữ số._ |
| **83** | MSG83 | Inline Error | Date of birth in future | _Ngày sinh không được ở tương lai._ |
| **84** | MSG84 | Inline Error | CCCD date of issue in future | _Ngày cấp CCCD/CMND không được ở tương lai._ |
| **85** | MSG85 | Inline Error | Missing resident address | _Vui lòng nhập địa chỉ thường trú._ |
| **86** | MSG86 | Inline Error | Missing place of issue | _Vui lòng nhập nơi cấp CCCD/CMND._ |
| **87** | MSG87 | Inline Error | Missing avatar image | _Vui lòng tải ảnh thẻ nhân viên._ |
| **88** | MSG88 | Inline Error | Missing CCCD front image | _Vui lòng tải ảnh mặt trước CCCD._ |
| **89** | MSG89 | Inline Error | Missing CCCD back image | _Vui lòng tải ảnh mặt sau CCCD._ |
| **90** | MSG90 | Inline/Toast Error | CCCD already registered | _Số CCCD/CMND đã được sử dụng._ |
| **91** | MSG91 | Toast Error | Guard image upload failed | _Không thể tải ảnh bảo vệ._ |
| **92** | MSG92 | Toast Error | CCCD image upload failed | _Không thể tải ảnh mặt trước/sau CCCD._ |
| **93** | MSG93 | Toast Error | Guard profile save failed | _Không thể lưu thông tin bảo vệ._ |
| **94** | MSG94 | Toast Success | Guard account created | _Tạo tài khoản bảo vệ thành công. Email xác thực đã được gửi._ |
| **95** | MSG95 | Inline Error | Guard list fetch failed | _Không thể tải danh sách bảo vệ_ |
| **96** | MSG96 | Table Info | No guard search matches | _Không tìm thấy nhân viên bảo vệ phù hợp._ |
| **97** | MSG97 | Table Info | Empty guard list | _Chưa có nhân viên bảo vệ._ |
| **98** | MSG98 | Inline Error | Missing company name | _Vui lòng nhập tên công ty._ |
| **99** | MSG99 | Inline Error | Missing company description | _Vui lòng nhập giới thiệu doanh nghiệp._ |
| **100** | MSG100 | Inline Error | Missing company email | _Vui lòng nhập email._ |
| **101** | MSG101 | Inline Error | Invalid company email format | _Email không đúng định dạng._ |
| **102** | MSG102 | Inline Error | Missing company phone | _Vui lòng nhập số điện thoại._ |
| **103** | MSG103 | Inline Error | Invalid company phone format | _Số điện thoại phải bắt đầu bằng 0 hoặc +84._ |
| **104** | MSG104 | Inline Error | Missing company address | _Vui lòng nhập địa chỉ._ |
| **105** | MSG105 | Toast Success | Company profile updated | _Cập nhật thông tin công ty thành công._ |
| **106** | MSG106 | Toast Error | Company profile update failed | _Không thể cập nhật thông tin công ty._ |
| **107** | MSG107 | Inline Error | Review list fetch failed | _Không thể lấy danh sách đánh giá._ |
| **108** | MSG108 | Inline Error | Review summary fetch failed | _Không thể lấy tổng quan đánh giá._ |
| **109** | MSG109 | Inline Error | Company ID not found for reviews | _Không tìm thấy công ty để lấy danh sách đánh giá._ |
| **110** | MSG110 | Table Info | Empty review list | _Chưa có đánh giá nào cho doanh nghiệp._ |
| **111** | MSG111 | Table Info | No review search matches | _Không tìm thấy đánh giá phù hợp._ |
| **112** | MSG112 | Toast Success | Publish request sent | _Gửi yêu cầu công khai thành công._ |
| **113** | MSG113 | Toast Error | Publish request failed | _Không thể gửi yêu cầu công khai. Vui lòng thử lại._ |
| **114** | MSG114 | Toast Success | Contract completed | _Hợp đồng đã được hoàn thành thành công!_ |
| **115** | MSG115 | Toast Error | Contract completion failed | _Hoàn thành hợp đồng thất bại._ |
| **116** | MSG116 | Inline Error | Payment check pending | _Thanh toán chưa được ghi nhận. Vui lòng đợi thêm hoặc kiểm tra lại._ |
| **117** | MSG117 | Toast Error | Payment check failed | _Đã xảy ra lỗi khi kiểm tra thanh toán. Vui lòng thử lại._ |
