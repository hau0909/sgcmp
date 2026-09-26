# UI Generation Script: View Company Details Page

This script provides a highly detailed, component-level UI specification tailored for AI-assisted design generators (such as Stitch) or front-end developers to recreate the complete **Company Details Screen (Hồ Sơ Công Ty)** matching the production design and layout in `d:\SEP490\dev\src\app\companies\[id]\page.tsx`.

---

## 1. Context & Theme Settings
- **Theme Framework**: Material Design 3 tokens mapped to Tailwind CSS standard/utility classes.
- **Typography**: Inter / Roboto sans with clean tracking, uppercase eyebrow labels (`tracking-widest`), variable font weights (medium, semibold, bold), and monospaced font for IDs/Tax numbers (`font-mono`).
- **Colors**:
  - `bg-surface`: Main page background color (`#FAFAFA` or CSS variable `--color-surface`).
  - `bg-surface-container`: Light container cards background.
  - `bg-surface-container-low` / `bg-surface-container-lowest`: Slightly shaded or clean white card containers.
  - `bg-surface-container-high` / `bg-surface-container-highest`: Accent skeleton and backdrop colors.
  - `text-on-surface`: Primary text color (`text-slate-900` or `--color-on-surface`).
  - `text-on-surface-variant`: Secondary/muted text color (`text-slate-600` or `--color-on-surface-variant`).
  - `text-primary` / `bg-primary`: Brand blue primary accent (`#006699` / `#0284C7`).
  - `text-on-primary`: Text on primary button (`#FFFFFF`).
  - `border-outline-variant`: Light gray border color (`border-slate-200` or `--color-outline-variant`).
  - `text-amber-400` / `text-amber-500`: Star rating and verification ring highlight color.

---

## 2. Page Container & Layout Overview
- **Global Page Wrapper**: `flex flex-col min-h-screen bg-surface`.
- **Top Navigation Bar**: Synchronized Application `Header` fixed/sticky at page top.
- **Main Container**: `flex-1 flex flex-col pt-20 pb-16 px-4 md:px-20 max-w-4xl mx-auto space-y-8 pb-12`.
- **Footer**: Synchronized Application `Footer` at page bottom.

---

## 3. Component 1: Brand Hero Header (`CompanyDetailHeader`)
- **Container Styling**:
  - `w-full relative rounded-2xl overflow-hidden shadow-xs`.
- **Hero Background Banner Box**:
  - Dimensions: `relative h-64 sm:h-72 w-full overflow-hidden`.
  - Gradient Background: `bg-gradient-to-r from-primary via-primary-container to-secondary`.
  - Background Image: Banner image (`object-cover w-full h-full opacity-80 animate-fade-in`) or SVG pattern overlay (`bg-grid-pattern opacity-15`).
  - Overlay Shader: Dark bottom gradient `absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20`.
- **Top Eyebrow Row**:
  - Placement: `absolute top-6 left-6 right-6 flex justify-between items-center z-10`.
  - Eyebrow Tag (Left): `text-white/75 text-[11px] font-semibold tracking-widest uppercase`.
    - Text: `HỒ SƠ ĐƠN VỊ CUNG CẤP DỊCH VỤ BẢO VỆ`.
  - Verification Badge (Right): `flex items-center gap-1.5 text-amber-300 text-xs font-medium`.
    - Content: Icon `Check` (`✓`) + Text: `Đã xác minh`.
- **Bottom Profile Header Row**:
  - Placement: `absolute left-6 right-6 bottom-6 flex flex-col sm:flex-row sm:items-end gap-5 z-10`.
  - **Logo Avatar Circle**:
    - Styling: `w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-amber-400/90 object-cover shadow-md bg-surface-container-lowest shrink-0`.
    - Fallback: Icon `Shield` (`w-9 h-9 text-amber-300 stroke-[1.8]`) centered inside `bg-primary text-on-primary rounded-full`.
  - **Company Title Block**:
    - Name Heading: `text-2xl sm:text-3.5xl font-bold text-white tracking-tight leading-tight`.
      - Text: `[Tên Công Ty]` (e.g. `Sentinel Prime Security Corp`).
    - Subtitle Info line: `text-white/80 text-xs sm:text-sm mt-1.5 font-normal`.
      - Text: `Dịch vụ an ninh chuyên nghiệp · Hoạt động trên nền tảng từ 2024 · Thành phố Hồ Chí Minh`.

