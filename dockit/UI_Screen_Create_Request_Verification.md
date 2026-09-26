### 4.1.3 Create Request Verification

**Function trigger:** The Company Admin clicks "+ Tạo khảo sát" on the Request Detail page header, or clicks "Tạo phiên khảo sát" on the empty state card.

**Function description:** This screen action initializes a new site verification session for a customer request, transitioning the status to pending verification and updating the trigger button to "Xem khảo sát".

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The user clicks "+ Tạo khảo sát" on the Request Detail header or "Tạo phiên khảo sát" on the empty state card.
    *   The system initializes a verification session with status `pending`.
    *   The system updates the header trigger button to "Xem khảo sát" and opens the verification detail page.

*   **Abnormal execution case:**
    *   If creation fails, the system displays an error message: "Không thể tạo phiên khảo sát."


