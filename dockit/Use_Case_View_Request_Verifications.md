# Use Case Specification: View Request Verifications

**UC ID and Name:** UC-VER-02 - View Request Verifications
**Created By:** AI Assistant
**Date Created:** 21/07/2026
**Primary Actor:** Company Admin, Coordinator
**Secondary Actors:** None

**Trigger:**
The user clicks on the "Verifications" or "Khảo sát" navigation link in the sidebar menu.

**Description:**
This use case allows Company Admins and Coordinators to view, search, and filter the list of site verifications (khảo sát yêu cầu) assigned to their company.

**Preconditions:**
- **PRE-01:** The user is logged in as a Company Admin or Coordinator.

**Post-conditions:**
- **POST-01:** The system displays the paginated list of request verifications.

**Normal Flow (Luồng sự kiện chính):**
**A. View Verifications List**
1. The user accesses the Verifications page.
2. The system retrieves the list of verifications for the company.
3. The system displays the list including STT, Customer Name, Service Name, Address, Number of Images, Status, and Actions.

**Alternative Flows (Luồng rẽ nhánh):**
**A.1 Search Verifications**
1. The user enters a keyword in the Search input.
2. The system dynamically filters and displays the matching verifications.

**A.2 Filter by Status**
1. The user selects a specific status from the Status Dropdown.
2. The system retrieves and displays only verifications matching the selected status.

**A.3 Empty Data State**
1. The system detects no verifications matching the filters.
2. The system displays an empty state message with an icon.

**Exceptions (Ngoại lệ):**
- **EX-01:** Data Fetching Error
  1. The system encounters an error when retrieving the verification list.
  2. The system displays MSG04.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01
**Other Information:** N/A
**Assumptions:** N/A