---

## 4. Component 2: Editorial Stat Line & Action Bar
- **Container Styling**:
  - Layout: `py-4 border-b border-outline-variant/60 flex flex-wrap items-center justify-between gap-4`.
- **Stats Group** (Left Side):
  - Spacing: `flex items-center gap-5 sm:gap-8 flex-wrap`.
  - **Stat Item 1: Average Rating**:
    - Container: `pr-5 sm:pr-8 border-r border-outline-variant/40`.
    - Value: `text-xl sm:text-2xl font-bold text-on-surface flex items-baseline gap-1`.
      - Text: `4.8` + Icon `★` (`text-amber-500 text-sm`).
    - Label: `text-[11.5px] text-on-surface-variant mt-0.5` -> `12 đánh giá`.
  - **Stat Item 2: Completed Contracts**:
    - Container: `pr-5 sm:pr-8 border-r border-outline-variant/40`.
    - Value: `text-xl sm:text-2xl font-bold text-on-surface` -> `45`.
    - Label: `text-[11.5px] text-on-surface-variant mt-0.5` -> `hợp đồng hoàn thành`.
  - **Stat Item 3: Active Guarding Goals**:
    - Value: `text-xl sm:text-2xl font-bold text-on-surface` -> `18`.
    - Label: `text-[11.5px] text-on-surface-variant mt-0.5` -> `mục tiêu đang bảo vệ`.
- **Action Buttons Group** (Right Side):
  - Container: `ml-auto flex items-center gap-3`.
  - **Chat Button**:
    - Classes: `border border-primary text-primary hover:bg-primary/10 font-semibold px-4.5 py-2.5 rounded-lg text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-2xs active:scale-98`.
    - Left Icon: `MessageSquare` (`w-4 h-4 text-primary`).
    - Label Text: `Chat với công ty`.
  - **Book Service Button**:
    - Classes: `bg-primary text-on-primary hover:bg-primary/90 font-semibold px-6 py-2.5 rounded-lg text-xs sm:text-sm transition-all cursor-pointer shadow-xs active:scale-98`.
    - Label Text: `Đặt dịch vụ`.

---

## 5. Component 3: About Company / Brand Story (`CompanyDetailAbout`)
- **Container Styling**:
  - `py-8 border-b border-outline-variant/60`.
- **Eyebrow Title**:
  - Classes: `text-[11px] font-bold tracking-widest text-primary uppercase mb-2`.
  - Text: `VỀ CHÚNG TÔI`.
- **Description Body Content**:
  - Classes: `space-y-3.5 text-on-surface-variant text-sm sm:text-base font-normal leading-relaxed text-justify`.
  - Paragraphs: Multi-paragraph text describing company profile, history, mission, and guarding standards.

---

## 6. Component 4: Company Activity Photos Gallery (`CompanyDetailGallery`)
- **Container Styling**:
  - `py-8 border-b border-outline-variant/60`.
- **Section Headers**:
  - Eyebrow: `text-[11px] font-bold tracking-widest text-primary uppercase mb-1` -> `HÌNH ÁNH HOẠT ĐỘNG`.
  - Heading: `text-2xl font-bold text-on-surface mb-4` -> `Xem thêm`.
