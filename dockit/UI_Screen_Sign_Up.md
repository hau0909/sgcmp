### [UC-AUTH-01] [Sign Up]

**Function trigger:** The Guest clicks on the "Sign Up" button on the system navigation bar or authentication page.

**Function description:** This screen allows an unauthenticated guest user to create a new user account by providing their personal details, contact information, and account credentials. Upon successful registration, the system creates the new user account with an active status, assigns the default Customer role, and dispatches a verification email containing a secure link to the user's email address.

**Screen layout:**
[*(Để trống khu vực này để người dùng chèn ảnh mockup, hoặc chèn cú pháp ảnh Markdown nếu có sẵn link: `![Tên ảnh](url)`)*]

**Function Details:**

*   **Normal execution case:**
    *   The user accesses the account registration page.
    *   The user inputs their Full Name into the "Full Name" field.
    *   The user inputs their Email Address into the "Email Address" field.
    *   The user inputs their Phone Number into the "Phone Number" field.
    *   The user inputs their Password into the "Password" field.
    *   The user inputs their Password Confirmation into the "Confirm Password" field.
    *   The user clicks the "Register" button.
    *   The system validates the input data against business rules and creates the user account with an active status and assigns the default Customer role. [Refer to **BR-08**]
    *   The system automatically sends a verification email with a secure activation link to the registered email address.
    *   The system displays a success toast notification message: "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản." [Refer to **MSG50**]
    *   The system resets all registration form input fields.

*   **Abnormal execution case:**
    *   If mandatory fields are left blank upon clicking "Register", the system displays inline validation errors under the missing fields:
        *   Full Name blank: "Vui lòng nhập họ và tên" [Refer to **MSG37**]
        *   Email Address blank: "Vui lòng nhập email" [Refer to **MSG39**]
        *   Phone Number blank: "Vui lòng nhập số điện thoại" [Refer to **MSG42**]
        *   Password blank: "Vui lòng nhập mật khẩu" [Refer to **MSG46**]
        *   Confirm Password blank: "Vui lòng xác nhận mật khẩu" [Refer to **MSG48**]
    *   If the user enters a Full Name shorter than 2 characters or containing invalid characters, the system displays an inline validation error: "Họ và tên phải có ít nhất 2 ký tự" [Refer to **MSG38**] or "Họ và tên chỉ được chứa chữ cái và khoảng trắng giữa các từ." [Refer to **MSG80**].
    *   If the user enters an invalid email format, the system displays an inline validation error: "Email không đúng định dạng" [Refer to **MSG40**].
    *   If the user enters a temporary or disposable email address, the system displays an inline validation error: "Không cho phép sử dụng email tạm thời" [Refer to **BR-02**, **MSG41**].
    *   If the user enters an invalid phone number format, the system displays an inline validation error: "Số điện thoại không hợp lệ" [Refer to **MSG43**].
    *   If the user enters a password that fails complexity requirements, the system displays an inline validation error: "Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số" [Refer to **MSG47**].
    *   If the confirm password does not match the entered password, the system displays an inline validation error: "Mật khẩu xác nhận không khớp" [Refer to **MSG49**].
    *   If the email address is already registered in the system, the system displays an inline validation error: "Email này đã được đăng ký" [Refer to **BR-03**, **MSG44**].
    *   If the phone number is already registered in the system, the system displays an inline validation error: "Số điện thoại này đã được đăng ký" [Refer to **BR-04**, **MSG45**].
    *   If an unexpected error occurs during account creation or email dispatch, the system displays a toast error message: "Đăng ký thất bại. Vui lòng thử lại." [Refer to **MSG51**].
    *   If a network exception or server connection timeout occurs, the system displays a general exception notification [Refer to **MSG04**].
