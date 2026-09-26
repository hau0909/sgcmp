# Use Case Specification: Create Work Shift

**UC ID and Name:** UC-65 - Create Work Shift  
**Created By:** Tran Thanh Lam  
**Date Created:** 29/06/2026  
**Primary Actor:** Coordinator  
**Secondary Actors:** None  

**Trigger:**  
The Coordinator clicks the "Thêm ca trực" (Add Shift) button on the shift schedule page.

**Description:**  
The Coordinator configures and creates new work shifts for an active contract, including selecting the contract, setting up the shift generation cycle, customizing shift locations, splitting booking slots exceeding 8 hours into contiguous segments, and assigning eligible active security guards without schedule conflicts.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The company has active service contracts with defined guard slot requirements and working schedules.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system saves the newly generated work shifts for the cycle, assigns the selected guards, displays a success notification, closes the modal, and refreshes the schedule grid.
- **POST-02:** If shift creation fails, the system displays an error notification, retains the entered configuration for user correction, and saves no shifts.

**Normal Flow (Luồng sự kiện chính):**  
**A. Create Work Shift Successfully**

1. The Coordinator clicks the button to open the "Create Work Shift" modal.
2. The system retrieves and displays the list of active service contracts belonging to the company.
3. The Coordinator selects a contract from the contract list.
4. The system displays contract details, including location, contract validity period, working days per week, required guards per shift slot, shift scheduling progress, and predefined booking time slots.
5. The Coordinator configures the shift schedule by selecting the generation cycle (weeks, months, or years), reviewing contract booking time slots (splitting any slot exceeding 8 hours into contiguous segments ≤ 8 hours), and optionally customizing the shift name and location.
6. The Coordinator assigns guards to each shift slot or split segment from the "Guards in contract" or "Other guards" sections.
7. The system automatically validates guard eligibility: confirms that guard profiles are approved and active, verifies there are no overlapping shifts, flags overtime warnings if daily hours exceed 8 hours or weekly hours exceed 48 hours, and enforces the daily maximum limit of 12 working hours.
8. The Coordinator clicks the "Lưu & Tạo ca" (Save & Create Shift) button.
9. The system validates all form data, generates the work shifts across the selected cycle with the assigned guards, displays a success notification, closes the modal, and refreshes the schedule page.

**Alternative Flows (Luồng rẽ nhánh):**

**A.3a Missing required configuration fields**
1. The Coordinator leaves required information uncompleted (such as unselected contract, missing shift name, empty location, or unfulfilled guard quotas).
2. The system displays validation reminders and keeps the submission button disabled.
3. The Coordinator fills in all missing information and proceeds to step A.8.

**A.5a Generation cycle reaches or exceeds contract end date**
1. The configured generation cycle extends beyond the contract end date.
2. The system displays a warning notification indicating that the cycle exceeds the contract end date and automatically caps shift generation to the contract expiration date.
3. If all working days of the contract have already been fully scheduled, the system displays a completion notice and disables further creation.

**A.5b Shift slot exceeds standard 8-hour limit**
1. A booking slot from the contract exceeds the standard 8-hour shift duration.
2. The system marks the slot as needing adjustment and displays a warning prompt: "Cảnh báo: Ca trực gốc vượt quá 8 tiếng. Vui lòng điều chỉnh thời gian và bấm nút + để tách thành các ca nhỏ ≤ 8 tiếng."
3. The submission button remains disabled until the multi-hour slot is split into contiguous segments of 8 hours or less.

**A.5c Split booking time slot**
1. The Coordinator splits an extended booking slot into smaller contiguous shift segments.
2. The Coordinator adjusts the start and end times of each segment so that segments are continuous, non-overlapping, and their total duration equals the original slot duration.
3. The system confirms the split configuration is valid and transitions to step A.6 to assign guards to each segment.

**A.6a Guard quota mismatch**
1. The Coordinator selects fewer or more guards than the quota required for the shift slot.
2. The system flags the slot as needing adjustment and displays the selected count versus the required quota.
3. The submission button remains disabled until all slots and segments have the exact required number of assigned guards.

**A.7a Guard schedule conflict or daily limit exceeded**
1. The Coordinator selects a guard who is already assigned to another shift during the same time interval or whose assigned time reaches the 12-hour daily maximum limit.
2. The system flags the guard with a conflict indicator, displays the specific reason, and disables selection for that guard.
3. The Coordinator selects an alternative eligible guard without schedule conflicts.

**Exceptions (Ngoại lệ):**

- **EX-01: System or connection failure during shift creation**
  1. The shift creation request encounters a network connection error or server processing failure.
  2. The system displays an error notification: "Tạo ca trực thất bại".
  3. The modal remains open with all configured settings preserved so that the Coordinator can verify and retry.

**Priority:** High  
**Frequency of Use:** High  
**Business Rules:** BR-01, BR-07, BR-08, BR-22, BR-32, BR-33, BR-34, BR-35, BR-36, BR-37, BR-38  
**Other Information:** N/A  
**Assumptions:** N/A
