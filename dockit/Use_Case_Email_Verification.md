# Use Case Specification: Email Verification

**UC ID and Name:** UC-AUTH-03 - Email Verification
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Unverified User / Guest
**Secondary Actors:** None

**Trigger:**
The user opens a verification link received in their email inbox.

**Description:**
This use case allows an unverified user to confirm their email address ownership using a secure verification token link sent upon account registration. Upon successful verification, the system marks the email address as verified, updates authentication session state, and redirects the user to their appropriate role-based page.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The system has an active internet connection.
- **PRE-02:** The user has an existing account registered in the system.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The user's email address is successfully confirmed as verified, session authentication state is updated, and the user is redirected to their destination page (BR-08).
- **POST-02:** If verification fails, the email address remains unverified and the system displays an appropriate error notification.

**Normal Flow (Luồng sự kiện chính):**
**A. Verify Email Successfully**

1. The user clicks on the secure verification link received in their email inbox.
2. The system accesses the verification page and validates the verification security token.
3. The system confirms email ownership, marks the user's email address as verified, and displays a success notification.
4. The system updates the user session state and automatically redirects the user to their role-specific dashboard or landing page.

**Alternative Flows (Luồng rẽ nhánh):**

**A.5.1 Verification Link Expired**
1. The user clicks a verification link whose security token has exceeded its expiration duration.
2. The system fails token validation and displays an error message informing the user that the link has expired.

**A.5.2 Verification Link Invalid or Corrupted**
1. The user clicks an invalid, corrupted, or tampered verification link.
2. The system rejects token validation and displays an error message indicating an invalid verification link.

**Exceptions (Ngoại lệ):**

- **EX-01: System Network Exception**
  1. The system encounters a network connection error, database failure, or server timeout during token verification processing.
  2. The system displays a general connection error notification.
  3. The user remains on the verification page.

**Priority:** High
**Frequency of Use:** Medium
**Business Rules:** BR-03, BR-08
**Other Information:** N/A
**Assumptions:** N/A
