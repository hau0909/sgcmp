# Use Case Specification: View Request Verification Detail

**UC ID and Name:** UC-VER-03 - View Request Verification Detail
**Created By:** AI Assistant
**Date Created:** 21/07/2026
**Primary Actor:** Company Admin, Coordinator
**Secondary Actors:** None

**Trigger:**
The user clicks on the "Xem chi tiết" button for a specific verification record in the Verifications List page.

**Description:**
This use case allows users to view the detailed information of a site verification, including booking details, current status, descriptions, notes, and uploaded images.

**Preconditions:**
- **PRE-01:** The user is logged in as a Company Admin or Coordinator.

**Post-conditions:**
- **POST-01:** The system displays the detailed verification information.

**Normal Flow (Luồng sự kiện chính):**
**A. View Verification Detail**
1. The user accesses the Verification Detail page.
2. The system retrieves the booking details and the associated verification session.
3. The system displays the Booking Information.
4. The system displays the Verification status, description, notes (if any), and uploaded images.

**Alternative Flows (Luồng rẽ nhánh):**
**A.1 No Verification Session Exists**
1. The user accesses a booking that has no verification session yet.
2. The system displays the "Chưa có phiên khảo sát" empty state.

**Exceptions (Ngoại lệ):**
- **EX-01:** Data Fetch Error
  1. The system fails to load the verification details.
  2. The system displays MSG04.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01
**Other Information:** N/A
**Assumptions:** N/A
