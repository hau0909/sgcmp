# Use Case Specification: View Work Shift Detail (Guard)

**UC ID and Name:** UC-SHIFT-03 - View Work Shift Detail (Guard)
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Guard
**Secondary Actors:** None

**Trigger:**
The Guard selects a specific assigned work shift card from the guard shift schedule page or navigates directly to the shift details view.

**Description:**
The Guard views the detailed information of an assigned work shift, including shift timing, target work location and address, assigned Coordinator details, check-in photo proof (if available), co-assigned security guard team members, and the action trigger to perform check-in.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system as a Security Guard with an active account status.
- **PRE-02:** The Guard has been explicitly assigned to the target work shift or designated as a replacement guard.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the comprehensive details of the selected work shift and co-assigned roster.
- **POST-02:** If the use case fails, the system displays an appropriate error message and prevents access to the shift details.

**Normal Flow (Luồng sự kiện chính):**
**A. View Work Shift Detail Successfully**

1. The Guard initiates access to a specific work shift detail view.
2. The system displays a loading indicator while fetching the shift details.
3. The system validates the Guard's authentication, role permissions, and verifies that the Guard is explicitly assigned to the requested work shift.
4. The system retrieves and displays the shift details, including shift info (name, status, date/time, location address, assigning Coordinator), check-in photo proof preview, co-assigned guard roster, and the check-in action button.
5. The Guard inspects the displayed shift information and team assignment roster.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Access check-in interface**
1. The Guard clicks the "Thực hiện Check-in" button.
2. The system redirects the Guard to the shift check-in camera validation page for the active shift date.

**A.4b Return to previous schedule view**
1. The Guard clicks the back navigation arrow button in the header.
2. The system returns the Guard to the previous guard schedule list page.

**A.4c View replacement guard details**
1. The Guard views a co-assigned team member who is designated as a replacement guard.
2. The system displays a distinct replacement tag indicating the replaced guard's name.

**Exceptions (Ngoại lệ):**

- **EX-01:** Unauthorized access attempt for unassigned shift
  1. The system detects that the logged-in Guard is not assigned to the requested shift.
  2. The system blocks access and displays an unauthorized error message.
  3. The use case ends and the Guard is redirected back to the schedule page.

- **EX-02:** Invalid or missing shift ID
  1. The system identifies that the provided shift ID parameter is missing or invalid.
  2. The system displays an error message.
  3. The use case ends.

- **EX-03:** Server or network error during shift detail retrieval
  1. The system fails to fetch shift details due to a network connection timeout or API server exception.
  2. The system displays a technical error message.
  3. The loading indicator is cleared and an error state is displayed.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-41
**Other Information:** N/A
**Assumptions:** N/A
