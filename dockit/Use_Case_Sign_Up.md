# Use Case Specification: Sign Up

**UC ID and Name:** UC-AUTH-01 - Sign Up
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Guest
**Secondary Actors:** None

**Trigger:**
The Guest clicks on the "Sign Up" button on the system navigation bar or authentication page.

**Description:**
This use case allows an unauthenticated guest user to create a new user account by providing their personal details, contact information, and account credentials. Upon successful registration, the account is created with an active status, assigned the default Customer role, and a verification email containing a secure link is dispatched to the user's email address.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The Guest is not currently logged into the system.
- **PRE-02:** The system has an active internet connection.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** A new user account is created with an active status and default Customer role (BR-08).
- **POST-02:** A verification email with a secure link is automatically sent to the registered email address.
- **POST-03:** The system displays a success notification instructing the user to check their email for account verification.
- **POST-04:** If registration fails, no user account is created and the system displays an appropriate error message.

**Normal Flow (Luồng sự kiện chính):**
**A. Sign Up Successfully**

1. The Guest accesses the account registration page.
2. The system displays the registration form requesting Full Name, Email Address, Phone Number, Password, and Confirm Password.
3. The Guest enters their Full Name, Email Address, Phone Number, Password, and Confirm Password.
4. The Guest clicks the "Register" button.
5. The system validates the entered input data against system business rules.
6. The system creates the new user account with an initial status of active and assigns the default Customer role (BR-08).
7. The system automatically sends a verification email containing a secure activation link to the registered email address.
8. The system displays a success notification message instructing the user to check their email for account verification.
9. The system resets the registration form input fields.

**Alternative Flows (Luồng rẽ nhánh):**

**A.5.1 Missing Required Fields**
1. The Guest leaves one or more mandatory fields (Full Name, Email Address, Phone Number, Password, or Confirm Password) blank and clicks the "Register" button.
2. The system displays inline validation error messages under the missing fields.
3. Return to step A.3.

**A.5.2 Invalid Full Name Length or Format**
1. The Guest enters a Full Name that is shorter than 2 characters or contains special characters/numbers.
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.3 Invalid Email Format**
1. The Guest enters an email address that does not conform to the standard valid email format.
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.4 Disposable Email Address**
1. The Guest enters a temporary or disposable email address (BR-02).
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.5 Invalid Phone Number Format**
1. The Guest enters a phone number that does not start with 0 or +84 or does not contain 10 to 11 numeric digits.
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.6 Password Complexity Check Failed**
1. The Guest enters a password that is less than 8 characters long or does not contain at least one uppercase letter, one lowercase letter, and one numeric digit.
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.7 Confirm Password Mismatch**
1. The Guest enters a password confirmation value that does not match the entered password.
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.8 Duplicate Email Address**
1. The Guest enters an email address that is already registered in the system (BR-03).
2. The system displays an inline validation error message.
3. Return to step A.3.

**A.5.9 Duplicate Phone Number**
1. The Guest enters a phone number that is already registered in the system (BR-04).
2. The system displays an inline validation error message.
3. Return to step A.3.

**Exceptions (Ngoại lệ):**

- **EX-01: Account Registration Failure**
  1. The system encounters an unexpected failure while attempting to create the user account or send the verification email.
  2. The system displays a toast error message indicating registration failure.
  3. The Guest remains on the registration page with their entered inputs preserved to retry.

- **EX-02: System Network Exception**
  1. The system loses network connection or encounters a server timeout during submission.
  2. The system displays a general system exception notification.
  3. The Guest remains on the registration page.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-02, BR-03, BR-04, BR-08
**Other Information:** N/A
**Assumptions:** N/A
