# Use Case Specification: View Work Shift (Guard)

**UC ID and Name:** UC-SHIFT-02 - View Work Shift (Guard)
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Guard
**Secondary Actors:** None

**Trigger:**
The Guard selects the work shift/schedule option from the mobile/system navigation bar or opens the guard shift page.

**Description:**
The Guard views the list of work shifts explicitly assigned to them for a selected date, including shift status tags, shift times, target locations, and post addresses, with the ability to navigate into specific shift details.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system as a Security Guard with an active account status.
- **PRE-02:** The Guard is linked to an active security company profile.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the list of assigned work shift cards for the selected date sorted chronologically by start time.
- **POST-02:** If the use case fails, the system displays an appropriate error message and no shift list is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Assigned Work Shift List Successfully**

1. The Guard accesses the work shift schedule page.
2. The system identifies the Guard's account context and selected view date (defaults to the current date).
3. The system displays a loading state while fetching assigned work shifts for the selected date.
4. The system validates the Guard's authentication, role permissions, and active status.
5. The system retrieves and displays the list of assigned shift cards for the Guard, showing shift titles, timing slots, target locations, work addresses, and status tags ("Assigned", "On Duty", "Completed", "Late", "Absent", or "Replacement").
6. The Guard views the displayed work shift list.

**Alternative Flows (Luồng rẽ nhánh):**

**A.5a Select a different date**
1. The Guard changes the active date parameter using the date navigation controls.
2. The system fetches and displays the assigned shifts for the newly selected date.
3. The use case continues from step A.6 of the Normal Flow.

**A.5b No shifts assigned for selected date (Empty State)**
1. The system identifies that no work shifts are assigned to the Guard for the selected date.
2. The system displays an empty state notice indicating no shifts are scheduled for that day.
3. The Guard may select a different date and return to step A.5 of the Normal Flow.

**A.5c View shift details**
1. The Guard selects a specific work shift card from the list.
2. The system opens the detail view page for the selected work shift.

**Exceptions (Ngoại lệ):**

- **EX-01:** Invalid date scope selected
  1. The system detects an invalid date parameter or format.
  2. The system displays an error message.
  3. The use case ends.

- **EX-02:** Technical failure during shift data retrieval
  1. The system fails to retrieve assigned shift data due to a network connection error or API server exception.
  2. The system displays a technical error message.
  3. The loading indicator is cleared and an error state is displayed.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-22, BR-41
**Other Information:** N/A
**Assumptions:** N/A
