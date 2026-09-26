# Use Case Specification: View Booking Detail (Coordinator)

**UC ID and Name:** UC-SCHED-02 - View Booking Detail (Coordinator)
**Created By:** Haund
**Date Created:** 15/06/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator clicks on a booking code or "Xem chi tiết" link on the booking list page.

**Description:**
The Coordinator views the full details of a specific approved booking request to inspect service specifications, customer details, and linked contract info.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system.
- **PRE-02:** The user is associated with a valid company profile. [Refer to **BR-01**]
- **PRE-03:** The user has Coordinator permissions, and the booking belongs to their company and has an active contract status. [Refer to **BR-15**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the full details of the booking in a full-width layout.
- **POST-02:** If the use case fails, the system displays an appropriate error message and no booking details are shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Booking Detail Successfully**

1. The Coordinator accesses the booking detail page.
2. The system displays a loading indicator while retrieving data. [Refer to **MSG19**]
3. The system verifies the active company context and role permissions. [Refer to **BR-01**, **BR-15**]
4. The system retrieves and displays the detailed booking information including: customer information, service specifications, and linked contract details in a full-width layout.
5. The Coordinator views the booking details.

**Exceptions (Ngoại lệ):**

- **EX-01:** Booking not found
  1. The system displays an error message: "Không tìm thấy thông tin yêu cầu đặt lịch." [Refer to **MSG20**]
  2. The system provides a button to return to the booking list.

- **EX-02:** Server or network connection failure during data retrieval
  1. The system displays a system error message. [Refer to **MSG04**]
  2. The system provides a button to return to the booking list.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-15
**Other Information:** N/A
**Assumptions:** N/A
