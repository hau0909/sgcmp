# UI Generation Script: Search & Filter Guard (Coordinator)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Search & Filter Guard** interface on the Guard List page (`/guards`).

---

## 1. Page Header & Add Action
- **Container**: `mb-6 flex items-start justify-between gap-4`
- **Title Block**:
  - Main Title: `text-2xl font-bold text-slate-950` (`Danh sách nhân viên bảo vệ`)
  - Subtitle: `mt-1 text-md text-slate-600` (`Quản lý hồ sơ của đội ngũ bảo vệ.`)
- **Add Guard Button**:
  - Styling: `flex h-10 cursor-pointer items-center gap-2 bg-blue-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900`
  - Left Icon: `Plus` (size `h-4 w-4`)
  - Label: `Thêm bảo vệ`

---

## 2. Search & Filter Bar Section
- **Container**: `relative z-30 border-b border-slate-300 p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white`
- **Keyword Search Input**:
  - Container: `relative w-full md:max-w-[320px]`
  - Left Icon: `Search` (`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400`)
  - Input Field: `h-9 w-full border border-slate-300 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:bg-white rounded-lg`
  - Placeholder: `Tìm kiếm theo họ tên, SĐT, email...`
- **Filter Controls Group**: `flex flex-wrap items-center gap-3`
  - **Today Schedule / Work Status Filter (`CustomSelect`)**:
    - Placeholder / Default: `Lịch hôm nay (Tất cả)`
    - Options: `Lịch hôm nay (Tất cả)`, `Hoàn thành`, `Phân công`, `Đang rảnh`, `Vắng mặt`, `Đi trễ`, `Thay thế`
    - Button Styling: `flex h-9 min-w-[170px] items-center justify-between border border-slate-300 bg-slate-50 px-3 text-sm text-slate-700 rounded-lg`
  - **Account Status Filter (`CustomSelect`)**:
    - Placeholder / Default: `Trạng thái (Tất cả)`
    - Options: `Trạng thái (Tất cả)`, `Hoạt động`, `Vô hiệu hóa`
  - **Gender Filter (`CustomSelect`)**:
    - Placeholder / Default: `Giới tính (Tất cả)`
    - Options: `Giới tính (Tất cả)`, `Nam`, `Nữ`

---

## 3. Filtered Guard Data Table
- **Table Container**: `overflow-x-auto border-t border-slate-200`
- **Header Row**:
  - Classes: `bg-sky-200/80 text-xs font-bold uppercase text-slate-950`
  - Columns: `STT`, `Ảnh`, `Họ và tên`, `Giới tính`, `Số điện thoại`, `Lịch hôm nay`, `Trạng thái`, `Hành động`
- **Data Rows**:
  - Classes: `border-t border-slate-200 text-sm text-slate-800 transition hover:bg-slate-50`
  - Avatar Column: Circle image `h-11 w-11 rounded-full object-cover` or fallback icon badge.
  - Name Column: Bold name with email subtitle below.
  - Today Schedule Status Badges:
    - On Duty (`ĐANG TRỰC`): `bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
    - Assigned (`PHÂN CÔNG`): `bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
    - Available (`ĐANG RẢNH`): `bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
    - Absent (`VẮNG MẶT`): `bg-red-50 text-red-700 ring-1 ring-red-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
    - Late (`ĐI TRỄ`): `bg-orange-50 text-orange-700 ring-1 ring-orange-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
    - Substitute (`THAY THẾ`): `bg-purple-50 text-purple-700 ring-1 ring-purple-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
  - Account Status Badges:
    - Active (`HOẠT ĐỘNG`): `bg-green-50 text-green-700 ring-1 ring-green-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`
    - Inactive (`VÔ HIỆU HÓA`): `bg-red-50 text-red-700 ring-1 ring-red-600/20 px-2.5 py-1 text-xs font-semibold rounded-md`

---

## 4. Empty & Error States
- **No Matching Results State**:
  - Container: `td colSpan={8} px-4 py-10 text-center text-sm text-slate-500`
  - Text: `Không tìm thấy nhân viên bảo vệ phù hợp.`
- **API Error State**:
  - Container: `td colSpan={8} px-4 py-10 text-center text-sm text-red-600`
  - Text: `Không thể tải danh sách bảo vệ`

---

## 5. Pagination Bar
- **Container**: `flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between`
- **Result Counter**: `Hiển thị 1-10 trong số 25 kết quả`
- **Page Nav Controls**:
  - Previous Button: `h-8 w-8 flex items-center justify-center border border-slate-300 hover:bg-gray-300` (`ChevronLeft`)
  - Current Page Indicator: `h-8 min-w-8 bg-sky-400 px-2 text-sm font-semibold text-white`
  - Total Pages Indicator: `/ 3`
  - Next Button: `h-8 w-8 flex items-center justify-center border border-slate-300 hover:bg-gray-300` (`ChevronRight`)
