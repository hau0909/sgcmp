# UI Generation Script: View Shift Substitute Requests (Coordinator)

This script provides a detailed, component-level UI specification for implementing the **View Shift Substitute Requests** page for Coordinators.

---

## 1. Page Header Section
- **Container**: `mb-6 flex items-start justify-between gap-4`
- **Title Block**:
  - Main Title: `text-2xl font-bold text-slate-950` (`Quản lý yêu cầu thay ca`)
  - Subtitle: `mt-1 text-sm text-slate-600` (`Xét duyệt các yêu cầu xin thay ca từ bảo vệ và chỉ định bảo vệ thay thế.`)
- **Refresh Button**:
  - Styling: `flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-blue-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900`
  - Left Icon: `RefreshCw` (`h-4 w-4`)
  - Label: `Làm mới`

---

## 2. Filter Tabs & Search Bar Section
- **Container**: `flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200`
- **Status Filter Tabs Group**:
  - Container: `flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl`
  - Tab Button Base: `flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer`
  - Active Tab: `bg-white text-blue-900 shadow-xs`
  - Inactive Tab: `text-slate-600 hover:text-slate-900`
  - Count Pill Badge (Active): `rounded-full bg-blue-100 px-2 py-0.2 text-[10px] font-extrabold text-blue-800`
  - Count Pill Badge (Inactive): `rounded-full bg-slate-200 px-2 py-0.2 text-[10px] font-extrabold text-slate-600`
  - Tabs List: `Tất cả` (All), `Chờ duyệt` (Pending), `Đã duyệt` (Approved), `Từ chối` (Rejected)
- **Keyword Search Input**:
  - Container: `relative min-w-[260px]`
  - Left Icon: `Search` (`absolute left-3.5 top-2.5 h-4 w-4 text-slate-400`)
  - Input Field: `w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all`
  - Placeholder: `Tìm theo tên bảo vệ, lý do...`

---

## 3. Substitute Requests List Component
- **List Container**: `grid gap-4`
- **Request Card Component**: `rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all space-y-4`
  - **Card Header**:
    - Avatar Image: Circle image `h-10 w-10 rounded-full border border-slate-200 object-cover` or fallback user icon.
    - Requester Name: `font-bold text-sm text-slate-900`
    - Submission Details: `text-[11px] text-slate-500` (Phone number & submission timestamp)
    - Status Badges:
      - Pending (`Chờ duyệt`): `bg-amber-50 text-amber-700 border-amber-200` with `Hourglass` icon (`h-3.5 w-3.5`)
      - Approved (`Đã duyệt`): `bg-emerald-50 text-emerald-700 border-emerald-200` with `CheckCircle2` icon (`h-3.5 w-3.5`)
      - Rejected (`Đã từ chối`): `bg-rose-50 text-rose-700 border-rose-200` with `XCircle` icon (`h-3.5 w-3.5`)
      - Cancelled (`Đã hủy`): `bg-slate-50 text-slate-600 border-slate-200` with `AlertCircle` icon (`h-3.5 w-3.5`)
  - **Reason Block**: `text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100` displaying substitution reason in italic text.
  - **Rejection Reason Block** (if rejected): `p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800`.
  - **Requested Shift Cards Grid**: `grid gap-2 sm:grid-cols-2`
    - Shift Item Box: `p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5`
    - Shift Header: Shift Name (`font-bold text-slate-900 truncate`) and Date Pill Badge (`text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md`).
    - Company Name: `flex items-center gap-1 text-blue-800 font-semibold text-[11px]` with `Building2` icon.
    - Time Slot: `flex items-center gap-1 text-slate-500 text-[11px]` with `Clock` icon.
    - Location: `flex items-center gap-1 text-slate-500 text-[11px]` with `MapPin` icon.
    - Replacement Guard Tag: `pt-1.5 border-t border-slate-100 flex items-center justify-between` showing replacement guard name badge (`bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200`) or "Chưa chọn".

---

## 4. Empty & Loading States
- **Loading State Component**:
  - Container: `flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs`
  - Spinner Icon: `Loader2` (`h-10 w-10 animate-spin text-blue-600 mb-3`)
  - Text: `Đang tải danh sách yêu cầu thay ca...`
- **Empty Requests List State**:
  - Container: `rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs`
  - Icon: `FileText` (`mx-auto h-12 w-12 text-slate-300 mb-3`)
  - Title: `Không có yêu cầu thay ca nào`
  - Description: `Chưa có bảo vệ nào tạo yêu cầu thuộc bộ lọc hiện tại.`
