# Use Case Specification: View Review List (Company)

**UC ID and Name:** UC-REV-01 - View Review List (Company)
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Company Admin
**Secondary Actors:** None

**Trigger:**
The Company Admin selects the "Đánh giá dịch vụ" (Service Reviews) menu option or accesses the `/list-reviews` page.

**Description:**
The Company Admin views customer service reviews and ratings for their company, inspecting average star ratings, star rating breakdown statistics (1 to 5 stars), search keywords, star filters, and review feedback entries.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Company Admin role permissions and an active account status.
- **PRE-02:** The user account is associated with an active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the average company rating, rating distribution breakdown, and paginated customer review list.
- **POST-02:** If retrieval fails, the system displays an error notice and no review list is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Customer Review List Successfully**

1. The Company Admin accesses the Review List page (`/list-reviews`).
2. The system verifies Company Admin authentication, role permissions, and active company context.
3. The system retrieves average company rating scores, star distribution percentages (1-5 stars), and paginated customer review records.
4. The system renders the review dashboard displaying overall rating metrics, star breakdown progress bars, search bar, star rating filter buttons, review entries table, and pagination controls.
5. The Company Admin inspects customer feedback comments and rating breakdown.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Filter reviews by star rating**
1. The Company Admin selects a star filter option (Tất cả, 5 sao, 4 sao, 3 sao, 2 sao, 1 sao).
2. The system filters and renders customer reviews matching the selected star score.

**A.4b Search reviews by customer name, email, or comment**
1. The Company Admin enters a keyword in the search bar.
2. The system filters customer reviews matching the keyword.

**A.4c Navigate table pagination**
1. The Company Admin clicks Previous or Next page navigation buttons.
2. The system retrieves and displays review records for the selected page index.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during review retrieval
  1. An API error occurs while fetching review summaries or review list records.
  2. The system displays an error message ("Không thể tải danh sách đánh giá").
  3. The use case ends.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
