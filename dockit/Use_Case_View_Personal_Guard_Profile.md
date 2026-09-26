# Use Case Specification: View Personal Guard Profile

**UC ID and Name:** UC-GUARD-06 - View Personal Guard Profile
**Created By:** Tran Thanh Lam
**Date Created:** 05/09/2026
**Primary Actor:** Guard
**Secondary Actors:** None

**Trigger:**
The Guard accesses the personal profile module in the system.

**Description:**
The Guard views their personal profile information, including account details, personal information, identity card (CCCD/CMND) records, physical attributes, professional skills, health certificate, skill certificates, and profile approval status.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The Guard is logged into the system with an active account status.
- **PRE-02:** The Guard has permission to access the personal profile module.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The system displays the Guard's personal profile information, attached certificates, and current approval status.
- **POST-02:** If profile details cannot be loaded, the system displays an error notification.

**Normal Flow (Luồng sự kiện chính):**
**A. View Personal Guard Profile Successfully**

1. The Guard accesses the personal profile page.
2. The system retrieves and displays the Guard's personal profile information, identity card records, physical attributes, professional skills, health certificate, skill certificates, and current approval status.
3. The Guard views their profile information and attached document certificates.

**Alternative Flows (Luồng rẽ nhánh):**

**A.2a Profile status is Pending Review, Approved, or Rejected**
1. The system detects the Guard's profile approval status.
2. The system displays the corresponding status badge (amber for Pending Review, green for Approved, or red for Rejected with Coordinator notes).
3. The Guard views the profile status and notes.

**Exceptions (Ngoại lệ):**

- **EX-01:** System error during data retrieval
  1. An error occurs while fetching profile details from the system (MSG64, MSG04).
  2. The system displays an error notification banner.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08
**Other Information:** N/A
**Assumptions:** N/A
