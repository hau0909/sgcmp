# UI Generation Script: View My Request Detail (Customer)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **View My Request Detail** page for Customers (`/my-requests/[id]`).

---

## 1. Page Header Section (`BookingDetailHeader`)
- **Breadcrumbs**: `flex items-center gap-2 text-xs text-on-surface-variant/70 mb-3`
  - Links: `Trang chủ` / `Yêu cầu của tôi` / `Chi tiết yêu cầu #{booking_id}`
- **Header Title Row**: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30`
  - Left Section:
    - Back Button: `p-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant border border-outline-variant/30 transition-colors cursor-pointer` (Left arrow icon `ArrowLeft`)
    - Title & ID Badge: `text-xl font-bold text-on-surface font-headline flex items-center gap-2.5` (`Chi tiết Yêu cầu`)
    - Request ID Badge: `px-2.5 py-1 bg-surface-container-high text-on-surface text-xs font-mono font-bold rounded-lg border border-outline-variant/40`
  - Right Section (Status & Action Badges):
    - Status Badge: Colored pill badge representing status (`Mới`, `Đang khảo sát`, `Đã báo giá`, `Đã chấp nhận`, `Từ chối`, `Đã hủy`)
    - Edit Button (if pending): `px-3.5 py-2 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl border border-outline-variant/40 transition-colors flex items-center gap-1.5 cursor-pointer`

---

## 2. Request Lifecycle Stepper (`BookingProgress`)
- **Container**: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xs`
- **Stepper Grid**: `grid grid-cols-4 gap-2 relative`
- **Step Items**:
  - Step 1: `Gửi yêu cầu` (Submitted)
  - Step 2: `Khảo sát` (Site Survey / Verification)
  - Step 3: `Báo giá` (Quotation)
  - Step 4: `Hợp đồng` (Contract Active)
- **Step Styling**:
  - Completed Step: Icon green check Circle, text emerald-700 font-bold, connecting line green.
  - Active Step: Icon primary color with glowing ring, text primary font-bold, connecting line primary.
  - Pending Step: Icon gray circle outline, text gray-400 font-medium.

---

## 3. Main Content Grid (2 Columns)
- **Grid Layout**: `grid grid-cols-1 lg:grid-cols-3 gap-6`
- **Left Main Column (2/3 width)**: `lg:col-span-2 space-y-6`

### 3.1 Security Company Info Card (`BookingCustomerInfo`)
- **Container**: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xs space-y-4`
- **Card Header**: `flex items-center justify-between pb-3 border-b border-outline-variant/20`
  - Title: `text-sm font-bold text-on-surface font-headline flex items-center gap-2` (Building/Shield Icon, `Thông tin Công ty Bảo vệ`)
- **Info Grid**: `grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body`
  - Fields: `Tên công ty`, `Người đại diện / Liên hệ`, `Số điện thoại`, `Email`, `Địa chỉ văn phòng`

### 3.2 Service Specifications Card (`BookingServiceSpec`)
- **Container**: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xs space-y-4`
- **Card Header**: `flex items-center justify-between pb-3 border-b border-outline-variant/20`
  - Title: `text-sm font-bold text-on-surface font-headline flex items-center gap-2` (ShieldCheck Icon, `Thông tin Yêu cầu Dịch vụ`)
- **Specification Details**:
  - Service Name & Guard Count Badge: `text-sm font-bold text-primary flex items-center gap-2`
  - Schedule & Time Slots Grid: `p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-2`
    - Date Range: `Thời gian: DD/MM/YYYY - DD/MM/YYYY`
    - Shift Time Slots: Badges for shift times (e.g. `Ca 1: 07:00 - 15:00`, `Ca 2: 15:00 - 23:00`)
  - Special Instructions / Requirements Box: `p-3.5 bg-surface-container-low/50 rounded-xl text-xs text-on-surface-variant leading-relaxed`

---

## 4. Right Column - Quotation Panel (`BookingQuotationPanel`) (1/3 width)
- **Container**: `lg:col-span-1 space-y-6`
- **Quotation Card**: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-6 shadow-2xs space-y-4`
- **Card Header**: `flex items-center justify-between pb-3 border-b border-outline-variant/20`
  - Title: `text-sm font-bold text-on-surface font-headline flex items-center gap-2` (DollarSign Icon, `Phương án Báo giá`)
- **Quotation States**:
  - **A. Waiting for Quote State**:
    - Alert Box: `p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs leading-relaxed flex gap-2`
    - Message: `Công ty bảo vệ đang tiến hành khảo sát và chuẩn bị bảng báo giá cho quý khách.`
  - **B. Quoted State (Customer Review)**:
    - Quoted Price Display: `text-2xl font-bold text-primary font-mono` (`15,000,000 đ`)
    - Rate Breakdown Details: Display hourly rate, monthly rate, or package calculation details.
    - Customer Actions:
      - "Đồng ý báo giá" Button: `w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md`
      - "Từ chối báo giá" Button: `w-full border border-error text-error text-xs font-bold py-2.5 rounded-lg hover:bg-red-50/50`
  - **C. Accepted & Contract Created State**:
    - Banner: `p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs space-y-3`
    - Contract Link Button: `w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm flex justify-center items-center gap-2 cursor-pointer` (`Xem Hợp đồng`)

---

## 5. Confirmation Modals & Error States
- **Confirmation Modals**:
  - Accept & Deny modals overlay centered on screen with backdrop blur `fixed inset-0 bg-black/50 backdrop-blur-sm z-50`.
- **Error State**:
  - Loading / Not Found Container: `bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center shadow-2xs`
  - Icon: `AlertCircle` (`w-12 h-12 text-error mx-auto mb-2`)
  - Error Text: `Không tìm thấy thông tin yêu cầu đặt lịch.`
