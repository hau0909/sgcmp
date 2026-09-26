# UI Generation Script: View Bank Accounts

This script provides a highly detailed, component-level UI specification tailored for AI-assisted design generators (such as Stitch) or front-end developers to recreate the **Bank Accounts** page in the Admin panel.

---

## 1. Page Context & Theme Settings
- **Theme Framework**: Tailwind CSS with custom color tokens.
- **Colors**:
  - `bg-primary`: Primary blue theme color (`#2c5ead`).
  - `bg-red-600`: Red for destructive actions (`#dc2626`).
  - `text-[#0b1c30]`: Dark text for headings.
  - `text-[#434751]`: Muted text for descriptions and labels.
  - `bg-[#eff4ff]`: Light blue background for secondary buttons and empty states.
  - `border-[#c3c6d3]`: Standard border color.
- **Typography**: `font-headline` for titles, `font-body` for standard text, `font-mono` for account numbers.

---

## 2. Component 1: Page Header
- **Container Styling**: Flex layout `flex items-center justify-between`.
- **Title Section (Left)**:
  - Container: `flex items-center gap-3`.
  - Icon Box: `w-10 h-10 rounded-xl bg-[#2c5ead]/10 flex items-center justify-center`.
  - Icon: `Landmark` (`w-5 h-5 text-[#2c5ead]`).
  - Title: `text-lg font-bold text-[#0b1c30] font-headline` (Text: "Tài khoản Ngân hàng").
  - Subtitle: `text-xs text-[#434751] font-body` (Text: "Quản lý tài khoản nhận thanh toán của hệ thống").
- **Action Buttons (Right)**:
  - Container: `flex items-center gap-2`.
  - Refresh Button: `h-9 px-3 rounded-lg text-sm bg-[#eff4ff] border border-[#c3c6d3]`. Icon: `RefreshCw`.
  - Add Button: `h-9 px-4 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors`. Icon: `Plus`. Text: "Thêm tài khoản".

---

## 3. Component 2: Status Banners
- **No Active Account Warning (Amber)**:
  - Container: `flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3`.
  - Icon: `TriangleAlert` (`text-amber-600`).
  - Text: `text-sm text-amber-700 font-medium`. Highlights "Chưa có tài khoản nào được kích hoạt." in bold.
- **Error Banner (Red)**:
  - Container: `flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3`.
  - Icon: `AlertCircle` (`text-red-500`).
  - Text: `text-sm text-red-600 font-medium`.

---

## 4. Component 3: Empty State
- **Container**: `flex flex-col items-center justify-center py-20 gap-3 bg-white rounded-2xl border border-dashed border-[#c3c6d3]`.
- **Icon Box**: `w-14 h-14 rounded-2xl bg-[#eff4ff] flex items-center justify-center`. Icon: `Landmark` (`text-[#2c5ead]/40`).
- **Text**: `text-sm text-[#434751] font-medium` (Text: "Chưa có tài khoản ngân hàng nào.").
- **Action Button**: Primary blue button to "Thêm tài khoản đầu tiên" with `Plus` icon.

---

## 5. Component 4: Bank Account Card Grid
- **Grid Layout**: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5`.
- **Card Container**:
  - Base: `bg-white rounded-2xl border flex flex-col overflow-hidden shadow-sm transition-all duration-200`.
  - Active State: `border-primary/40 shadow-primary/10 border-l-4 border-l-primary`.
  - Inactive State: `border-[#c3c6d3] hover:border-primary/40`.

### 5.1 Card Header
- **Container**: `px-5 pt-5 pb-4 flex items-start justify-between gap-3`.
- **Bank Info (Left)**:
  - Logo Box: `w-16 h-16 rounded-2xl bg-white border border-[#c3c6d3]/40 flex items-center justify-center shadow-sm`.
  - Logo Image: `w-14 h-14 object-contain p-1`.
  - Bank Name: `text-sm font-bold text-[#0b1c30] leading-tight font-headline`.
  - Bank Code: `text-xs text-[#434751] mt-0.5 uppercase font-body`.
- **Status Badge (Right)**:
  - Active: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary`. Icon: `CheckCircle2`. Text: "Đang hoạt động".
  - Inactive: `inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#eff4ff] text-[#434751]`. Text: "Ngừng hoạt động".

### 5.2 Card Body
- **Divider**: `mx-5 border-t border-[#c3c6d3]/60`.
- **Container**: `px-5 py-4 flex flex-col gap-3 flex-1`.
- **Data Rows (Account Holder, Number, Role)**:
  - Layout: `flex items-center justify-between`.
  - Label: `text-[10px] font-bold text-[#434751] uppercase tracking-widest`.
  - Value (Name): `text-xs font-bold text-[#0b1c30] uppercase`.
  - Value (Number): `text-sm font-bold text-[#0b1c30] font-mono tracking-wide`.

### 5.3 Card Footer (Actions)
- **Container**: `border-t border-[#c3c6d3]/60 px-5 py-3 flex items-center justify-between gap-2 bg-[#eff4ff]/30`.
- **Left Actions**:
  - Delete Button: `h-8 px-3 rounded-lg text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5`. Icon: `Trash2`. Text: "Xóa".
- **Right Actions**:
  - Deactivate / Set Active Button: 
    - Active State (Ngừng hoạt động): `h-8 px-3 rounded-lg text-xs font-semibold text-[#434751] bg-white border border-[#c3c6d3]`.
    - Inactive State (Đặt làm mặc định): `h-8 px-3 rounded-lg text-xs font-semibold text-[#2c5ead] bg-white border border-[#c3c6d3] hover:bg-[#dce9ff] flex items-center gap-1.5`. Icon: `CheckCircle2`. Text: "Đặt làm mặc định".
  - Edit Button: `h-8 px-3 rounded-lg text-xs font-semibold text-[#434751] bg-white border border-[#c3c6d3] hover:bg-[#dce9ff]`. Icon: `Pencil`.

---

## 6. Component 5: Page Stats
- **Container**: `text-xs text-[#434751] font-body` at the bottom of the page.
- **Text format**: `Tổng {count} tài khoản — 1 đang hoạt động` (or `Chưa có tài khoản mặc định` in amber color).