- **Bento Grid Layout**:
  - Grid setup: `grid grid-cols-1 md:grid-cols-3 gap-3.5`.
  - **Left Featured Image Card (Spans 2 columns on desktop)**:
    - Classes: `md:col-span-2 relative h-56 sm:h-64 md:h-[312px] rounded-2xl overflow-hidden group cursor-pointer bg-surface-container-high shadow-xs`.
    - Hover animation: `group-hover:scale-103 transition-transform duration-300`.
    - Caption Overlay: `absolute inset-x-0 bottom-0 p-3 sm:p-4 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end`. Text: `[Tên Công Ty] - Hình ảnh 1` (`text-white text-xs sm:text-sm font-medium`).
  - **Right Column Stack (1 column, 2 stacked images)**:
    - Container: `md:col-span-1 grid grid-cols-2 md:grid-cols-1 gap-3.5`.
    - **Card 2**: `relative h-36 sm:h-40 md:h-[149px] rounded-xl overflow-hidden group cursor-pointer bg-surface-container-high shadow-xs`.
    - **Card 3 (with "+N photos" Overlay if total > 3)**:
      - Container: `relative h-36 sm:h-40 md:h-[149px] rounded-xl overflow-hidden group cursor-pointer bg-surface-container-high shadow-xs`.
      - Overlay Badge: `absolute inset-0 bg-black/75 backdrop-blur-[2px] flex flex-col items-center justify-center text-white transition-colors group-hover:bg-black/80 p-2 text-center`.
      - Number Text: `text-2xl sm:text-3xl font-extrabold tracking-tight leading-none` -> `+5`.
      - Subtitle Label: `text-[11px] font-semibold text-white/90 mt-1` -> `Xem tất cả 8 ảnh`.
- **Fullscreen Lightbox Carousel Modal**:
  - Backdrop: `fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 animate-in fade-in`.
  - Header Row: Photo counter pill (`Camera` icon + `Hình ảnh X / Y`) and close button (`X` icon).
  - Center Navigation Stage: `ChevronLeft` and `ChevronRight` circular backdrop buttons (`bg-black/60 border border-white/20 text-white p-3 rounded-full`), main centered image (`max-h-[70vh] rounded-2xl`).
  - Bottom Thumbnail Strip: Horizontal scrollable strip of small image thumbnails with active border ring (`border-2 border-amber-400`).

---

## 7. Component 5: Legal Credentials & Representative Strip (`CompanyDetailLegalInfo`)
- **Container Styling**:
  - `py-8 border-b border-outline-variant/60`.
- **Section Headers**:
  - Eyebrow: `text-[11px] font-bold tracking-widest text-primary uppercase mb-1` -> `HỒ SƠ PHÁP LÝ`.
  - Title: `text-2xl font-bold text-on-surface mb-4` -> `Thông tin cơ bản`.
- **Editorial Credential Rows**:
  - Container: `divide-y divide-outline-variant/40`.
  - **Row Item**: `py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm`.
    - Label column: `text-on-surface-variant shrink-0 sm:w-48`.
    - Value column: `font-semibold text-on-surface sm:text-right`.
  - **Fields Included**:
    1. **Tên doanh nghiệp**: Company legal name.
    2. **Mã số thuế**: Business license / Tax code (`font-mono font-semibold text-on-surface`).
    3. **Trụ sở chính**: Registered headquarters full address.
    4. **Liên hệ công ty**: Direct phone & email (`font-mono text-on-surface`).
    5. **Phạm vi hoạt động**: Operating scope & regions (`font-medium text-on-surface`).
- **Representative Card Block (Bottom Section)**:
  - Container: `mt-6 pt-4 border-t border-outline-variant/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`.
  - **Left Side**: Rep Avatar & Name:
    - Avatar Circle: `w-11 h-11 rounded-full object-cover border border-outline-variant/60 shadow-2xs shrink-0` (or fallback initials block `bg-primary text-on-primary font-bold text-xs`).
    - Title Block: Name (`text-sm font-bold text-on-surface`), Role Subtitle (`text-xs text-on-surface-variant` -> `Người đại diện liên hệ`).
  - **Right Side**: Direct Contact Details:
    - Layout: `text-xs text-on-surface-variant sm:text-right font-mono leading-relaxed`.
    - Phone & Email text.

---

