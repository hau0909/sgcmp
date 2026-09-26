### [UC-SRM-03] [Confirm/Deny Quotation (Customer)]

**Function trigger:** The Customer clicks "Đồng ý báo giá" or "Từ chối báo giá" on the Request Detail page (`/my-requests/[id]`).

**Function description:** This screen action allows the Customer to review the quotation provided by the security company and either accept or deny it. Accepting initializes the contract and updates the status, while denying sets the status to rejected.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The Customer clicks "Đồng ý báo giá", confirms in the modal dialog, and the system updates the status to accepted, initializes a new contract, and displays a success notification.
    *   The Customer clicks "Từ chối báo giá", confirms in the modal dialog, and the system updates the status to rejected and displays a success notification.

*   **Abnormal execution case:**
    *   If the Customer cancels the confirmation modal, the modal closes without saving changes.
    *   If a system error occurs during submission, the system displays an error notification.
