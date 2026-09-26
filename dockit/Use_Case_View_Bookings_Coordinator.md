# Use Case Specification: View Bookings (Coordinator)

**UC ID and Name:** UC-SCHED-01 - View Bookings (Coordinator)
**Created By:** Haund
**Date Created:** 15/06/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator selects the booking/scheduling option in the system navigation.

**Description:**
The Coordinator views the list of approved bookings with active contracts belonging to their company, with the ability to search by keyword, filter by date range, export report data, and navigate to booking details.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system.
- **PRE-02:** The user is associated with a valid company profile. [Refer to **BR-01**]
- **PRE-03:** The user has Coordinator permissions for the company. [Refer to **BR-15**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the paginated list of active bookings with searching, filtering, and exporting capabilities.
- **POST-02:** If the use case fails, the system displays an appropriate error message and no booking data is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Booking List Successfully**

1. The Coordinator accesses the booking management section.
2. The system displays a loading indicator while retrieving data. [Refer to **MSG23**]
3. The system verifies the active company context and role permissions. [Refer to **BR-01**, **BR-15**]
4. The system retrieves and displays the paginated list of bookings (specifically accepted bookings with active contracts) with: STT, Booking Code, Customer name, Service name, Guard quantity, Date range, and Status (always "Đã duyệt").
5. The system displays pagination controls.
6. The Coordinator views the displayed booking list.

**Alternative Flows (Luồng rẽ nhánh):**

**A.3 Company account not found**
1. The system cannot identify the active company context.
2. The system displays an error message. [Refer to **MSG01**]
3. The use case ends.

**A.4 No bookings match the current criteria**
1. The system displays a notice indicating that no bookings were found. [Refer to **MSG17**]
2. The Coordinator may adjust filters or search terms and return to step A.4 of the Normal Flow.

**A.6a Search bookings by keyword**
1. The Coordinator enters a search keyword (customer name, service name, or address) in the search field.
2. The system resets pagination and displays matching results.
3. The use case continues from step A.5.

**A.6b Filter bookings by date range**
1. The Coordinator selects a start date, an end date, or both.
2. The system resets pagination and displays matching results.
3. The use case continues from step A.5.

**A.6c Navigate between pages**
1. The Coordinator clicks the next or previous page button.
2. The system retrieves and displays the corresponding page of results.
3. The use case continues from step A.5.

**A.6d Export booking data**
1. The Coordinator clicks the export button.
2. The system generates and initiates the download of the booking data file.

**A.6e View booking details**
1. The Coordinator clicks on a specific booking code or "Xem chi tiết" link.
2. The system navigates the user to the booking detail/scheduling page.

**A.6f Attempt to create request directly**
1. The Coordinator clicks the "Tạo Yêu cầu Mới" button.
2. The system displays an alert message: "Điều phối viên không có quyền trực tiếp tạo đơn mới! Vui lòng liên hệ Admin hoặc Khách hàng." [Refer to **MSG24**]

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network connection failure during data retrieval
  1. The system displays a system error message. [Refer to **MSG04**]
  2. The loading indicator is dismissed and no data is displayed.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-15
**Other Information:** N/A
**Assumptions:** N/A
