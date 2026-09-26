# UI Generation Script: Update Service Quotation (Company)

This script provides a highly detailed, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Update Service Quotation** panel on the Company Request Detail page (`/requests/[id]`).

---

## 1. Panel Container & Header
- **Condition**: Renders inside the right column (`1/3 width`) of the Request Detail page when `viewMode === "company"`.
- **Panel Container**:
  - Base Classes: `bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden h-fit transition-all duration-300 border border-outline-variant`
  - Rejected State Class: `border-2 border-red-500 ring-2 ring-red-500/20` (applied when previous quotation was rejected by customer)
  - Decorative Element: `absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none`
- **Header Section**:
  - Layout: `flex items-center justify-between border-b border-outline-variant/30 pb-2.5 mb-3 font-headline`
  - Left Icon & Title:
    - Icon: `DollarSign` (lucide-react, `w-5 h-5 text-secondary`)
    - Main Title: `text-base font-bold text-on-surface` ("Cập nhật báo giá")
    - Subtitle: `text-[10px] font-normal text-on-surface-variant/80 tracking-normal mt-0.5` ("Lựa chọn hình thức và thương lượng giá")
  - Rejected Alert Badge (if `status === "rejected"`):
    - Layout: `inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-700 border border-red-300 shrink-0`
    - Icon: `AlertCircle` (`w-3.5 h-3.5 text-red-600`)
    - Label: `Từ chối báo giá`

---

## 2. Service Summary & Listed Base Price Box
- **Container**: `p-3 bg-surface-container rounded-lg border border-outline-variant/30 text-xs space-y-1.5 mb-4 font-sans`
- **Row 1 - Selected Service**:
  - Layout: `flex justify-between items-center`
  - Label: `text-on-surface-variant font-medium` ("Dịch vụ đã chọn:")
  - Value: `font-bold text-on-surface text-right` (e.g., `Bảo vệ sự kiện`, `Bảo vệ mục tiêu cố định`)
- **Row 2 - Company Listed Price**:
  - Layout: `flex justify-between items-center border-t border-dashed border-outline-variant/30 pt-1.5`
  - Label: `text-on-surface-variant font-medium` ("Giá niêm yết công ty:")
  - Value (if price exists): `font-bold font-mono text-primary` (e.g., `25,000 đ/giờ`)
  - Value (if no fixed price): `font-medium italic text-on-surface-variant/70` ("Chưa có giá cố định")

---

## 3. Quotation Method Selector (3-Tab Switcher)
- **Condition**: Visible when `viewMode === "company"` and quotation inputs are enabled.
- **Section Label**: `text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-2` ("Phương thức báo giá")
- **Rejected Re-quote Note**: `text-[10.5px] font-semibold text-red-600 italic` ("* Báo giá trước đó đã bị từ chối")
- **Tab Container**:
  - Grid: `grid grid-cols-3 gap-1.5 p-1 rounded-lg border bg-surface-container border-outline-variant/40`
  - Rejected Container Style: `bg-red-50/40 border-red-300`
- **Tab Buttons**:
  - Common Style: `py-2 px-1 text-center rounded-md text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer`
  - Active Tab Style: `bg-white text-primary shadow-sm font-bold border border-primary/20`
  - Active Rejected Style: `bg-white text-red-700 font-bold border-2 border-red-500 shadow-sm`
  - Inactive Style: `text-on-surface-variant hover:text-on-surface`
  - **Tab 1: Theo Giờ (Hourly)** - Left Icon: `Clock` (`w-3.5 h-3.5`)
  - **Tab 2: Theo Tháng (Monthly)** - Left Icon: `Calendar` (`w-3.5 h-3.5`)
  - **Tab 3: Trọn Gói (Package)** - Left Icon: `PackageCheck` (`w-3.5 h-3.5`)

---

## 4. Option Dynamic Input Panels & Calculations

### Option A: Theo Giờ (Hourly Rate) Input Panel
- **Container**: `space-y-3 p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/30`
- **Input Header & Reset CTA**:
  - Label: `text-[11px] font-semibold text-on-surface` ("Đơn giá thương lượng (VND / Giờ / Nhân sự)")
  - Reset CTA Button: `text-[10.5px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors`
    - Icon: `RotateCcw` (`w-3 h-3`)
    - Label: `Dùng giá gợi ý`
