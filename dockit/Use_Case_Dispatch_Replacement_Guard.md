# Use Case Specification: Dispatch Replacement Guard

**UC ID and Name:** UC-SHIFT-06 - Dispatch Replacement Guard
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator clicks the "Điều động bảo vệ thay thế" (Dispatch Replacement Guard) button in the Shift Detail Modal for a shift containing an absent or late guard slot.

**Description:**
The Coordinator dispatches an eligible standby or replacement security guard to cover an absent or late guard slot on an active work shift.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The target work shift has at least one guard slot marked as absent or late requiring replacement.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system assigns the replacement guard to the target shift slot, updates shift staffing indicators, displays a success notification, and refreshes the schedule.
- **POST-02:** If dispatch fails or no selection is made, the system displays an error notice and no replacement assignment is saved.

**Normal Flow (Luồng sự kiện chính):**
**A. Dispatch Replacement Guard Successfully**

1. The Coordinator opens the Shift Detail Modal for an active work shift with absent or late guard slots.
2. The Coordinator clicks "Điều động bảo vệ thay thế" (or selects an absent slot).
3. The system slides open the Dispatch Replacement Panel and fetches available replacement candidates.
4. The system displays candidate guards categorized into "Bảo vệ thuộc hợp đồng" (Guards in contract) and "Bảo vệ khả dụng khác" (Other available guards), automatically filtering out guards with schedule conflicts or inactive status.
5. The Coordinator selects the target absent slot and chooses an eligible replacement candidate from the list.
6. The Coordinator clicks "Xác nhận điều động" (Confirm Dispatch).
7. The system submits the emergency dispatch request, displays a success toast notification ("Điều động bảo vệ thay thế thành công"), closes the dispatch panel, and updates the shift roster.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Search replacement candidate by name or phone number**
1. The Coordinator enters a search term in the candidate search input.
2. The system filters candidate guards in real-time matching the name or phone number query.
3. The use case continues from step A.5 of the Normal Flow.

**A.5a Change or toggle selected replacement candidate**
1. The Coordinator re-selects a candidate to toggle selection or switch to another available candidate prior to submission.
2. The system updates the selected slot indicator and returns to step A.5 of the Normal Flow.

**Exceptions (Ngoại lệ):**

- **EX-01:** Dispatch blocked for ended or completed shift
  1. The Coordinator views shift details for a shift that has ended or is marked as completed.
  2. The system disables the replacement dispatch feature with a notice ("Ca làm việc đã kết thúc, không thể điều động thay thế").
  3. The use case ends.

- **EX-02:** No available replacement candidates exist
  1. The system detects that all guards are currently assigned or unavailable during the shift time slot.
  2. The system displays an empty state notice ("Không có bảo vệ nào khả dụng trong khung giờ này. Vui lòng kiểm tra lại lịch phân công").
  3. The use case ends.

- **EX-03:** Server or network API failure during dispatch submission
  1. The dispatch API call fails due to a network connection error or server exception.
  2. The system displays an error notice ("Cập nhật bảo vệ thay thế thất bại") and keeps the panel open so the Coordinator can retry.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-01, BR-08, BR-22, BR-32, BR-35, BR-39, BR-40
**Other Information:** N/A
**Assumptions:** N/A
