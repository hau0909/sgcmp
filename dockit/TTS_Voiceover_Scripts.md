# TTS Voiceover Scripts for Capstone Evaluation Video

This document defines the fixed system prompts, generation rules, and voiceover scripts for generating English audio guides for the project demonstration video (evaluated by professors and academic judges).

---

## 🔒 1. Fixed System Configuration

### 🟢 `Scene` (Fixed)
```text
A quiet professional studio environment, ultra-clear voiceover audio, neutral and formal atmosphere.
```

### 🔵 `Sample Context` (Fixed)
```text
A professional system presenter delivering a formal capstone project demonstration to academic evaluators and professors, speaking clearly, respectfully, and articulately.
```

---

## 📐 2. Text Generation Rules

1. **Tag Directive**: Include only `[professional]` at the very beginning of the text. Do not add any extra inline tags.
2. **Language**: 100% English.
3. **UI Elements**: Translate Vietnamese UI buttons and links into English equivalents (e.g., *Quản lý gói dịch vụ* $\rightarrow$ *Service Packages Management*, *Đăng ký ngay* $\rightarrow$ *Subscribe Now*).
4. **Tone & Length**: Formal, concise, clear, and complete.

---

## 🎙️ 3. Generated Voiceover Scripts

### 3.2.2 Register
- **Original Steps**:
  1. Enter "Họ và tên", this field is required.
  2. Enter "Địa chỉ Email", this field is required.
  3. Enter "Số điện thoại", this field is required.
  4. Enter "Mật khẩu", this field is required.
  5. Enter "Xác nhận mật khẩu", this field is required. Must match "Mật khẩu".
  6. Click the "Tạo tài khoản" button.

- **Generated Audio Text**:
```text
[professional] To register a new account, fill in your full name, email address, phone number, password, and password confirmation. Then, click the Create Account button to complete your registration.
```

---

### 3.2.3 Login
- **Original Steps**:
  1. Enter "Địa chỉ Email", this field is required.
  2. Enter "Mật khẩu", this field is required.
  3. Click the "Đăng nhập" button.

- **Generated Audio Text**:
```text
[professional] To log into your account, enter your email address and password. Then, click the Login button to sign in.
```

---

### 3.2.5 Register company
- **Original Steps**:
  1. Click the "Đăng ký công ty" button on the top navigation bar of the landing page.
  2. Enter "Họ và tên" (Full Name), this field is required.
  3. Enter "Số điện thoại" (Phone Number), this field is required.
  4. Enter "Địa chỉ Email" (Email Address), this field is required.
  5. Enter "Mật khẩu" and "Xác nhận mật khẩu" (Password & Confirm Password), this field is required.
  6. Click the "Thiết lập tài khoản & Tiếp tục" button to proceed to Step 2.
  7. Enter representative "Họ và tên" and "Số điện thoại".
  8. Click "Chọn ảnh" to upload "Ảnh đại diện (Avatar)".
  9. Enter "Số CMND / CCCD", "Ngày cấp", and "Nơi cấp", these fields are required.
  10. Upload "Mặt trước CCCD" and "Mặt sau CCCD", these fields are required.
  11. Click the "Tiếp tục" button to proceed to Step 3.
  12. Enter "Tên Doanh nghiệp", "Mã số doanh nghiệp / Mã số thuế", "Email liên hệ", and "Số điện thoại doanh nghiệp", these fields are required.
  13. Select "Tỉnh / Thành phố", "Quận / Huyện / Phường / Xã", enter "Số nhà, Tên đường", and optional "Mô tả về doanh nghiệp".
  14. Upload "Logo doanh nghiệp", "Giấy phép đăng ký kinh doanh (Bản scan PDF/Ảnh)", and optional "Hình ảnh thực tế hoạt động công ty".
  15. Click the "Tiếp tục" button to proceed to final step confirmation.

- **Generated Audio Text**:
```text
[professional] To register a security company, click the Register Company button on the top navigation bar. In step one, fill in your full name, phone number, email address, password, and password confirmation, then click Account Setup and Continue. In step two, provide your personal details, upload an avatar, enter your national ID information along with front and back photos, and click Continue. In step three, enter your company name, tax code, contact email, business phone, address, and upload your company logo, business registration license, and operational photos, then click Continue to proceed to final submission.
```

---

### 3.2.6 Email verification
- **Original Steps**:
  1. Open the verification email sent to your inbox and click the "Xác thực Email" button to verify your new account email address and activate access to the system.

- **Generated Audio Text**:
```text
[professional] To verify your email address, open the verification email sent to your inbox and click the Verify Email button to activate your account.
```

---

## 📌 4. Upcoming Step Scripts
*(Additional step voiceover scripts will be appended here as workflow images are provided).*


