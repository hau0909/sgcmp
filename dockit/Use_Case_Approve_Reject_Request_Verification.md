# Use Case Specification: Approve/Reject Request Verification

**UC ID and Name:** UC-VER-05 - Approve/Reject Request Verification
**Created By:** AI Assistant
**Date Created:** 21/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The user clicks the "Duyệt khảo sát" or "Từ chối" button on a Pending verification detail page.

**Description:**
This use case allows a Company Admin to review the site verification report submitted by a Coordinator and either approve it or reject it (with mandatory notes).

**Preconditions:**
- **PRE-01:** The user is logged in as a Company Admin.
- **PRE-02:** The verification session is in "Pending" status.

**Post-conditions:**
- **POST-01:** The verification status is changed to "Approved" or "Rejected".

**Normal Flow (Luồng sự kiện chính):**
**A. Approve Verification**
1. The user reviews the details and clicks "Duyệt khảo sát".
2. The system opens a confirmation dialog.
3. The user clicks "Đồng ý duyệt".
4. The system updates the status to "Approved".
5. The system refreshes the UI to reflect the new status.

**Alternative Flows (Luồng rẽ nhánh):**
**A.1 Reject Verification**
1. The user reviews the details and decides to reject.
2. The user enters reasoning in the "Ghi chú" (Notes) field.
3. The user clicks "Từ chối".
4. The system opens a confirmation dialog showing the notes.
5. The user clicks "Xác nhận từ chối".
6. The system updates the status to "Rejected" and saves the notes.

**A.2 Reject without Notes**
1. The user clicks "Từ chối" without entering notes.
2. The system blocks the action and displays an inline error: "Vui lòng điền Ghi chú khi từ chối khảo sát."
3. The user returns to step A.1.2.

**Exceptions (Ngoại lệ):**
- **EX-01:** Update Error
  1. The system encounters an error updating the status.
  2. The system displays MSG04.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01
**Other Information:** Coordinators cannot approve or reject verifications.
**Assumptions:** N/A
