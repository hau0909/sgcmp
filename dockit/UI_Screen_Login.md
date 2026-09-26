### [UC-AUTH-02] [Login]

**Function trigger:** The user accesses the login page or clicks the "Sign In" button on the system navigation header.

**Function description:** This screen allows a registered user to input their email address and password to authenticate into the system. Upon submitting valid credentials, the system verifies account status and role permissions, initializes the user session, displays a success notification, and redirects the user to their role-specific dashboard.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The user accesses the login page.
    *   The user inputs their registered Email Address into the "Email Address" field.
    *   The user inputs their Password into the "Password" field.
    *   (Optional) The user checks the "Remember me" checkbox to retain session credentials.
    *   The user clicks the "Sign In" button.
    *   The system displays a loading state during authentication processing. [Refer to **MSG55**]
    *   The system validates input data, verifies credentials, and checks that the user account status is active. [Refer to **BR-08**]
    *   The system initializes the user authentication session and displays a success notification: "Đăng nhập thành công. Đang chuyển hướng..." [Refer to **MSG56**]
    *   The system redirects the user to their respective role-specific dashboard or home page based on their authorized role permissions. [Refer to **BR-01**]

*   **Abnormal execution case:**
    *   If mandatory fields are left blank upon clicking "Sign In", the system displays inline error messages under the respective missing fields:
        *   Email Address blank: "Vui lòng nhập email" [Refer to **MSG39**]
        *   Password blank: "Vui lòng nhập mật khẩu" [Refer to **MSG46**]
    *   If the user enters an invalid email format, the system displays an inline validation error: "Email không đúng định dạng" [Refer to **MSG40**].
    *   If the user enters an incorrect email address or password, the system displays an error banner: "Email hoặc mật khẩu không đúng" [Refer to **MSG52**].
    *   If the user attempts to log in with an unverified email account, the system displays an error alert: "Email chưa được xác thực. Vui lòng kiểm tra email" [Refer to **MSG53**].
    *   If the user attempts to log in with a suspended, blocked, or inactive account status, the system denies access and displays a toast error message: "Tài khoản của bạn đã bị khóa hoặc ngừng hoạt động." [Refer to **BR-08**, **MSG57**].
    *   If a server connection timeout or network exception occurs, the system displays a general exception notification [Refer to **MSG04**].
