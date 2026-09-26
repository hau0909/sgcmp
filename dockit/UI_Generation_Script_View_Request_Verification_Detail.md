# UI Generation Script: View Request Verification Detail Page

This script provides a highly detailed, component-level UI specification for the **View Request Verification Detail Page** layout, header, customer/service info cards, and read-only/editable verification form components matching the actual design.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Typography**: `font-headline` for main titles, `font-body` for standard text, `font-mono` for IDs.
- **Colors**:
  - Background: `bg-slate-50/50`.
  - Cards: `bg-white rounded-2xl border border-gray-200/80 shadow-sm`.
  - Service Type Link: `text-sky-700 font-bold hover:underline`.
  - Day Pills (Selected T2-T6): `bg-[#006699] text-white font-semibold rounded-lg text-xs px-3 py-1.5`.
  - Day Pills (Unselected T7, CN): `bg-slate-100 text-slate-400 font-medium rounded-lg text-xs px-3 py-1.5`.
  - Status Pill (Chờ duyệt): `border border-amber-300 bg-amber-50/60 text-amber-700 font-bold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider`.

---

## 2. Component 1: Breadcrumbs & Page Header
- **Breadcrumbs**: `flex items-center space-x-1.5 text-xs text-gray-500 font-medium mb-1`. Uses `ChevronRight` (`w-3.5 h-3.5`).
  - Text: `Khảo sát` > `Chi tiết #REQ-08494` (Coordinator) or `Chi tiết Khảo sát` > `chi tiết #REQ-08494` (Admin).
- **Header Row**: `flex items-center justify-between gap-4 mb-6`.
- **Title Container**: `flex items-center gap-3`.
- **Title**: `text-2xl font-bold text-gray-900 tracking-tight`. (Text: "Chi tiết Khảo sát Yêu cầu" or "Chi tiết Khảo sát").
- **ID Badge**: `bg-blue-50 text-blue-600 font-semibold px-2.5 py-0.5 rounded-full text-xs border border-blue-100`. (Text: "#REQ-08494").
- **Right Header Action Button**: `inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 transition-all shadow-sm`. (Text: "Xem chi tiết >").

---

## 3. Component 2: Request Info Overview Cards (2-Column Grid)
- **Container**: `grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6`.
- **Card 1: Customer Information Card**:
  - **Header**: `flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 text-sm font-bold text-gray-900`. Uses `Building2` icon (`w-4 h-4 text-sky-700`). Title: "Thông tin khách hàng".
  - **Content Grid**: `grid grid-cols-2 gap-y-4 gap-x-6 text-xs`.
    - **TÊN KHÁCH HÀNG / CÔNG TY**: `text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1` -> Value: `font-bold text-gray-900 text-sm`.
    - **NGƯỜI LIÊN HỆ**: `text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1` -> Value: `font-bold text-gray-900 flex items-center gap-1.5` (`User` icon `w-3.5 h-3.5 text-gray-400`).
    - **SỐ ĐIỆN THOẠI**: `text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1` -> Value: `font-bold text-gray-900 flex items-center gap-1.5` (`Phone` icon `w-3.5 h-3.5 text-gray-400`).
    - **EMAIL**: `text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1` -> Value: `text-sky-600 font-semibold flex items-center gap-1.5` (`Mail` icon `w-3.5 h-3.5 text-gray-400`).
    - **ĐỊA CHỈ TRIỂN KHAI**: `text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1` -> Value: `text-gray-700 flex items-center gap-1.5` (`MapPin` icon `w-3.5 h-3.5 text-gray-400`).
- **Card 2: Service Request Specification Card**:
  - **Header**: `flex items-center gap-2 pb-3 mb-4 border-b border-gray-100 text-sm font-bold text-gray-900`. Uses `Briefcase` icon (`w-4 h-4 text-sky-700`). Title: "Yêu cầu dịch vụ".
  - **Content List**: `space-y-4 text-xs`.
    - **LOẠI DỊCH VỤ**: Value `text-sky-800 font-bold text-sm`.
    - **SỐ LƯỢNG BẢO VỆ**: Value `font-bold text-gray-900 flex items-center gap-1.5` (`Users` icon `w-3.5 h-3.5 text-gray-400`). (Text: "5 nhân sự").
    - **THỜI HẠN THỰC HIỆN**: Value `font-bold text-gray-900 flex items-center gap-1.5` (`Calendar` icon `w-3.5 h-3.5 text-gray-400`). (Text: "22/7/2026 - 31/7/2026").
    - **NGÀY LÀM VIỆC TRONG TUẦN**: `text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2` -> Pills container: `flex items-center gap-1.5 flex-wrap p-1.5 bg-slate-50/80 rounded-xl border border-slate-100`.

---

## 4. Component 3: Verification Report Card
- **Container**: `bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm space-y-6`.
- **Card Header Row**: `flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100`.
- **Title Block**:
  - Admin Title: `Chi tiết Khảo sát`, Subtitle: `Ghi nhận tình trạng thực tế trước khi báo giá`.
  - Coordinator Title: `Báo Cáo Khảo Sát Yêu Cầu`, Subtitle: `Điền thông tin khảo sát và đính kèm hình ảnh thực tế tại mục tiêu`.
- **Status Pill**: `flex items-center gap-2 text-xs font-bold`. (Text: "TRẠNG THÁI: CHỜ DUYỆT").
- **Grid Layout**: `grid grid-cols-1 lg:grid-cols-2 gap-6`.
  - **Left Column**:
    - **MÔ TẢ HIỆN TRẠNG (Admin View - Read Only)**: `bg-slate-50 text-gray-600 border border-slate-200 p-4 rounded-xl text-xs space-y-2 min-h-[96px]`. Icon `FileText` (`w-4 h-4 text-sky-600`).
    - **GHI CHÚ (Admin Input Textarea)**: `w-full h-28 p-3 border border-gray-200 rounded-xl bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-xs text-gray-900 placeholder-gray-400 shadow-sm`.
  - **Right Column**:
    - **HÌNH ÁNH KHẢO SÁT (0)**: `text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3`.
    - **Empty State Box**: `border-2 border-dashed border-gray-200 rounded-xl py-12 flex flex-col items-center justify-center text-gray-400 text-xs`. Icon `FileImage` (`w-8 h-8 text-gray-300 mb-2`). (Text: "Chưa có hình ảnh nào").

