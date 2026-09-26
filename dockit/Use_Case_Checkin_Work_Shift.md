# Use Case Specification: Check-in Work Shift

**UC ID and Name:** UC-SHIFT-05 - Check-in Work Shift
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Guard
**Secondary Actors:** None

**Trigger:**
The Guard clicks the "Thực hiện Check-in" button on the shift detail page or accesses the check-in page for their active shift.

**Description:**
The Guard captures a live selfie photograph as photo proof of presence and submits a check-in request for an assigned work shift within the authorized time window.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system as a Security Guard with an active account status.
- **PRE-02:** The Guard is explicitly assigned to the target work shift on the current date.
- **PRE-03:** The Guard has not yet completed check-in for this shift assignment.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system uploads the live photo proof, records the check-in timestamp, updates Guard attendance status ("Completed" / On Time or "Late"), and displays a success notification.
- **POST-02:** If check-in fails or the time window expires, the system displays an error notice and prohibits check-in submission.

**Normal Flow (Luồng sự kiện chính):**
**A. Check-in Work Shift Successfully**

1. The Guard opens the shift check-in page.
2. The system verifies the Guard's authentication, assigned shift access, and current time window.
3. The system displays shift information (shift title, target location, time duration, work post address) and the live camera preview frame.
4. The Guard grants camera permissions and captures a live selfie photograph in uniform.
5. The system displays the captured photo preview and enables the "Xác nhận Check-in" button.
6. The Guard clicks "Xác nhận Check-in".
7. The system uploads the selfie photo proof, verifies check-in timing within the allowed grace period, records the check-in timestamp, updates attendance status to "Completed" (On Time), and displays a success notification.
8. The Guard acknowledges the success notification and returns to the shift view.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Retake captured photo**
1. The Guard clicks the retake button.
2. The system discards the current photo preview, reactivates the live camera stream, and returns to step A.4.

**A.7a Check-in during late grace period**
1. The Guard submits check-in after the scheduled start time plus late grace period, but before the maximum absence threshold.
2. The system records the check-in timestamp, updates attendance status to "Late", and displays a late check-in notification.

**Exceptions (Ngoại lệ):**

- **EX-01:** Camera access denied or device unavailable
  1. The Guard denies camera permission or camera device is disconnected.
  2. The system displays a camera error notice ("Vui lòng cấp quyền truy cập máy ảnh để điểm danh") and disables photo capture.

- **EX-02:** Check-in time window expired (Auto-marked Absent)
  1. The current time exceeds the maximum allowed absence threshold for the shift before check-in is submitted.
  2. The system marks the shift status as "Absent", displays a notice ("Đã quá thời gian cho phép điểm danh. Ca trực đã bị ghi nhận Vắng mặt"), and disables check-in.

- **EX-03:** Early check-in attempt before allowed window
  1. The Guard accesses the check-in page prior to the allowed check-in start window.
  2. The system displays an informational banner notice and disables the check-in submission button.

- **EX-04:** Check-in already completed for shift assignment
  1. The Guard attempts to check in to a shift that has already been checked in or completed.
  2. The system displays status "Đã hoàn thành" and disables further check-in submissions.

- **EX-05:** Server upload or API failure during check-in submission
  1. Network connection timeout or API server exception occurs while uploading photo proof or submitting check-in data.
  2. The system displays an error notification and retains the captured photo so the Guard can retry.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-41, BR-42, BR-43, BR-44, BR-45
**Other Information:** N/A
**Assumptions:** N/A
