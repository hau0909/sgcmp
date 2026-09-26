### [UC-SHIFT-05] [Check-in Work Shift]

**Function trigger:** The Guard clicks the "Thực hiện Check-in" button on the shift detail page or opens the check-in page for their active shift assignment.

**Function description:** This screen enables a Security Guard to view shift location details, access the device camera stream, capture a live uniform selfie photograph as proof of presence, and submit a check-in request within the authorized time window.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the Guard's authentication, role permissions, assigned shift access, and active time window. [Refer to **BR-01**, **BR-08**, **BR-41**, **BR-42**]
    *   The top header section displays a back navigation arrow button and the page title "Điểm danh ca trực".
    *   The shift overview card displays shift title, target location, time duration, work post address, and attendance status badge ("Chờ điểm danh", "Hoàn thành", "Điểm danh trễ", or "Vắng mặt").
    *   The live camera container provides:
        *   Live video viewfinder stream with a camera toggle button (front/back facing camera).
        *   "Mở camera & chụp ảnh" button if camera is stopped, or "Chụp ảnh" capture button while the live stream is active.
        *   After capture, the container displays the captured selfie image preview along with "Chụp lại" (Retake photo) and remove photo controls.
    *   The dynamic status banner displays real-time instructions (e.g., "Vui lòng chụp ảnh xác thực để điểm danh", "Ảnh đã sẵn sàng. Vui lòng bấm Xác nhận Check-in").
    *   When a valid selfie photograph is captured and the time window is active, the "Xác nhận Check-in" action button is enabled. [Refer to **BR-45**]
    *   Clicking "Xác nhận Check-in" uploads the photo proof, records the check-in timestamp, updates attendance status to "Completed" (On Time) or "Late", displays a success popup modal, and returns the Guard to the shift view. [Refer to **BR-43**, **BR-44**]

*   **Abnormal execution case:**
    *   If camera permissions are denied or camera hardware is unavailable, the camera container displays a video off icon and error message: "Không thể mở camera. Vui lòng kiểm tra quyền truy cập máy ảnh". [Refer to **BR-45**]
    *   If the current time exceeds the maximum allowed absence threshold, the screen displays an error banner: "Đã quá thời gian cho phép điểm danh. Ca trực đã bị ghi nhận Vắng mặt" and disables check-in submission. [Refer to **BR-42**, **BR-43**]
    *   If the current time is prior to the allowed check-in window, the screen displays an informational notice: "Chưa đến thời gian điểm danh. Bạn có thể điểm danh từ [thời gian bắt đầu]" and disables check-in submission. [Refer to **BR-42**]
    *   If the shift assignment is already checked in or completed, the action button displays "Đã hoàn thành" or "Đã điểm danh trễ" and remains disabled. [Refer to **BR-44**]
    *   If a network or API server failure occurs during check-in submission, the system displays an error popup modal: "Điểm danh thất bại. Vui lòng thử lại".
