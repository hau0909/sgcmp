# Use Case Specification: Send Publish Request

**UC ID and Name:** UC-COMP-01 - Send Publish Request
**Created By:** Haund
**Date Created:** 14/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin clicks the "Gửi yêu cầu công khai" (Send Publish Request) button on the company profile page.

**Description:**
The Company Admin submits a request to publish their company profile. The request is only allowed if the company profile checklist is complete, and it requires administrator approval.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system. [Refer to **BR-01**]
- **PRE-02:** The user has the role of Company Admin. [Refer to **BR-38**]
- **PRE-03:** The company account is in "active" status. [Refer to **BR-43**]

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The company status transitions to `pending_publish`. [Refer to **BR-44**]
- **POST-02:** A publish request record is created in the database.
- **POST-03:** If the use case fails, the company status remains unchanged, and an appropriate error message is displayed.

**Normal Flow (Luồng sự kiện chính):**
**A. Send Publish Request Successfully**

1. The Company Admin accesses the "My Company" profile page.
2. The system checks the completeness of the company profile checklist. [Refer to **BR-42**]

3. If the profile is complete, the system enables the "Gửi yêu cầu công khai" button.
4. The Company Admin clicks the "Gửi yêu cầu công khai" button.
5. The system displays a confirmation modal with an input field for an optional message/note for the Admin.
6. The Company Admin enters an optional note and clicks "Xác nhận gửi" (Confirm Send).
7. The system creates a new publish request record, updates the company status to `pending_publish`, and displays a success toast. [Refer to **BR-44**, **MSG112**]
8. The system updates the company profile UI to show the "pending_publish" status banner.

**Alternative Flows (Luồng rẽ nhánh):**

**A.2 Profile is incomplete**
1. The system disables the "Gửi yêu cầu công khai" button.
2. The system displays a checklist indicating which profile items are missing (e.g., missing logo, banner, gallery images, or services).
3. The Company Admin must complete the profile items before they can click the button.

**A.6 Company Admin cancels request**
1. In the confirmation modal, the Company Admin clicks "Hủy" (Cancel).
2. The system closes the modal and returns the user to the profile page. No request is sent.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network connection failure during submission
  1. The system displays a system error message. [Refer to **MSG113**]
  2. The confirmation modal remains open, and the company status remains unchanged.

**Priority:** High
**Frequency of Use:** Low (Typically once per company registration cycle)
**Business Rules:** BR-01, BR-38, BR-42, BR-43, BR-44
**Other Information:** N/A
**Assumptions:** N/A
