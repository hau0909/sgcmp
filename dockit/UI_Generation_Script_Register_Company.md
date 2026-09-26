# UI Generation Script: Register Company

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Register Company** multi-step wizard page (`/register-company`).

---

## 1. Page Header & Back Button
- **Top Navigation Bar**: Platform main Header with brand logo, nav links, and login button.
- **Page Header Row**:
  - Container: `relative mb-8 min-h-[80px] flex items-center justify-center`
  - Back Button (Top-left):
    - Classes: `inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition-all duration-200 bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2 shadow-xs`
    - Icon: `ArrowLeft` (size `w-4 h-4`)
    - Label: `Quay lại`
  - Title & Subtitle:
    - Main Title: `text-3xl font-bold text-on-surface tracking-tight font-headline text-center` (`Đăng ký Công ty Bảo vệ`)
    - Subtitle: `text-sm text-on-surface-variant mt-2 leading-relaxed text-center max-w-lg` (`Đăng ký tài khoản doanh nghiệp để gia nhập mạng lưới cung cấp dịch vụ bảo vệ`)

---

## 2. Stepper Header Component (`StepperHeader`)
- **Container**: `mb-10 max-w-3xl mx-auto px-4`
- **Stepper Steps Row**: `flex items-center justify-between relative`
- **Step Indicators (4 Steps)**:
  - Step 1: `Tài khoản` (User Account)
  - Step 2: `Cá nhân` (Personal Details & CCCD)
  - Step 3: `Doanh nghiệp` (Company & Business License)
  - Step 4: `Xác nhận` (Review & Submit)
- **Step Styling**:
  - Completed Step: `w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-sm` (Check icon `Check`)
  - Active Step: `w-10 h-10 rounded-full bg-primary text-on-primary ring-4 ring-primary/20 flex items-center justify-center font-bold text-sm shadow-md`
  - Upcoming Step: `w-10 h-10 rounded-full bg-surface-container-high text-on-surface-variant/60 border border-outline-variant flex items-center justify-center font-semibold text-sm`
  - Connecting Lines: `flex-1 h-1 mx-2 bg-outline-variant/40` (emerald color when completed).

---

## 3. Form Step Content Cards

### 3.1 Step 1: Account Info Form (`StepSignUp`)
- **Card Container**: `max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5`
- **Fields Grid**: `grid grid-cols-1 sm:grid-cols-2 gap-4`
  - Email Field: `w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary`
  - Password & Confirm Password Fields: Input with toggle eye icon.
  - Full Name Field: `w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm`
  - Phone Number Field: `w-full px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-sm`

### 3.2 Step 2: Personal Profile Form (`StepPersonal`)
- **Card Container**: `max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5`
- **Fields**:
  - CCCD/CMND Number: Input field text-sm.
  - Date & Place of Issue: Grid 2 columns.
  - Permanent Address: Full address input.
  - CCCD Image Upload Zone (`UploadZone`):
    - Drag & Drop Box: `border-2 border-dashed border-outline-variant hover:border-primary rounded-2xl p-6 text-center cursor-pointer bg-surface-container-low/40`
    - Front & Back Photo Upload Pickers.

### 3.3 Step 3: Company Profile Form (`StepCompany`)
- **Card Container**: `max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5`
- **Fields**:
  - Company Name (Tiếng Việt): Input field text-sm.
  - Tax Code (Mã số thuế): Input field text-sm.
  - Business License Number: Input field text-sm.
  - Headquarter Address: City, District, Ward dropdown selects & detail address input.
  - Legal Document Uploads: Upload zones for Business Registration License & Security Eligibility Certificate (ANTT).

### 3.4 Step 4: Review & Submit (`StepReview`)
- **Card Container**: `max-w-2xl mx-auto bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6`
- **Summary Cards**:
  - Personal Summary Box: `p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2 text-xs`
  - Company Summary Box: `p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2 text-xs`
- **Terms Checkbox**: `flex items-start gap-3 p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-xs text-on-surface-variant`
  - Checkbox & Label: "Tôi cam kết các thông tin đăng ký trên là chính xác và hoàn toàn chịu trách nhiệm trước pháp luật."

---

## 4. Navigation Action Controls
- **Container**: `max-w-2xl mx-auto mt-8 flex items-center justify-between gap-4`
- **Previous Step Button**: `px-6 py-2.5 bg-surface-container-low hover:bg-surface-container text-on-surface-variant font-semibold rounded-xl border border-outline-variant/60 text-sm transition-colors cursor-pointer` (`Quay lại`)
- **Next Step / Submit Button**:
  - Next Button: `px-6 py-2.5 bg-primary hover:bg-primary/90 text-on-primary font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer` (`Tiếp tục`)
  - Submit Button (Step 4): `px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm shadow-md transition-all active:scale-95 cursor-pointer` (`Gửi yêu cầu đăng ký`)
