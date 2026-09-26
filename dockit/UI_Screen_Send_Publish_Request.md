### [UC-COMP-01] [Send Publish Request]

**Function trigger:** The Company Admin clicks the "Gửi yêu cầu công khai" (Send Publish Request) button on the company profile page.

**Function description:** This screen allows the Company Admin to view their company profile status and submit a request to publish the profile.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the active company context and role permissions. [Refer to **BR-01**, **BR-38**, **BR-43**]
    *   The system displays the company profile status banner and a checklist of profile requirements. [Refer to **BR-42**]
    *   When all profile checklist items are completed, the system enables the "Gửi yêu cầu công khai" button.
    *   The Company Admin clicks the "Gửi yêu cầu công khai" button.
    *   The system opens a confirmation modal with an optional note input field.
    *   The Company Admin inputs a note (optional) and clicks the confirm button.
    *   On success, the system updates the company status to pending, closes the modal, and displays a success toast message. [Refer to **BR-44**, **MSG112**]
    *   The status banner is updated to display the pending publish status.

*   **Abnormal execution case:**
    *   If the profile checklist is incomplete, the "Gửi yêu cầu công khai" button is disabled. [Refer to **BR-42**]
    *   If a network or system error occurs during submission, the system displays an error toast message and the modal remains open. [Refer to **MSG113**]
