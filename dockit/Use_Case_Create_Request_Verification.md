# Use Case Specification: Create Request Verification

**UC ID and Name:** UC-VER-01 - Create Request Verification
**Created By:** AI Assistant
**Date Created:** 21/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The user clicks the "Tạo phiên khảo sát" button on the Verification Detail page when no verification session exists for a booking.

**Description:**
This use case allows a Company Admin to initiate a new site verification session for a specific booking request, changing the state from "No session" to "Pending" and enabling the Coordinator to submit reports.

**Preconditions:**
- **PRE-01:** The user is logged in as a Company Admin.
- **PRE-02:** The booking does not currently have an active verification session.

**Post-conditions:**
- **POST-01:** A new verification session is created with the status "Pending".

**Normal Flow (Luồng sự kiện chính):**
**A. Create Verification Session**
1. The user accesses the Verification Detail page for a booking without a session.
2. The system displays the empty state with the "Tạo phiên khảo sát" button.
3. The user clicks "Tạo phiên khảo sát".
4. The system processes the request to create a new session.
5. The system refreshes the detail page to display the newly created Verification session in "Pending" status.

**Alternative Flows (Luồng rẽ nhánh):**
N/A

**Exceptions (Ngoại lệ):**
- **EX-01:** Create Failure
  1. The system encounters an error while creating the session (e.g., database error).
  2. The system displays MSG04.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01
**Other Information:** N/A
**Assumptions:** N/A
