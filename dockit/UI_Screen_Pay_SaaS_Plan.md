### [UC-BILL-02] [Pay SaaS Plan]

**Function trigger:** The Company Admin selects the payment option for a selected SaaS plan or accesses a pending payment transaction.

**Function description:** This screen displays the order details and bank transfer information including a payment QR code for the Company Admin to complete the subscription payment.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system checks the user authentication context and role permissions. [Refer to **BR-01**, **BR-38**]
    *   The system retrieves the pending payment details and checks that the payment status is pending. [Refer to **BR-47**]
    *   The system displays the plan pricing details, bank account information, and a dynamically generated payment QR code.
    *   The Company Admin completes the bank transfer.
    *   The system verifies the payment status (automatically in the background or when the user clicks the confirmation button). [Refer to **BR-48**]
    *   Upon successful payment verification, the system redirects the user to the Payment Success page displaying the transaction confirmation details.

*   **Abnormal execution case:**
    *   If the transaction has already been completed or canceled, the system redirects the user to the Billing page. [Refer to **BR-47**]
    *   If the Company Admin confirms payment but the system has not received the transfer, the system displays an error message. [Refer to **MSG116**]
    *   If an API or network error occurs during verification, the system displays an error toast. [Refer to **MSG117**]
