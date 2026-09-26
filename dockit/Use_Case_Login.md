# Use Case Specification: Login

**UC ID and Name:** UC-AUTH-02 - Login
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** User (Guest, Customer, Company Admin, Coordinator, Security Guard, System Admin)
**Secondary Actors:** None

**Trigger:**
The user accesses the login page or clicks the "Sign In" button on the system navigation bar.

**Description:**
This use case allows a registered user to authenticate into the system by providing their registered email address and password. Upon successful authentication, the system verifies account status and role permissions, initializes the user session, and redirects the user to their role-specific dashboard or home page.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The system has an active internet connection.
- **PRE-02:** The user has an existing registered account in the system.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The user is successfully authenticated, a user session is established, and the user is redirected to their role-specific dashboard (BR-01, BR-08).
- **POST-02:** If authentication fails, no user session is created and the user remains on the login page with appropriate error messaging.

**Normal Flow (Luồng sự kiện chính):**
**A. Login Successfully**

1. The user accesses the login page.
2. The system displays the login form requesting Email Address and Password.
3. The user enters their registered Email Address and Password.
4. The user clicks the "Sign In" button.
5. The system validates the input data and verifies credentials against stored user account records.
6. The system checks that the user account status is active (BR-08).
7. The system initializes the user authentication session and displays a success notification message.
8. The system redirects the user to their respective role-specific dashboard or home page based on their role permissions (BR-01).

**Alternative Flows (Luồng rẽ nhánh):**

**A.5.1 Missing Required Fields**
1. The user leaves the Email Address, Password, or both fields blank and clicks the "Sign In" button.
2. The system displays inline validation error messages under the respective missing fields.
3. Return to step A.3.

**A.5.2 Invalid Email Format**
1. The user enters an Email Address that does not follow the standard valid email format.
2. The system displays an inline validation error message under the email field.
3. Return to step A.3.

**A.5.3 Incorrect Email or Password**
1. The user enters an Email Address or Password that does not match any registered account credentials in the system.
2. The system displays an error message indicating invalid credentials.
3. Return to step A.3.

**A.5.4 Unverified Email Account**
1. The user enters valid credentials for an account whose email address has not yet been verified.
2. The system displays an error alert indicating that email verification is required before logging in.
3. Return to step A.3.

**A.5.5 Account Suspended or Inactive**
1. The user enters valid credentials for an account that is currently suspended, blocked, or inactive.
2. The system denies login access and displays an account status error notification (BR-08).
3. Return to step A.3.

**Exceptions (Ngoại lệ):**

- **EX-01: System Network Exception**
  1. The system encounters a server connection failure, database exception, or network timeout during authentication submission.
  2. The system displays a general system exception notification.
  3. The user remains on the login page with entered credentials preserved to retry.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-08
**Other Information:** N/A
**Assumptions:** N/A
