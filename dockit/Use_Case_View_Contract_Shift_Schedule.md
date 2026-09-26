# Use Case Specification: View Contract Shift Schedule

**UC ID and Name:** UC-CUST-SHIFT-01 - View Contract Shift Schedule
**Created By:** Lam Huy Hoang
**Date Created:** 11/09/2026
**Primary Actor:** Customer
**Secondary Actors:** None

**Trigger:**
The Customer selects the "Lịch trực bảo vệ" (Guard Schedule) menu item from the navigation bar or chooses to view the shift schedule from an active contract.

**Description:**
The Customer views the weekly shift calendar of security guards assigned to their contracts, checks shift execution statuses, reviews guard profiles and check-in photos, and submits incident reports when necessary.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The Customer is logged into the system with an active account.
- **PRE-02:** The Customer has at least one active or confirmed security service contract.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the weekly shift calendar for the selected contract location and week.
- **POST-02:** If the shift data cannot be displayed, an error message is shown to the Customer.

**Normal Flow (Luồng sự kiện chính):**
**A. View Weekly Contract Shift Schedule Successfully**

1. The Customer accesses the Contract Shift Schedule page.
2. The system verifies the Customer's access permissions and active account status.
3. The system loads the Customer's contracts and pre-selects the default location and current week.
4. The system displays the 7-day schedule grid showing shift cards, scheduled times, company names, assigned guards, attendance statuses, and check-in photos.
5. The Customer reviews the weekly shift schedule.

**Alternative Flows (Luồng rẽ nhánh):**

**A.3a Select a different contract location**
1. The Customer selects another contract address from the location dropdown menu.
2. The system updates and displays the weekly shift schedule for the selected contract.
3. The flow continues from step A.4 of the Normal Flow.

**A.3b Navigate to a different week**
1. The Customer clicks the previous week, next week, or today navigation button.
2. The system updates the calendar to show shift records for the chosen week.
3. The flow continues from step A.4 of the Normal Flow.

**A.4a No shifts scheduled for the selected week**
1. The system detects that no work shifts exist for the selected contract during the chosen week.
2. The system displays an empty schedule notice ("Trống lịch" / "Không có ca trực trong ngày này").
3. The Customer can choose another week or switch to a different contract location.

**A.4b View detailed shift information and check-in photos**
1. The Customer clicks on a specific shift card.
2. The system displays the shift detail window showing assigned guard details, contact numbers, and check-in photos.

**A.4c Submit a shift incident report**
1. The Customer identifies an operational issue (such as guard absence, lateness, or improper behavior) and clicks the "Báo cáo sự cố" (Report Incident) button on the shift.
2. The system redirects the Customer to the Incident Report submission page with pre-filled contract, shift, and date information.

**Exceptions (Ngoại lệ):**

- **EX-01:** Invalid date selected
  1. The system detects an invalid date format or out-of-range date.
  2. The system displays an error message informing the Customer of the invalid date.
  3. The use case ends.

- **EX-02:** System error loading shift data
  1. The system fails to load shift data due to a server or connection problem.
  2. The system displays an error notice ("Không thể tải danh sách ca trực").
  3. The use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-22, BR-33, BR-46
**Other Information:** N/A
**Assumptions:** N/A
