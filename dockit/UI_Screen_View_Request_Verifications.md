### 4.1.4 View Request Verifications

**Function trigger:** The user clicks the "Verifications" navigation link on the sidebar menu.

**Function description:** This screen displays a tabular list of site verifications (khảo sát yêu cầu) for a specific company, supporting search and filtering.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup)*]

**Function Details:**

*   **Normal execution case:**
    *   The user navigates to the page.
    *   The system displays a loading spinner with the text "Đang tải danh sách khảo sát...".
    *   Once data is loaded, the system displays a header with the title "Danh sách Khảo sát Yêu cầu".
    *   The system displays a filter section containing a Search input (relative positioning, icon absolute left) and a Status dropdown (appearance-none).
    *   The system displays a data table with columns: STT, Khách hàng, Dịch vụ, Địa chỉ, Hình ảnh, Trạng thái (Chờ duyệt, Đã duyệt, Từ chối), and Hành động.
    *   The user enters text in the Search input; the system instantly filters the table rows.
    *   The user changes the Status dropdown; the system fetches the filtered data and updates the table.
    *   The user clicks the pagination buttons at the bottom to navigate through pages.
    *   The user clicks the "Xem chi tiết" button; the system redirects them to the verification details page.

*   **Abnormal execution case:**
    *   If there is no data available, the system displays an empty state with a `ClipboardCheck` icon and the text "Không có phiên khảo sát nào".
