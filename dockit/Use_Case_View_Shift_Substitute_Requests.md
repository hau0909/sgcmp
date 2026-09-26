# Use Case Specification: View Shift Substitute Requests

**UC ID and Name:** UC-SHIFT-07 - View Shift Substitute Requests
**Created By:** Tran Thanh Lam
**Date Created:** 05/09/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator accesses the shift substitute requests section in the system.

**Description:**
The Coordinator views the list of shift substitute requests submitted by security guards, including substitution reasons, requested shift details, and current status.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The Coordinator is logged into the system.
- **PRE-02:** The Coordinator account belongs to an active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the list of shift substitute requests and their current status.
- **POST-02:** If substitute requests cannot be retrieved, the system displays an error notification.

**Normal Flow (Luồng sự kiện chính):**
**A. View Shift Substitute Requests Successfully**

1. The Coordinator accesses the shift substitute requests page.
2. The system retrieves and displays the list of shift substitute requests submitted by guards in the company.
3. The Coordinator views the list of substitute requests, requested shift details, substitution reasons, and current status.

**Alternative Flows (Luồng rẽ nhánh):**

**A.2a Shift substitute requests list is empty**
1. The system detects that no shift substitute requests exist for the company.
2. The system displays an empty list placeholder notice.

**Exceptions (Ngoại lệ):**

- **EX-01:** System error
  1. An error occurs while retrieving substitute request data.
  2. The system displays an error notification.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-31
**Other Information:** N/A
**Assumptions:** N/A
