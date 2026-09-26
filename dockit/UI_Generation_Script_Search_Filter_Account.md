# UI Generation Script: Search & Filter Account (Admin)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Search & Filter Account** interface on the Admin Account Management page (`/accounts`).

---

## 1. Page Header & Top Search Bar
- **Header Layout**: `flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2`
- **Breadcrumbs & Title**:
  - Breadcrumbs: `flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1` (`Admin` / `Danh sách tài khoản`)
  - Main Title: `text-2xl font-bold text-primary tracking-tight font-headline` (`Danh sách tài khoản`)
  - Subtitle: `text-xs text-on-surface-variant mt-0.5` (`Quản lý và giám sát tất cả tài khoản người dùng trong hệ thống`)
- **Right Action Controls**: `flex items-center gap-3 w-full md:w-auto`
  - Search Input:
    - Container: `flex items-center bg-surface-container-lowest rounded-full px-4 py-2.5 border border-outline-variant focus-within:border-primary transition-colors w-full md:w-80 shadow-sm`
    - Left Icon: `Search` (`text-on-surface-variant w-4 h-4 mr-2 shrink-0`)
    - Input Field: `bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant`
    - Placeholder: `Tìm kiếm theo tên, email, SĐT...`
  - Refresh Button: `flex items-center gap-1.5 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all text-on-surface cursor-pointer shadow-sm shrink-0` (Icon `RefreshCw`)

---

## 2. Role Filter Tabs Bar
- **Container**: `flex flex-wrap gap-2.5 items-center justify-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-sm`
- **Filter Tabs**:
  - All (`Tất cả`): `Users` icon, total count badge
  - Customer (`Khách hàng`): `UserCircle` icon, blue theme badge (`bg-[#dbeafe] text-[#1e40af]`)
  - Company Admin (`Quản lý DN`): `Building2` icon, amber theme badge (`bg-[#fef3c7] text-[#b45309]`)
  - Guard (`Bảo vệ`): `Shield` icon, emerald theme badge (`bg-[#d1fae5] text-[#065f46]`)
  - Coordinator (`Điều phối`): `Crosshair` icon, pink theme badge (`bg-[#fce7f3] text-[#9d174d]`)
  - Admin (`Admin`): `ShieldCheck` icon, purple theme badge (`bg-[#ede9fe] text-[#6d28d9]`)
- **Tab Active State Styling**: `bg-[#eff4ff] text-primary border-primary font-semibold shadow-sm`
- **Tab Inactive State Styling**: `bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low font-medium`

---

## 3. Account Status Sub-Filter Bar
- **Container**: `flex items-center justify-between px-4 py-2.5 bg-surface-container-low/50 rounded-xl border border-outline-variant/30 text-xs`
- **Status Filter Pills**: `flex items-center gap-2`
  - All Statuses: `px-3 py-1 rounded-full text-xs font-semibold cursor-pointer`
  - Active (`Hoạt động`): `bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full`
  - Banned/Inactive (`Bị khóa / Inactive`): `bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full`

---

## 4. Filtered Accounts Data Table
- **Table Container**: `bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden shadow-sm`
- **Header Row**:
  - Classes: `bg-surface-container-low/60 border-b border-outline-variant text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider`
  - Columns: `STT`, `Người dùng`, `Email`, `Số điện thoại`, `Vai trò`, `Ngày tạo`, `Trạng thái`, `Thao tác`
- **Body Rows**:
  - Classes: `border-b border-outline-variant/30 hover:bg-surface-container-low/30 transition-colors text-xs text-on-surface`
  - Avatar & User Cell: Avatar image `w-9 h-9 rounded-full object-cover` with name and role subtitle.
  - Role Badges:
    - Customer: `bg-[#dbeafe] text-[#1e40af] px-2.5 py-1 text-xs font-semibold rounded-full`
    - Company Admin: `bg-[#fef3c7] text-[#b45309] px-2.5 py-1 text-xs font-semibold rounded-full`
    - Guard: `bg-[#d1fae5] text-[#065f46] px-2.5 py-1 text-xs font-semibold rounded-full`
    - Coordinator: `bg-[#fce7f3] text-[#9d174d] px-2.5 py-1 text-xs font-semibold rounded-full`
    - Admin: `bg-[#ede9fe] text-[#6d28d9] px-2.5 py-1 text-xs font-semibold rounded-full`
  - Account Status Badges:
    - Active (`Active`): `bg-[#dcfce7] text-[#166534] px-2.5 py-1 text-xs font-semibold rounded-full`
    - Banned (`Bị khóa`): `bg-[#fef2f2] border border-[#fca5a5] text-[#991b1b] px-2.5 py-1 text-xs font-semibold rounded-full`
  - Action Cell:
    - Detail Button: `p-1.5 hover:bg-surface-container text-primary rounded-lg transition-colors cursor-pointer` (Icon `ExternalLink`)

---

## 5. Pagination Component
- **Container**: `flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-lowest`
- **Result Counter**: `Hiển thị 1-10 trong số 45 tài khoản`
- **Page Nav Buttons**:
  - Previous / Next Buttons: `p-2 rounded-lg border border-outline-variant text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer`
  - Page Number Pills: Active page highlighted with `bg-primary text-on-primary font-bold`.
