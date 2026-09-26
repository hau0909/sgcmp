# Use Case Specification: View Request Detail

**UC ID and Name:** UC-REQ-02 - View Request Detail
**Created By:** Haund
**Date Created:** 15/06/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin clicks on a request code (Mã YC) or "Xem chi tiết" from the request list page.

**Description:**
The Company Admin views the detailed information of a specific security service booking request, and is able to send a quotation price or reject the request.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system.
- **PRE-02:** The user is associated with a valid company profile. [Refer to **BR-01**]
- **PRE-03:** The booking request belongs to the user's company. [Refer to **BR-14**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the request details and updates the status upon user actions (quoted or rejected).
- **POST-02:** If the use case fails, the system displays an appropriate error message and no request data is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Request Detail Successfully**

1. The Company Admin accesses the booking request detail page.
2. The system displays a loading indicator while retrieving data. [Refer to **MSG19**]
3. The system retrieves and displays the detailed request information including: customer information, service specifications, and request status.
4. The Company Admin views the request details.

**Alternative Flows (Luồng rẽ nhánh):**

**A.3a Send quotation for request**
1. The Company Admin inputs the price and details in the quotation panel.
2. The Company Admin submits the quotation.
3. The system updates the request status to "Đã báo giá" and displays a success toast. [Refer to **MSG21**]

**A.3b Reject booking request**
1. The Company Admin clicks the reject button in the quotation panel.
2. The system updates the request status to "Từ chối" and displays a success toast. [Refer to **MSG22**]

**Exceptions (Ngoại lệ):**

- **EX-01:** Request not found
  1. The system displays an error message: "Không tìm thấy thông tin yêu cầu đặt lịch." [Refer to **MSG20**]
  2. The system provides a button to return to the request list.

- **EX-02:** Server or network connection failure during data retrieval
  1. The system displays a system error message. [Refer to **MSG04**]
  2. The system provides a button to return to the request list.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-14
**Other Information:** N/A
**Assumptions:** N/A
