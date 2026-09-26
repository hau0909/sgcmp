# UI Generation Script: Pay SaaS Plan (Payment & Success Screens)

This script provides component-level UI specifications tailored for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Payment Screen** and the **Payment Success Screen** for SaaS subscription purchases.

---

## Screen 1: Payment Screen (`PaymentScreen`)

### 1. Page Layout & Header
- **Main Container**: `flex-1 p-6 lg:p-8 max-w-360 mx-auto w-full flex flex-col gap-6`.
- **Page Header**:
  - Breadcrumb/back navigation: `Quay lại Quản lý gói` with left arrow icon (`ArrowLeft` size `w-4 h-4`).
  - Title: `Thanh toán Gói dịch vụ` (bold, text-primary, font-headline, size `text-xl`).
  - Subtitle: `Vui lòng hoàn tất quá trình thanh toán để kích hoạt gói dịch vụ của bạn.` (text-on-surface-variant, size `text-xs`).
- **Main Grid**: Responsive 2-column layout `grid grid-cols-1 lg:grid-cols-12 gap-6 items-start`.

### 2. Left Column: Order & Pricing Summary (`lg:col-span-5`)
- **Block A: Service Confirmation Card**:
  - Container: Card style with `bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-5 flex flex-col gap-4 shadow-sm`.
  - Content: Header with `CreditCard` icon, followed by the selected plan details card (`bg-surface-container-low rounded-lg p-3.5 border border-outline-variant/50`).
  - Pricing: Plan name, "Gói dịch vụ 1 tháng" subtext, and price tag in `text-xs font-bold text-primary`.
  - Feature list: A bulleted list showing plan features (active coordinators limit, active guards limit, etc.), each prefixed with a checkmark badge (`CheckCircle2` size `w-3.5 h-3.5 text-secondary`).
- **Block B: Payment Details Card**:
  - Container: Card style, title `Chi tiết thanh toán`.
  - Billing breakdown: Shows `Tạm tính` (base price) and `Tổng cộng` (large font weight `text-base font-black text-primary` value).

### 3. Right Column: Payment Transfer Details (`lg:col-span-7`)
- **Container**: Card style `bg-surface-container-lowest border border-outline-variant rounded-xl p-4 md:p-6 flex flex-col gap-6 shadow-sm`.
- **Payment Method Section**: Header with `QrCode` icon, subtitle `Chuyển khoản ngân hàng (VietQR)`.
- **Split content**:
  - **Left side: VietQR Code Box**:
    - Container: `flex flex-col items-center gap-3 bg-surface-container-low/60 p-4 rounded-xl border border-outline-variant/50`.
    - Content: White box containing the dynamically generated QR image (`https://img.vietqr.io/image/{bankId}-{accountNumber}-compact2.png?...`). Includes scanning guides and loader overlay while generating.
  - **Right side: Bank Transfer Fields**:
    - Layout: Vertical stack of copyable detail boxes (Tên ngân hàng, Số tài khoản, Tên chủ tài khoản, Số tiền, Nội dung chuyển khoản).
    - Styling: Each detail box has a copy button (`Copy` icon size `w-3.5 h-3.5 text-on-surface-variant/80 hover:text-primary transition-all`). Once copied, it displays a success tick (`Check` icon size `w-3.5 h-3.5 text-emerald-600`).
- **Confirmation Action**:
  - Manual check button: A solid primary button at the bottom labeled `Tôi đã thanh toán` or `Xác nhận hoàn tất thanh toán`.
  - Disabled state when verifying: Shows a loader spinner (`Loader2` size `w-4 h-4 animate-spin`) and label `Đang kiểm tra...`.

---

## Screen 2: Payment Success Screen (`PaymentSuccessScreen`)

### 1. Page Layout & Wrapper
- **Main Container**: `flex-1 max-w-[950px] w-full mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[400px]`.
- **Main Card**: `bg-surface-container-lowest border border-outline-variant rounded-2xl p-7 flex flex-col items-center justify-center shadow-lg w-full max-w-md text-center`.

### 2. Success Brand Elements
- **Icon Badge**: Large circular icon wrapper (`w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100`).
- **Icon**: `CheckCircle2` or `ShieldCheck` (size `w-10 h-10`).
- **Title**: `text-xl font-bold text-[#0b1c30] font-headline mb-1`. Text: `Thanh toán thành công!`
- **Subtitle**: `text-xs text-on-surface-variant font-medium mb-6`. Text: `Cảm ơn bạn đã lựa chọn dịch vụ của chúng tôi.`

### 3. Transaction Details Panel
- **Container**: Gray background panel with subtle borders `bg-surface-container-low/50 border border-outline-variant/60 rounded-xl p-4 w-full text-left space-y-3 mb-6 text-xs`.
- **Details Rows**:
  - Row 1: `Mã giao dịch` (Displays transaction code in `font-mono font-bold text-on-surface`).
  - Row 2: `Gói dịch vụ` (Displays name of purchased plan).
  - Row 3: `Số tiền` (Displays formatted VND currency price).
  - Row 4: `Phương thức` (Displays "Chuyển khoản").
  - Row 5: `Thời gian thanh toán` (Displays formatted timestamp `DD/MM/YYYY HH:MM`).
  - Row 6: `Thời hạn sử dụng` (Displays subscription start date to end date interval).

### 4. Bottom Action
- **Return Button**: A solid primary blue button spanning full-width of the card, labeled `Bắt đầu trải nghiệm` or `Quay lại trang quản lý`, with a right arrow icon (`ArrowRight` size `w-4 h-4`).
