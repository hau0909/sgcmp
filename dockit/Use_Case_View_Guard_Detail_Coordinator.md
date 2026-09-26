# Use Case Specification: View Guard Detail

**UC ID and Name:** UC-GUARD-03 - View Guard Detail
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Coordinator
**Secondary Actors:** None

**Trigger:**
The Coordinator selects a specific security guard from the guard list page or accesses `/guards/[id]`.

**Description:**
The Coordinator views comprehensive profile details of a security guard, including personal profile, identity card (CCCD/CMND) information, staff photo, and CCCD front/back photo documents, with options to edit and update guard profile information.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The user is logged into the system with Coordinator or Company Admin role permissions and an active account status.
- **PRE-02:** The target guard belongs to the Coordinator's active security company.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the full profile and document details of the selected security guard.
- **POST-02:** If profile retrieval fails, the system displays an error notice and prevents access to profile details.

**Normal Flow (Luồng sự kiện chính):**
**A. View Guard Detail Successfully**

1. The Coordinator accesses the Guard Detail page (`/guards/[id]`).
2. The system verifies the Coordinator's authentication, role permissions, and company context.
3. The system retrieves and displays the guard profile details including personal info (Full Name, Date of Birth, Gender, Email, Phone number, Address), staff avatar image, identity info (CCCD Number, Issue Date, Issue Place), and uploaded CCCD front/back photo documents.
4. The Coordinator inspects the guard profile information and legal documents.

**Alternative Flows (Luồng rẽ nhánh):**

**A.4a Open profile edit mode**
1. The Coordinator clicks the "Chỉnh sửa" (Edit) button.
2. The system enables editable form inputs and photo re-upload dropzones.

**A.4b Return to guard list**
1. The Coordinator clicks the back navigation arrow button.
2. The system returns the Coordinator to the Guard List page (`/guards`).

**Exceptions (Ngoại lệ):**

- **EX-01:** Guard profile not found or invalid guard ID
  1. The system fails to find a matching guard record for the provided ID.
  2. The system displays an error notice ("Không tìm thấy thông tin bảo vệ").
  3. The use case ends.

- **EX-02:** Server or network API failure during profile retrieval
  1. An API error occurs while fetching guard details.
  2. The system displays an error message ("Không thể tải thông tin bảo vệ").
  3. The use case ends.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08, BR-11, BR-12, BR-22, BR-32
**Other Information:** N/A
**Assumptions:** N/A
