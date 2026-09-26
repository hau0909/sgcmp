# Use Case Specification: View Guards

**UC ID and Name:** UC-GUARD-02 - View Guards
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator clicks the "Danh sách bảo vệ" option from the system navigation menu or accesses the guard management page (`/guards`).

**Description:**
The Coordinator views the list of security guards belonging to their company, including staff information, contact details, today's schedule status, and account status, with options to navigate to add a new guard or view guard details.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The Coordinator account is associated with an active security company profile.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the paginated list of company security guards.
- **POST-02:** If retrieval fails, the system displays an error message and no guard roster is shown.

**Normal Flow (Luồng sự kiện chính):**
**A. View Guard List Successfully**

1. The Coordinator accesses the Guard List page (`/guards`).
2. The system verifies the Coordinator's authentication, role permissions, and active company context.
3. The system fetches the paginated list of company guards and checks today's shift availability for each guard.
4. The system renders the guard management table showing: STT, Avatar, Full Name & Email, Gender, Phone number, Today's Schedule status tag ("Đang trực", "Phân công", "Đang rảnh", "Vắng mặt", "Đi trễ", "Thay thế"), Account Status tag ("HOẠT ĐỘNG" / "VÔ HIỆU HÓA"), and the "Chi tiết" action link.
5. The Coordinator inspects the guard roster and status indicators.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Navigate table pagination**
1. The Coordinator clicks Previous, Next, or page indicator controls.
2. The system fetches and renders the guard records for the target page index.
3. The use case continues from step A.5 of the Normal Flow.

**A.4b Access Create Guard Account page**
1. The Coordinator clicks the "Thêm bảo vệ" button.
2. The system navigates to the Create Guard Account page (`/guards/add`).

**A.4c Access Guard Detail page**
1. The Coordinator clicks the "Chi tiết" link on a specific guard row.
2. The system opens the Guard Detail page (`/guards/[id]`).

**A.4d No guards found (Empty State)**
1. The system detects that no guard records exist for the company.
2. The system displays an empty state table notice ("Chưa có nhân viên bảo vệ").
3. The use case ends.

**Exceptions (Ngoại lệ):**

- **EX-01:** Server or network API failure during guard list retrieval
  1. The API call fails to retrieve guard data due to a network connection error or server exception.
  2. The system displays an error message ("Không thể tải danh sách bảo vệ") inside the table container.
  3. The loading state is cleared and the use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