## 8. Component 6: Services Provided Catalog (`CompanyDetailServices`)
- **Container Styling**:
  - `py-8 border-b border-outline-variant/60`.
- **Section Headers**:
  - Eyebrow: `text-[11px] font-bold tracking-widest text-primary uppercase mb-1` -> `DANH MỤC`.
  - Title: `text-2xl font-bold text-on-surface mb-4` -> `Dịch vụ chính`.
- **Service Item Rows**:
  - Container: `divide-y divide-outline-variant/40`.
  - Item Layout: `py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 group`.
  - **Left Section**: Service Icon & Descriptions:
    - Service Type Icon Badge: `w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5`.
      - Dynamic Icons: `Building2` (Office/Building), `Home` (Residential), `Calendar` (Event), `Warehouse` (Factory/Warehouse), or `Shield` (General).
    - Service Name: `text-base font-bold text-on-surface leading-tight`.
    - Base Category Description: `text-xs sm:text-sm font-medium text-primary leading-relaxed max-w-xl mt-1`.
    - Specific Implementation Note: `text-xs sm:text-sm text-on-surface-variant leading-relaxed max-w-xl mt-1`.
  - **Right Section**: Reference Price Box:
    - Alignment: `sm:text-right shrink-0 pl-12 sm:pl-0 pt-0.5`.
    - Label: `text-[11px] font-medium text-on-surface-variant block leading-none mb-1` -> `Giá tham khảo`.
    - Price Value: `text-base font-bold text-primary whitespace-nowrap block leading-tight` -> `Từ 25.000đ/giờ` or `Liên hệ báo giá`.
    - Subtext Note: `text-[10.5px] text-on-surface-variant/75 block mt-1 leading-none` -> `(Tùy quy mô & giờ trực)`.

---

## 9. Component 7: Client Reviews & Ratings (`CompanyDetailReviews`)
- **Container Styling**:
  - `py-8 border-b border-outline-variant/60`.
- **Section Headers**:
  - Eyebrow: `text-[11px] font-bold tracking-widest text-primary uppercase mb-1` -> `PHẢN HỒI THỰC TẾ`.
  - Title: `text-2xl font-bold text-on-surface mb-3` -> `Đánh giá từ khách thuê`.
- **Rating Summary Line**:
  - Layout: `flex flex-wrap items-center gap-2.5 mb-6 text-sm`.
  - Large Score Text: `text-2xl sm:text-3xl font-bold text-on-surface leading-none` -> `4.8`.
  - Lucide Stars Bar: `flex items-center gap-0.5` (`Star` and `StarHalf` filled with `fill-amber-400 text-amber-400`).
  - Count Summary Label: `text-on-surface-variant text-xs sm:text-sm` -> `12 đánh giá · 45 hợp đồng đã hoàn thành`.
- **Testimonial 2-Column Grid**:
  - Layout: `grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6`.
  - **Review Card**:
    - Layout: `py-5 flex flex-col group border-b border-outline-variant/40 md:border-b-0`.
    - Star Rating Row: `flex items-center gap-1.5 mb-2` (Lucide Stars + rating score `text-xs font-bold text-on-surface`).
    - Comment Paragraph: `text-base text-on-surface leading-relaxed text-justify font-normal line-clamp-3`.
    - Expand Toggle: `underline font-semibold text-xs text-primary mt-1 text-left w-fit cursor-pointer` -> `Xem thêm`.
    - Author & Metadata Row:
      - Left: Avatar (`w-8 h-8 rounded-full border border-outline-variant/30`), Customer Name (`text-xs font-bold text-on-surface`), Date Tag (`text-[11.5px] text-on-surface-variant` -> `Tháng 07/2024`).
      - Right: Hired Service Badge (`text-xs font-medium text-emerald-700` -> `✓ Bảo vệ tòa nhà văn phòng`).
- **Load More / Collapse Action**:
  - Alignment: `mt-8 flex justify-center`.
  - Button: `px-6 py-2.5 border border-outline-variant text-on-surface rounded-lg font-medium text-xs hover:bg-surface-container transition-colors cursor-pointer shadow-2xs`.
  - Text: `Xem thêm đánh giá (6)` / `Thu gọn`.

