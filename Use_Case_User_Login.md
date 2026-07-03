# Use Case Specification: User Login

**UC ID and Name:** UC-AUTH-01 - User Login
**Created By:** Antigravity
**Date Created:** 01/07/2026
**Primary Actor:** Guest (Unauthenticated User)
**Secondary Actors:** None

**Trigger:**
The user navigates to the login page or is redirected there, inputs their login credentials, and submits the form by clicking the "Login" button.

**Description:**
Enables users (including Customers, Company Admins, Admins, Guards, and Coordinators) to log into the system using their registered email and password to access protected resources and features.

**Preconditions:**

- **PRE-01:** The user has a registered account in the system database.
- **PRE-02:** The system has an active connection to the internet and the authentication database.

**Post-conditions:**

- **POST-01:** Upon successful authentication, the system starts a user session and redirects the user to their role-specific landing page or dashboard.
- **POST-02:** Upon failed authentication, the user remains unauthenticated on the login page with a relevant error message displayed, and no session is created.

**Normal Flow:**
**A. User Logs In Successfully**

1. The Guest accesses the login interface.
2. The system displays fields for email address and password inputs.
3. The Guest enters their email address and password.
4. The Guest submits the form.
5. The system performs initial validation on the format and presence of the email and password fields.
6. The system transmits the credentials to the backend service.
7. The system backend validates the format of the incoming request.
8. The system checks the credentials against the authentication store to verify match.
9. The system verifies that the account's email address has been confirmed. [Refer to **BR-05**]
10. The system retrieves the user's profile information and determines their role.
11. The system creates an active session and stores the authorization credentials locally.
12. The system displays a success message: "Đăng nhập thành công. Đang chuyển hướng...". [Refer to **MSG13**]
13. The system redirects the authenticated user to the appropriate landing page based on their profile role. [Refer to **BR-06**]

**Alternative Flows:**

**A.5 Invalid or empty input fields**
1. If the email field is left blank, the system displays: "Vui lòng nhập email". [Refer to **MSG06**]
2. If the email format is invalid, the system displays: "Email không hợp lệ". [Refer to **MSG07**]
3. If the password field is left blank, the system displays: "Vui lòng nhập mật khẩu". [Refer to **MSG08**]
4. If the password is shorter than 6 characters, the system displays: "Mật khẩu phải có ít nhất 6 ký tự". [Refer to **MSG09**]
5. The system prevents form submission until validation issues are resolved.

**A.8 Credentials do not match**
1. The backend authentication check fails due to incorrect email or password.
2. The system displays the error message: "Email hoặc mật khẩu không đúng". [Refer to **MSG10**]
3. The system returns to step A.2.

**A.9 Email is not verified**
1. The backend system identifies that the user's email has not been confirmed.
2. The system signs out the user session immediately.
3. The system displays the error message: "Email chưa được xác thực. Vui lòng kiểm tra email.". [Refer to **MSG11**]
4. The system returns to step A.2.

**A.10 Account role not found**
1. The system retrieves the user profile but fails to identify an associated system role.
2. The system displays the error message: "Không tìm thấy vai trò của tài khoản". [Refer to **MSG12**]
3. The system returns to step A.2.

**Exceptions:**

- **EX-01:** Server, database, or API network error
  1. The system encounters an unexpected connection error during authentication or profile retrieval.
  2. The system displays a system error message: "Đã xảy ra lỗi hệ thống, vui lòng thử lại sau.". [Refer to **MSG04**]

**Priority:** High
**Frequency of Use:** High
**Business Rules:** BR-01, BR-05, BR-06
**Other Information:** N/A
**Assumptions:** N/A
