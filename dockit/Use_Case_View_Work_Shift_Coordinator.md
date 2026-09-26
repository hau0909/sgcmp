# Use Case Specification: View Work Shift (Coordinator)

**UC ID and Name:** UC-SHIFT-01 - View Work Shift (Coordinator)
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator navigates to the shift schedule page from the main system menu.

**Description:**
The Coordinator views the shift schedule for their company, with options to switch between daily and weekly view modes, select specific work locations/contracts, navigate through dates, inspect scheduled work shifts and guard assignments, and open options to create or view shift details.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with an active account status.
- **PRE-02:** The user is associated with an active security company profile.
- **PRE-03:** The user has Coordinator permissions for the company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the work shift schedule according to the selected view mode (Daily/Weekly), chosen location, and active date scope.
- **POST-02:** If the use case fails, the system displays an appropriate error message and no schedule data is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Work Shift Schedule Successfully**

1. The Coordinator accesses the shift schedule section.
2. The system fetches the list of active service contract locations for the Coordinator's company.
3. The system automatically selects the primary default contract location and the current date.
4. The system displays a loading indicator while retrieving work shift schedule data for the selected date and location.
5. The system verifies the active company context and Coordinator role permissions.
6. The system retrieves and displays the schedule view with: view mode toggle (Daily/Weekly), location selector, date navigation bar, scheduled work shift slots with assigned security guards and status tags ("Not Started", "In Progress", "Completed", "Canceled"), and the "Create Shift" action button.
7. The Coordinator views the displayed work shift schedule.

**Alternative Flows (Luồng rẽ nhánh):**

**A.5a Coordinator account not associated with a company**
1. The system cannot identify an active company profile linked to the Coordinator.
2. The system displays an error message.
3. The use case ends.

**A.5b Invalid date scope selected**
1. The system detects an invalid date format or out-of-range date parameter.
2. The system displays an error message.
3. The use case ends.

**A.6a Switch view mode (Day / Week)**
1. The Coordinator toggles between "Day" view and "Week" view modes.
2. The system retrieves and renders the shift schedule matching the chosen view mode.
3. The use case continues from step A.7 of the Normal Flow.

**A.6b Change contract location filter**
1. The Coordinator selects a different contract address from the location selector.
2. The system retrieves and displays work shifts scheduled for the selected location.
3. The use case continues from step A.7 of the Normal Flow.

**A.6c Navigate between dates**
1. The Coordinator uses the date navigation controls (previous, next, today, or date picker) to change the target date or week.
2. The system updates and displays the schedule data for the selected date scope.
3. The use case continues from step A.7 of the Normal Flow.

**A.6d No shifts scheduled for selected criteria (Empty State)**
1. The system identifies that no work shifts exist for the selected date, view mode, or location.
2. The system displays an empty schedule placeholder notice.
3. The Coordinator may adjust date or location filters and return to step A.6 of the Normal Flow.

**A.6e Access shift creation interface**
1. The Coordinator clicks the "Create Shift" button.
2. The system opens the shift creation modal.

**A.6f View shift details**
1. The Coordinator clicks on a specific work shift item in the schedule table.
2. The system displays the detailed information modal for the selected shift.

**Exceptions (Ngoại lệ):**

- **EX-01:** Technical failure while fetching contract list or shift schedule
  1. The system fails to retrieve contract locations or shift data due to a network or server error.
  2. The system displays a system error message.
  3. The loading indicator is cleared and an error state is displayed.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-22, BR-31, BR-32
**Other Information:** N/A
**Assumptions:** N/A
