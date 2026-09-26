### 4.1.7 Approve/Reject Request Verification

**Function trigger:** The Company Admin clicks "✓ Duyệt khảo sát" or "✕ Từ chối" on a pending verification detail page.

**Function description:** This screen action allows Company Admins to review survey findings, provide feedback notes, and approve or reject the verification report via confirmation dialogs.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case (Approve):**
    *   The Admin enters optional feedback in "GHI CHÚ" and clicks "✓ Duyệt khảo sát".
    *   The system opens a confirmation modal ("Xác nhận duyệt khảo sát"). Upon user confirmation, the status updates to `ĐÃ DUYỆT`.

*   **Normal execution case (Reject):**
    *   The Admin enters mandatory feedback in "GHI CHÚ" and clicks "✕ Từ chối".
    *   The system opens a confirmation modal ("Xác nhận từ chối khảo sát"). Upon user confirmation, the status updates to `TỪ CHỐI`.

*   **Abnormal execution case:**
    *   If the Admin clicks "✕ Từ chối" without entering notes, the system displays an error: "Vui lòng điền Ghi chú khi từ chối khảo sát."