---

## 10. Component 8: New Booking Request Modal (`NewBookingModal`)
- **Backdrop Overlay**:
  - Classes: `fixed inset-0 bg-slate-900/60 z-[60] flex justify-center items-center p-4 backdrop-blur-xs transition-opacity duration-200`.
- **Modal Dialog Box**:
  - Classes: `bg-surface-container-lowest text-on-surface border border-outline-variant rounded-2xl shadow-2xl w-full max-w-[760px] max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200`.
- **Modal Header**:
  - Layout: `px-6 py-4.5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30 shrink-0`.
  - Title: `text-[20px] font-bold text-on-surface tracking-tight` -> `Gửi Yêu Cầu Đặt Dịch Vụ Bảo Vệ`.
  - Subtitle: `text-xs text-on-surface-variant mt-0.5 font-medium` -> `Đơn vị nhận yêu cầu: Sentinel Prime Security Corp`.
  - Close Icon Button: `X` icon inside `p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low`.
- **Scrollable Form Body (`flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6`)**:
  - **Section 1: Thông tin dịch vụ & Vị trí**:
    - Section Header: `flex items-center gap-2 border-b border-outline-variant/60 pb-2` with left primary indicator bar (`w-1 h-4 bg-primary rounded-full`).
    - Service Type Select: Dropdown input (`select`) with icon `Briefcase` and price preview.
    - Location Selects: City Dropdown (`select`), Ward Dropdown (`select`), Specific Address Input (`input text`).
  - **Section 2: Kế hoạch & Lịch trình làm việc**:
    - Date Inputs: Start Date (`input date`), End Date (`input date`).
    - Guard Counter Box: Decrement button (`Minus`), Guards Count display (`X bảo vệ`), Increment button (`Plus`).
    - Days of Week Selector Bar: Full-width row of 7 day pills (T2-CN: `Monday` - `Sunday`), active state `bg-primary text-on-primary shadow-xs`.
    - Time Slots Add Section: From/To time inputs (`input time`) + Add button (`+ Thêm khung giờ`). Added slot tags with removal button (`Trash2`).
  - **Section 3: Ghi chú & Yêu cầu bổ sung**:
    - Textarea: `w-full bg-surface-bright border border-outline-variant rounded-xl p-3 text-sm resize-none` (`rows={3}`).
- **Modal Footer Action Bar**:
  - Layout: `px-6 py-4 border-t border-outline-variant flex items-center justify-end gap-3 bg-surface-container-low/30 shrink-0`.
  - Cancel Button: `px-5 py-2.5 border border-outline-variant text-on-surface font-semibold text-xs rounded-xl hover:bg-surface-container`.
  - Submit Button: `px-6 py-2.5 bg-primary text-on-primary font-bold text-xs rounded-xl hover:bg-primary/95 shadow-xs flex items-center gap-2`.

---

## 11. Component 9: Authentication Guard Modal & Skeleton States
- **Require Login Modal Dialog**:
  - Overlay: `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4`.
  - Card Box: `bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4`.
  - Header Badge: `w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto` with icon `LogIn`.
  - Title & Text: `Yêu cầu đăng nhập` - `Bạn cần đăng nhập tài khoản để thực hiện gửi yêu cầu đặt dịch vụ bảo vệ.`.
  - Buttons: `Hủy` and `Đăng nhập ngay`.
- **Skeleton Pulse Loader (`CompanyDetailSkeleton`)**:
  - Main Wrapper: `max-w-4xl mx-auto space-y-8 pb-12 animate-pulse`.
  - Hero Skeleton Box: `h-48 sm:h-64 bg-surface-container-high rounded-2xl`.
  - Stat Line Skeleton: Grid of pulsing blocks (`bg-surface-container-high`).
  - Section Content Skeletons: Pulsing title lines and text blocks.