- **Input Field**:
  - Wrapper: `relative`
  - Input: `w-full pl-3 pr-16 py-2 border rounded-md bg-surface-container-lowest text-sm font-semibold font-mono text-on-surface focus:ring-2 focus:ring-secondary/60 disabled:opacity-75`
  - Suffix Badge: `absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline font-semibold` ("đ/giờ")
- **Specs Summary Box**:
  - Container: `text-[11.5px] text-on-surface-variant space-y-1.5 bg-white p-3 rounded-lg border border-outline-variant/20 font-sans`
  - Number of Guards: `Số lượng nhân sự:` -> `font-bold text-on-surface font-mono` (`{guardsCount} bảo vệ`)
  - Duty Hours / Day: `Số giờ trực / ngày:` -> `font-bold text-on-surface font-mono` (e.g., `8 giờ`)
  - Working Days: `Số ngày làm việc:` -> `font-bold text-on-surface font-mono` (e.g., `30 ngày`)

### Option B: Theo Tháng (Monthly Rate) Input Panel
- **Container**: `space-y-3 p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/30`
- **Input Header & Reset CTA**:
  - Label: `text-[11px] font-semibold text-on-surface` ("Đơn giá thương lượng (VND / Tháng / Vị trí)")
  - Reset CTA: `Dùng giá gợi ý` with `RotateCcw` icon
- **Input Field**:
  - Suffix Badge: `đ/tháng`
- **Specs Summary Box**:
  - Number of Guards: `Số lượng nhân sự:` -> `{guardsCount} bảo vệ`
  - Contract Duration: `Thời hạn hợp đồng:` -> `{totalMonths} tháng ({totalWorkingDays} ngày)`
- **Equivalent Hourly Rate Reference Callout**:
  - Container: `p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 flex justify-between items-center font-medium`
  - Label: `Đơn giá giờ tương đương:`
  - Value: `font-mono text-xs text-amber-950 font-bold` (e.g., `35,000 đ/giờ/nhân sự`)

### Option C: Trọn Gói (Package Total) Input Panel
- **Container**: `space-y-3 p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/30`
- **Input Header & Reset CTA**:
  - Label: `text-[11px] font-semibold text-on-surface` ("Tổng giá trị thương lượng trọn gói (VND)")
  - Reset CTA: `Dùng giá gợi ý` with `RotateCcw` icon
- **Input Field**:
  - Suffix Badge: `VND`
- **Specs Summary Box**:
  - Number of Guards: `Số lượng nhân sự:` -> `{guardsCount} bảo vệ`
  - Service Duration: `Thời hạn dịch vụ:` -> `{totalWorkingDays} ngày`
- **Equivalent Hourly Rate Reference Callout**:
  - Label: `Đơn giá giờ tương đương:`
  - Value: `font-mono text-xs text-amber-950 font-bold` (e.g., `35,000 đ/giờ/nhân sự`)

---

## 5. Live Math Breakdown & Total Price Block
- **Container**: `p-3.5 rounded-xl space-y-2 shadow-xs border bg-primary/10 border-primary/20`
- **Rejected State Container**: `bg-red-50/80 border-red-300`
- **Vertical Breakdown Rows**:
  - Typography: `text-xs text-on-surface-variant font-sans space-y-1`
  - Negotiated Rate Row: `Đơn giá thương lượng:` -> `font-mono font-bold text-on-surface`
  - Total Guard Hours Row: `Tổng số giờ bảo vệ ({guardsCount} bảo vệ):` -> `font-mono font-bold text-on-surface`
- **Total Quoted Price Divider & Display**:
  - Layout: `border-t-2 border-primary/25 pt-2.5 flex items-center justify-between`
  - Left Label: `Calculator` icon (`w-5 h-5 text-primary`) + `text-xs font-bold text-on-surface` ("Tổng tiền báo giá:")
  - Total Amount: `text-lg font-black font-mono text-primary` (e.g., `18,000,000 đ`)
- **Note Footer**: `text-[10.5px] font-semibold text-right italic text-primary/80` (e.g., `* Báo giá theo Giờ (25,000 đ/giờ/nhân sự)`)

