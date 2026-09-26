### [UC-CTR-01] [Complete Contract (Customer)]

**Function trigger:** The Customer clicks the "Hoàn thành hợp đồng" (Complete Contract) button on the contract detail page.

**Function description:** This screen displays contract details for the customer and allows them to confirm contract completion once its validity period has expired.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the user authentication context and contract state. [Refer to **BR-01**, **BR-45**]
    *   If the contract status is active and the end date is today or in the past, the system displays the "Hoàn thành hợp đồng" button in the header. [Refer to **BR-45**]
    *   The Customer clicks the "Hoàn thành hợp đồng" button.
    *   The system opens a confirmation modal displaying a warning message.
    *   The Customer clicks the "Xác nhận" (Confirm) button in the modal.
    *   The system updates the contract status, closes the modal, and displays a success toast: "Hợp đồng đã được hoàn thành thành công!" [Refer to **BR-46**, **MSG114**]
    *   The system updates the UI to show the "Đã hoàn thành" status badge in the header, and displays the "Đánh giá" (Review) button.

*   **Abnormal execution case:**
    *   If the contract status is not active or the end date is in the future, the "Hoàn thành hợp đồng" button is not shown or is disabled. [Refer to **BR-45**]
    *   If the Customer clicks "Hủy bỏ" in the confirmation modal, the modal closes and the contract remains active.
    *   If a network or server error occurs during submission, the system displays an error toast message and the modal remains open for retry. [Refer to **MSG115**]
