# UI Generation Script: Reset Password

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Reset Password** page (`/update-password`).

---

## 1. Page Header & Back Button
- **Top Left Back Control**:
  - Container: `absolute left-6 top-6`
  - Button: `inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-slate-600 hover:text-blue-800 transition-all duration-200 group bg-white border border-slate-300 rounded-lg px-3 py-1.5 shadow-xs`
  - Icon & Label: Left arrow `ArrowLeft` (`w-4 h-4`), text `Về trang đăng nhập`

---

## 2. Main Form Card States (`UpdatePasswordContent`)
- **Outer Wrapper**: `flex-1 flex items-start justify-center pt-24 pb-6 px-4`
- **Card Box**: `w-full max-w-[430px] rounded-2xl border border-slate-200 bg-white px-7 py-8 shadow-sm`

### State A: Token Checking Loading State
- Container: `flex flex-col items-center justify-center py-8 gap-3 text-center`
- Spinner: `Loader2` icon (`w-8 h-8 animate-spin text-primary`)
- Text: `Đang kiểm tra liên kết đặt lại mật khẩu...`

### State B: Invalid / Expired Token State
- Container: `text-center py-4 flex flex-col items-center`
- Icon Badge: `w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 mb-4` (`AlertCircle` icon)
- Title: `text-lg font-bold text-slate-900 mb-2` (`Liên kết không hợp lệ hoặc đã hết hạn`)
- Description: `text-sm text-slate-500 mb-6 leading-relaxed` (`Liên kết đặt lại mật khẩu của bạn có thể đã được sử dụng hoặc quá thời hạn cho phép. Vui lòng gửi lại yêu cầu mới.`)
- Action Buttons:
  - Resend Button: `w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center` (`Gửi lại yêu cầu đặt lại mật khẩu`)
  - Login Button: `w-full h-11 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center` (`Quay lại đăng nhập`)

### State C: Email Verified Step (Confirmation)
- Container: `text-center py-4 flex flex-col items-center animate-in fade-in duration-200`
- Icon Badge: `w-16 h-16 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-4` (`MailCheck` icon)
- Title: `text-xl font-bold text-slate-900 mb-2` (`Xác thực email thành công!`)
- Description: `text-sm text-slate-600 mb-6 leading-relaxed` (`Liên kết của bạn đã được xác thực thành công. Vui lòng bấm Tiếp tục để tiến hành đặt lại mật khẩu mới.`)
- CTA Button: `w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center cursor-pointer` (`Tiếp tục đặt lại mật khẩu`)

### State D: Reset Password Form Step
- Form Header: `text-center`
  - Title: `text-2xl font-bold text-slate-900 tracking-tight mb-2` (`Đặt lại mật khẩu mới`)
  - Subtitle: `text-slate-500 text-sm leading-relaxed` (`Vui lòng nhập mật khẩu mới cho tài khoản của bạn.`)
- Form Container: `mt-7 space-y-4`
- General Error Alert: `p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-600` (`AlertCircle` icon)
- Password Input Fields (New Password & Confirm Password):
  - Label: `block text-sm font-semibold text-slate-700`
  - Input Container: `relative`
  - Left Icon: `Lock` (`w-4 h-4 text-slate-400 absolute left-3.5 top-3.5`)
  - Input Element: `h-11 w-full rounded-xl border pl-10 pr-10 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 border-slate-300 focus:border-blue-700`
  - Right Eye Toggle Icon: Eye / EyeOff icon toggle (`absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 cursor-pointer`)
  - Inline Error Text: `text-xs font-medium text-red-600 mt-1`
- Submit Button: `w-full h-11 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer mt-4` (`Cập nhật mật khẩu`)

---

## 3. Success Modal Popup
- **Overlay Backdrop**: `fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200`
- **Modal Content Box**: `bg-white rounded-2xl p-6 md:p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col items-center text-center`
- **Icon**: Green Checkmark `CheckCircle2` (`w-16 h-16 text-green-500 mb-4`)
- **Title**: `text-xl font-bold text-slate-900 mb-2` (`Cập nhật thành công!`)
- **Description**: `text-slate-600 text-sm mb-6 leading-relaxed` (`Mật khẩu của bạn đã được cập nhật thành công. Vui lòng đăng nhập lại với mật khẩu mới.`)
- **Login Action Button**: `px-6 py-2.5 bg-primary text-on-primary rounded-xl font-semibold w-full hover:bg-primary/90 transition-all cursor-pointer` (`Đăng nhập ngay`)
