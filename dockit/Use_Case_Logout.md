# Use Case Specification: Logout

**UC ID and Name:** UC-AUTH-04 - Logout
**Created By:** Tran Thanh Lam
**Date Created:** 31/07/2026
**Primary Actor:** Authenticated User (Customer, Company Admin, Coordinator, Security Guard, System Admin)
**Secondary Actors:** None

**Trigger:**
The authenticated user clicks on the "Logout" button in the user profile menu or system navigation bar.

**Description:**
This use case allows an authenticated user to safely log out of the system. Upon initiating logout, the system terminates the user's active authentication session, purges stored session tokens and credentials, revokes access privileges, and redirects the user to the login page.

**Preconditions (Điều kiện tiên quyết):**

- **PRE-01:** The system has an active internet connection.
- **PRE-02:** The user is currently logged into the system with an active authentication session.

**Post-conditions (Hậu điều kiện):**

- **POST-01:** The user authentication session is terminated, local session tokens are purged, access to protected system features is revoked, and the user is redirected to the login page (BR-01).
- **POST-02:** If the user session has already expired, access to protected system features remains revoked and the user is redirected to the login page.

**Normal Flow (Luồng sự kiện chính):**
**A. Logout Successfully**

1. The user clicks on their user profile avatar or navigation menu.
2. The user clicks the "Logout" button.
3. The system invalidates the user's active authentication session and purges local storage authentication tokens.
4. The system displays a logout success notification message.
5. The system redirects the user to the system login page.

**Alternative Flows (Luồng rẽ nhánh):**

**A.5.1 Session Expired Automatic Logout**
1. The user's active authentication session token expires due to inactivity or token expiration duration.
2. The system detects the expired session token when an action is performed, purges stored session credentials, and displays a session expired notification.
3. The system automatically redirects the user to the login page.

**A.5.2 Direct Protected Route Access Attempt After Logout**
1. A logged-out user attempts to navigate directly to a protected system page URL via the browser address bar.
2. The system route middleware intercepts the request, verifies that no valid active authentication session exists, and blocks access (BR-01).
3. The system automatically redirects the user back to the login page.

**Exceptions (Ngoại lệ):**

- **EX-01: System Network Exception**
  1. The system encounters a server network failure or connection timeout while processing the session logout request.
  2. The system clears local client session tokens and forces redirection to the login page.

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01
**Other Information:** N/A
**Assumptions:** N/A
