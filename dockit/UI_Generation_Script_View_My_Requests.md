# UI Generation Script: View My Requests (Customer)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **View My Requests** page for Customers (`/my-requests`).

---

## 1. Page Header Section
- **Container**: `flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-outline-variant/30`
- **Icon Badge**:
  - Layout: `w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-2xs`
  - Icon: `Calendar` (size `w-6 h-6`)
- **Title Block**:
  - Main Title: `text-xl font-bold text-on-surface font-headline leading-tight` (`Yêu cầu của tôi`)
  - Subtitle: `text-xs text-on-surface-variant/80 font-body` (`Quản lý và theo dõi tiến độ các yêu cầu dịch vụ bảo vệ đã gửi`)

---

## 2. Filters Bar Component (`BookingFilters`)
- **Container**: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-4 shadow-2xs space-y-3`
- **Grid Layout**: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`
- **Search Input**:
  - Container: `relative flex-1`
  - Icon: Left search icon `Search` (`w-4 h-4 text-on-surface-variant/60 absolute left-3 top-1/2 -translate-y-1/2`)
  - Input Field: `w-full pl-9 pr-4 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-on-surface-variant/50 transition-all`
  - Placeholder: `Tìm kiếm mã YC, tên công ty...`
- **Status Filter Dropdown**:
  - Select Field: `w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer`
  - Options: `Tất cả trạng thái`, `Mới (Chờ xử lý)`, `Đang khảo sát`, `Đã báo giá`, `Đã chấp nhận`, `Từ chối`, `Đã hủy`
- **Date Range Filters (Start & End Date)**:
  - Input Fields: `w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/30 rounded-xl text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary`

---

## 3. Data Table Component (`BookingTable`)
- **Table Container**: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl overflow-hidden shadow-2xs`
- **Header Row**:
  - Classes: `bg-surface-container-low/60 border-b border-outline-variant/30 text-left text-xs font-bold text-on-surface-variant uppercase tracking-wider`
  - Columns: `Mã YC`, `Công ty bảo vệ`, `Dịch vụ`, `Thời gian thực hiện`, `Trạng thái`, `Thao tác`
- **Body Rows**:
  - Row Styling: `border-b border-outline-variant/20 hover:bg-surface-container-low/30 transition-colors text-xs text-on-surface`
  - Request Code Cell: `font-mono font-bold text-primary hover:underline cursor-pointer`
  - Company Cell: Flex row with company name and location badge.
  - Date Cell: Format `DD/MM/YYYY - DD/MM/YYYY`.
  - Status Badge Styling:
    - New / Pending: `bg-blue-50 text-blue-700 border-blue-200 px-2.5 py-1 text-xs font-semibold rounded-full border`
    - Surveying: `bg-amber-50 text-amber-700 border-amber-200 px-2.5 py-1 text-xs font-semibold rounded-full border`
    - Quoted: `bg-purple-50 text-purple-700 border-purple-200 px-2.5 py-1 text-xs font-semibold rounded-full border`
    - Accepted: `bg-emerald-50 text-emerald-700 border-emerald-200 px-2.5 py-1 text-xs font-semibold rounded-full border`
    - Rejected / Canceled: `bg-red-50 text-red-700 border-red-200 px-2.5 py-1 text-xs font-semibold rounded-full border`
  - Action Cell:
    - View Detail Button: `px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-lg border border-outline-variant/40 transition-colors flex items-center gap-1 cursor-pointer`

---

## 4. Empty & Loading States
- **Loading State**:
  - Card: `bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-2xs`
  - Spinner: `inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2`
  - Text: `Đang tải danh sách yêu cầu dịch vụ của tôi...`
- **Empty State**:
  - Container: `bg-surface-container-lowest border border-outline-variant/30 rounded-2xl p-12 text-center space-y-3`
  - Icon: `Inbox` (size `w-12 h-12 text-on-surface-variant/40 mx-auto`)
  - Title: `Chưa có yêu cầu dịch vụ nào`
  - Message: `Bạn chưa gửi yêu cầu thuê dịch vụ bảo vệ nào. Hãy tìm kiếm công ty bảo vệ và gửi yêu cầu đầu tiên!`

---

## 5. Pagination Component
- **Layout**: `flex items-center justify-between px-6 py-4 border-t border-outline-variant/30 bg-surface-container-lowest`
- **Counter Text**: `text-xs text-on-surface-variant/80` (`Hiển thị 1-8 trên tổng số 15 yêu cầu`)
- **Page Buttons**: `flex items-center gap-1.5`
  - Active Page: `px-3 py-1 bg-primary text-on-primary font-bold rounded-lg text-xs`
  - Inactive Pages / Prev / Next: `px-3 py-1 bg-surface-container-low hover:bg-surface-container text-on-surface font-medium rounded-lg text-xs border border-outline-variant/30 transition-colors cursor-pointer`
