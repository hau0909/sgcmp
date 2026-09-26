### [UC-AUTH-04] [Logout]

**Function trigger:** The user clicks their user avatar dropdown in the navigation header or sidebar menu and selects "Đăng xuất" (Logout).

**Function description:** This action terminates the user's active authentication session, purges local session tokens and user state from client storage, revokes access privileges, and redirects the user to the login page.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The user clicks their avatar icon in the navigation header or sidebar menu.
    *   The system opens the profile dropdown menu containing user details and the "Đăng xuất" (Logout) button.
    *   The user clicks the "Đăng xuất" button.
    *   The system invalidates the authentication session and clears all session tokens and cached user data from browser storage.
    *   The system displays a logout success notification.
    *   The system automatically redirects the user to the login page.

*   **Abnormal execution case:**
    *   If the user's session token expires due to inactivity, performing any navigation action automatically purges local credentials and redirects the user to the login page with a session expired notification.
    *   If a logged-out user attempts to access protected system routes via direct URL navigation, system route middleware intercepts the request, blocks access, and redirects to the login page. [Refer to **BR-01**]
    *   If a network exception or server error occurs during session termination, the system clears local storage tokens locally and forces redirection to the login page.
