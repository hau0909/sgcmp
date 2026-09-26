# UI Generation Script: View Account (Admin)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **View Account** page for System Admin (`/accounts/[userId]`).

---

## 1. Page Header & Top Bar Section
- **Header Layout**: `flex items-center gap-4`
- **Back Navigation Button**:
  - Styling: `w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-all shadow-sm cursor-pointer`
  - Icon: `ArrowLeft` (size `w-5 h-5`)
- **Title Block**:
  - Title: `text-2xl font-bold text-primary tracking-tight font-headline` (`Chi tiết tài khoản`)
  - Subtitle: `text-xs text-on-surface-variant mt-0.5` (`Xem và quản lý thông tin chi tiết của tài khoản người dùng`)
- **Ban Account CTA Button** (visible if account is active):
  - Styling: `ml-auto flex items-center justify-center gap-2 rounded-lg border-2 bg-blue-800 px-4 py-2 font-medium text-white transition-all duration-300 hover:bg-blue-900 cursor-pointer`
  - Icon: `Ban` (size `20`)
  - Label: `Khóa tài khoản`

---

## 2. Banned Alert Banner (Conditional)
- **Condition**: Renders only when `account.status === "banned"`.
- **Container**: `bg-red-50 border border-red-200 rounded-2xl p-5 text-red-900 flex items-start gap-4 shadow-sm`
- **Warning Icon**: `p-2.5 bg-red-100 rounded-xl text-red-600 shrink-0` (`AlertTriangle` size `w-5 h-5`)
- **Banner Text**:
  - Title: `font-bold text-base text-red-800` (`Tài khoản này đã bị khóa`)
  - Reason Text: `text-sm text-red-700` (`Lý do khóa: [Nội dung lý do khóa tài khoản]`)

---

## 3. Main Content Grid (2 Columns)
- **Grid Layout**: `grid grid-cols-1 md:grid-cols-3 gap-6`

### 3.1 Left Column: Avatar & Role Badges (1/3 width)
- **Container**: `md:col-span-1 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm flex flex-col items-center text-center`
- **Avatar Frame**: `w-32 h-32 rounded-full bg-surface-container-high border-4 border-white shadow-md flex items-center justify-center overflow-hidden mb-4 relative`
  - Image / Fallback: `UserCircle` icon (`w-16 h-16 text-on-surface-variant/50`)
- **User Name**: `text-xl font-bold text-on-surface mb-1`
- **Role & Status Badges Block**: `flex flex-col gap-2 mt-3 items-center`
  - Role Badge Pill: `inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider` (Colors styled per role: Customer-blue, CompanyAdmin-amber, Guard-emerald, Coordinator-pink, Admin-purple).
  - Status Badge Pill: Active (`bg-[#dcfce7] text-[#166534]`) vs Banned (`bg-[#fef2f2] text-[#991b1b] border-[#fca5a5]`).

### 3.2 Right Column: Detailed Profile Info (2/3 width)
- **Container**: `md:col-span-2 space-y-6`

#### A. Contact Information Card
- **Container**: `bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4`
- **Header**: `flex items-center gap-2 pb-3 border-b border-outline-variant/30 text-sm font-bold text-primary` (Mail icon)
- **Fields Grid**: `grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs`
  - Email Field: Icon `Mail`, label & value text.
  - Phone Number Field: Icon `Phone`, label & value text.
  - Address Field: Icon `MapPin`, label & value text.

#### B. Personal Identity Card
- **Container**: `bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4`
- **Header**: `flex items-center gap-2 pb-3 border-b border-outline-variant/30 text-sm font-bold text-primary` (User icon)
- **Fields Grid**: `grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs`
  - Gender Field: `Nam` / `Nữ`
  - Date of Birth Field: Format `DD/MM/YYYY`
  - CCCD/CMND Number Field: Identity card number.

#### C. Account Timestamps Card
- **Container**: `bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm space-y-4`
- **Header**: `flex items-center gap-2 pb-3 border-b border-outline-variant/30 text-sm font-bold text-primary` (Clock icon)
- **Fields Grid**: `grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs`
  - Created Date: `Ngày tạo tài khoản`
  - Last Updated Date: `Ngày cập nhật gần nhất`

---

## 4. Error State & Loading Screen
- **Loading State**: `flex items-center justify-center min-h-[400px]` with spinning loader ring.
- **Not Found State**:
  - Container: `flex flex-col items-center justify-center min-h-[400px] text-error font-medium gap-4`
  - Text: `Không tìm thấy thông tin tài khoản.`
  - Back to List Button: `flex items-center gap-2 px-4 py-2 bg-surface-container-low text-on-surface rounded-xl hover:bg-surface-container`
