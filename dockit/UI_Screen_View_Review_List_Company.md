### [UC-REV-01] [View Review List (Company)]

**Function trigger:** The Company Admin clicks the "Đánh giá dịch vụ" menu item or accesses the `/list-reviews` page.

**Function description:** This screen allows the Company Admin to monitor customer ratings and reviews, inspect average star ratings, view star breakdown distribution bars (1 to 5 stars), search reviews by keyword, filter by star count, and navigate review list pages.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The system verifies the Company Admin's role permissions and active company context.
    *   The screen layout displays:
        *   **Header Section:** Title "Danh sách đánh giá dịch vụ" and page description.
        *   **Rating Overview & Distribution Card:**
            *   **Average Rating:** Numerical average rating score (e.g. 4.8/5), 5-star visual indicator, and total review count.
            *   **Star Distribution Progress Bars:** Percentage progress bars for 5-star, 4-star, 3-star, 2-star, and 1-star ratings.
        *   **Filter Toolbar:** Keyword search bar (placeholder: "Tìm kiếm theo tên khách hàng, email, nội dung đánh giá...") and star rating filter buttons ("Tất cả", "5 sao", "4 sao", "3 sao", "2 sao", "1 sao").
        *   **Reviews Table:** Columns for Khách hàng (Avatar, Name, Email), Đánh giá (Star rating), Nội dung đánh giá (Comment text), and Ngày tạo (Date).
        *   **Pagination Footer:** Displays result counter ("Hiển thị X-Y trong số Z kết quả") and Previous/Next page navigation controls.
    *   The Company Admin views customer rating metrics, filters reviews, and inspects feedback comments.

*   **Abnormal execution case:**
    *   If no reviews match the search query or star filter, the table body displays a centered empty state notice: "Chưa có đánh giá nào phù hợp."
    *   If an API or server error occurs during review data retrieval, the page clears loading skeletons and renders an error banner: "Không thể tải danh sách đánh giá".
