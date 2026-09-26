# Use Case Specification: View Requests

**UC ID and Name:** UC-REQ-01 - View Requests
**Created By:** Haund
**Date Created:** 15/06/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin selects the request list/booking management option in the system navigation.

**Description:**
The Company Admin views and manages the list of security service booking requests from customers belonging to their company, with the ability to search, filter by status and date range, export report data, and navigate to request details.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system.
- **PRE-02:** The user is associated with a valid company profile. [Refer to **BR-01**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the paginated list of bookings with searching, filtering, and exporting capabilities.
- **POST-02:** If the use case fails, the system displays an appropriate error message and no booking request data is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Request List Successfully**

1. The Company Admin accesses the booking request management section.
2. The system displays a loading indicator while retrieving data. [Refer to **MSG16**]
3. The system verifies the active company context. [Refer to **BR-01**, **BR-14**]
4. The system retrieves and displays the paginated list of booking requests with columns: Checkbox, Mã YC, Khách hàng, Loại dịch vụ, Ngày gửi, Ngày thực hiện, and Trạng thái.
5. The system displays pagination controls above the table showing the current range and total number of results.
6. The Company Admin views the displayed booking request list.

**Alternative Flows (Luồng rẽ nhánh):**

**A.3 Company account not found**
1. The system cannot identify the active company context.
2. The system displays an error message. [Refer to **MSG01**]
3. The use case ends.

**A.4 No booking requests match the current criteria**
1. The system displays a notice indicating that no requests were found. [Refer to **MSG17**]
2. The Company Admin may adjust filters or search terms and return to step A.4 of the Normal Flow.

**A.6a Search requests by keyword**
1. The Company Admin enters a search keyword in the search field.
2. The system resets pagination and displays matching results.
3. The use case continues from step A.5.

**A.6b Filter requests by status**
1. The Company Admin selects a status filter (Mới, Đang xử lý, Đã báo giá, Đã duyệt, Từ chối).
2. The system resets pagination and displays matching results.
3. The use case continues from step A.5.

**A.6c Filter requests by date range**
1. The Company Admin selects a start date, an end date, or both.
2. The system resets pagination and displays matching results.
3. The use case continues from step A.5.

**A.6d Navigate between pages**
1. The Company Admin clicks the next or previous page button.
2. The system retrieves and displays the corresponding page of results.
3. The use case continues from step A.5.

**A.6e Export request data**
1. The Company Admin clicks the export button.
2. The system generates and initiates the download of the request data file.

**A.6f View request details**
1. The Company Admin clicks on a specific request code.
2. The system navigates the user to the request detail page.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network connection failure during data retrieval
  1. The system displays a system error message. [Refer to **MSG04**]
  2. The loading indicator is dismissed and no data is displayed.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-14
**Other Information:** N/A
**Assumptions:** N/A
