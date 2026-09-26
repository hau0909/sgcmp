# UI Generation Script: View Companies By Admin

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **View Companies By Admin** page (`/admin/companies`).

---

## 1. Page Header & Search Section
- **Header Layout**: `flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2`
- **Breadcrumbs & Title**:
  - Breadcrumbs: `flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1` (`Quản trị` / `Quản lý doanh nghiệp`)
  - Main Title: `text-2xl font-bold text-primary tracking-tight font-headline` (`Quản lý doanh nghiệp`)
  - Subtitle: `text-xs text-on-surface-variant mt-0.5` (`Xem và quản lý tất cả doanh nghiệp trong hệ thống.`)
- **Right Action Controls**: `flex items-center gap-3 w-full md:w-auto`
  - Search Bar:
    - Container: `flex items-center bg-surface-container-lowest rounded-full px-4 py-2.5 border border-outline-variant focus-within:border-primary transition-colors w-full md:w-80 shadow-sm`
    - Left Icon: `Search` (`text-on-surface-variant w-4 h-4 mr-2 shrink-0`)
    - Input: `bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant`
    - Placeholder: `Tìm kiếm tên công ty, MST, chủ sở hữu...`
  - Refresh Button: `flex items-center gap-1.5 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all text-on-surface cursor-pointer shadow-sm shrink-0` (Icon `RefreshCw`)

---

## 2. Status Filter Tabs Bar
- **Container**: `flex flex-wrap gap-2.5 items-center justify-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-sm`
- **Tabs (5 Status Categories)**:
  - All (`Tất cả`): Icon `Building2`, total count badge
  - Published (`Đang công khai`): Icon `Globe`, green badge (`bg-[#dcfce7] text-[#166534]`)
  - Active (`Đã kích hoạt`): Icon `CheckCircle2`, blue badge (`bg-[#dbeafe] text-[#1e40af]`)
  - Pending Publish (`Chờ phê duyệt`): Icon `Clock`, amber badge (`bg-[#fef3c7] text-[#b45309]`)
  - Suspended / Draft (`Tạm ngưng / Bản nháp`): Icon `ShieldAlert`, red badge (`bg-[#fee2e2] text-[#991b1b]`)
- **Tab Active Styling**: `bg-[#eff4ff] text-primary border-primary font-semibold shadow-sm`
- **Tab Inactive Styling**: `bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-medium`

---

## 3. Companies Data Table
- **Table Container**: `bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm`
- **Header Row**:
  - Classes: `bg-surface-container-low/60 border-b border-outline-variant text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider`
  - Columns: `STT`, `Doanh nghiệp`, `MST / Số GPKD`, `Người đại diện`, `Bảo vệ`, `Trạng thái`, `Thao tác`
- **Body Rows**:
  - Classes: `border-b border-outline-variant/30 hover:bg-surface-container-low/30 transition-colors text-xs text-on-surface`
  - Company Cell: Logo image (`w-9 h-9 rounded-xl object-cover border`) with company name and creation date.
  - Representative Cell: Full name with email and phone subtext.
  - Status Badges:
    - Published: `bg-[#dcfce7] text-[#166534] px-2.5 py-1 text-xs font-bold rounded-full`
    - Active: `bg-[#dbeafe] text-[#1e40af] px-2.5 py-1 text-xs font-bold rounded-full`
    - Pending Publish: `bg-[#fef3c7] text-[#b45309] px-2.5 py-1 text-xs font-bold rounded-full`
    - Suspended / Draft: `bg-[#fee2e2] text-[#991b1b] px-2.5 py-1 text-xs font-bold rounded-full`
  - Action Buttons Cell:
    - View Detail Button: `px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-primary font-semibold rounded-lg text-xs flex items-center gap-1 border border-outline-variant/40 cursor-pointer`

---

## 4. Company Detail & Status Change Modal
- **Overlay Backdrop**: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in`
- **Modal Content Box**: `bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95`
- **Modal Header**: `p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-start`
  - Title: Company name with logo & status badge
  - Close Button: `X` icon
- **Modal Body**: `p-6 space-y-4 text-xs font-body max-h-[70vh] overflow-y-auto`
  - Company Legal Info Box: Tax Code, Address, License Document Link.
  - Owner / Representative Info Box: Full name, Phone, Email.
  - Status Quick Action Controls: Buttons to change status to Published, Active, or Suspended.

---

## 5. Pagination Bar
- **Container**: `flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-lowest`
- **Result Counter**: `Hiển thị 1-10 trong số 32 doanh nghiệp`
- **Pagination Controls**: Previous/Next navigation buttons with page number indicator pills.