---

## 6. Action Buttons Section
- **Container**: `pt-3 border-t border-outline-variant/30 space-y-3`
- **Submit Quotation CTA Button**:
  - Styling: `w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer`
  - Left Icon: `Send` (`w-4 h-4 shrink-0`)
  - Label (Normal): `Cập nhật & Gửi khách hàng`
  - Label (If Re-quoting rejected quote): `Cập nhật & Gửi báo giá lại`
- **Reject Service Request Button**:
  - Styling: `w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer`
  - Left Icon: `XCircle` (`w-4 h-4 shrink-0`)
  - Label: `Từ chối yêu cầu`

---

## 7. Modal Confirmation Dialogs

### Modal 1: Submit Quote Confirmation Modal (`isConfirmSubmitQuoteOpen`)
- **Overlay Backdrop**: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200`
- **Modal Card**: `bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200`
- **Body**:
  - Icon: Blue circular badge (`w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4 flex items-center justify-center`), Icon `Send` (`w-6 h-6`)
  - Title: `text-lg font-bold text-on-surface mb-2 font-headline` ("Xác nhận gửi báo giá")
  - Description: `text-sm text-on-surface-variant/80 font-body mb-3` ("Bạn có chắc chắn muốn gửi phương án báo giá này cho khách hàng không?")
  - Quoted Summary Box: `p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface flex justify-between items-center`
    - Label: `Tổng tiền báo giá:`
    - Amount: `font-mono text-primary font-bold text-sm`
- **Footer Buttons**:
  - Cancel Button: `flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm cursor-pointer` ("Đóng")
  - Confirm Button: `flex-1 py-2.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary transition-all active:scale-95 text-sm cursor-pointer shadow-sm` ("Xác nhận gửi")

### Modal 2: Reject Service Request Modal (`isRejectDialogOpen`)
- **Overlay Backdrop**: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200`
- **Body**:
  - Icon: Red warning circle (`w-12 h-12 rounded-full bg-error/10 text-error mx-auto mb-4 flex items-center justify-center`), Icon `AlertTriangle` (`w-6 h-6`)
  - Title: `text-lg font-bold text-on-surface mb-2 font-headline` ("Từ chối yêu cầu dịch vụ")
  - Description: `text-sm text-on-surface-variant/80 font-body` ("Bạn có chắc chắn muốn từ chối yêu cầu dịch vụ này không? Hành động này không thể hoàn tác.")
- **Footer Buttons**:
  - Cancel Button: `Đóng`
  - Confirm Reject Button: `flex-1 py-2.5 px-4 rounded-xl font-bold bg-error hover:bg-error/90 text-white transition-all active:scale-95 text-sm cursor-pointer shadow-sm` ("Xác nhận từ chối")

---

## 8. Warning & Read-Only State Variations

### State 1: Survey / Site Inspection Not Approved Banner (BR-23)
- **Condition**: `verificationStatus !== "approved"`
- **Banner Styling**: `p-3 mb-3 text-center rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200 leading-relaxed`
- **Text**: `"Cần hoàn tất và duyệt \"Khảo sát yêu cầu\" trước khi báo giá."`
- **Behavior**: All tab switchers, inputs, and submit buttons are disabled (`isInputsDisabled = true`).

### State 2: Request Already Quoted / Locked State
- **Condition**: `status === "quoted"` or `status === "accepted"`
- **Message Box**: `p-3 text-center rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface-variant/75 flex flex-col items-center`
- **Text (`quoted`)**: `"Yêu cầu này đã được báo giá. Không thể chỉnh sửa."`
- **Text (`accepted`)**: `"Yêu cầu này đã được phê duyệt. Không thể chỉnh sửa."`
- **Contract Link CTA** (if `status === "accepted"` and `contractId` exists):
  - Styling: `inline-flex w-full justify-center items-center gap-1.5 px-3 py-2.5 bg-primary hover:bg-primary/95 text-on-primary font-bold rounded-lg text-xs transition-all duration-100 active:scale-95 cursor-pointer mt-2.5 shadow-sm`
  - Icon: `FileText` (`w-4.5 h-4.5 shrink-0`)
  - Label: `Đi tới Hợp đồng chi tiết`
