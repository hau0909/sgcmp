### [1.3.0] Delete Bank Account

**Function trigger:** The Admin clicks the "Xóa" (Delete) button, represented by a Trash icon, located in the footer of a bank account card.

**Function description:** This modal screen is a safeguard to confirm the deletion of a bank account. It displays the specific account number and bank name to ensure the user is deleting the correct record. It also includes dynamic logic to display a high-visibility warning if the account being deleted is the currently active one, alerting the admin to the consequences on the payment system.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The user clicks the delete button, and the modal dialog opens.
    *   The system displays the confirmation message with the target account's details formatted in bold.
    *   If the target account is active, an amber warning banner is rendered inside the modal body.
    *   The user clicks the red "Xóa tài khoản" button.
    *   The system displays a loading spinner on the button, disables both buttons to prevent double-clicking, processes the deletion via API, closes the modal upon success, and refreshes the parent page's list.

*   **Abnormal execution case:**
    *   If the user clicks "Hủy" (Cancel), the modal closes, and no action is taken.
    *   If the API deletion request fails (e.g., server error or foreign key constraint), the system closes the modal dialog and injects a red error banner at the top of the main Bank Accounts page containing the error message (e.g., "Không thể xóa tài khoản.").
