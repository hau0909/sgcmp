# UI Generation Script: Update Request Verification

This script provides a highly detailed, component-level UI specification for the **Update Request Verification** report form elements used by the Coordinator as shown in Image 4.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Colors**:
  - Main Action Button: `bg-[#004080] hover:bg-[#003366] text-white font-semibold shadow-sm`.
  - Input Textarea: `bg-white border-gray-200 focus:border-sky-500 focus:ring- sky-500`.
  - Dropzone inactive: `border-2 border-dashed border-gray-200 text-gray-400 bg-white hover:border-sky-500 hover:bg-sky-50/30`.
  - Dropzone active: `border-2 border-dashed border-sky-500 bg-sky-50/50 text-sky-700`.
  - Delete overlay button: `bg-black/50 hover:bg-red-600 text-white`.

---

## 2. Component 1: Section Header & Layout Grid
- **Main Card Title**: `text-base font-bold text-gray-900 flex items-center gap-2`. (Text: "Báo Cáo Khảo Sát Yêu Cầu").
- **Subtitle**: `text-xs text-gray-500 font-normal mt-0.5`. (Text: "Điền thông tin khảo sát và đính kèm hình ảnh thực tế tại mục tiêu").
- **Status Pill**: `border border-amber-300 bg-amber-50/60 text-amber-700 font-bold text-[11px] px-2.5 py-1 rounded-md uppercase tracking-wider`. (Text: "TRẠNG THÁI: CHỜ DUYỆT").
- **Form Layout**: `grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6`.

---

## 3. Component 2: Description Textarea (MÔ TẢ HIỆN TRẠNG)
- **Label**: `block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2`. (Text: "MÔ TẢ HIỆN TRẠNG").
- **Textarea Element**: `w-full h-36 p-3.5 border border-gray-200 rounded-xl bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 shadow-sm focus:outline-none transition-all text-xs text-gray-900 placeholder-gray-400 leading-relaxed`.
- **Placeholder**: `Nhập mô tả chi tiết về hiện trạng khu vực khảo sát...`.

---

## 4. Component 3: Image Upload Dropzone (HÌNH ÁNH KHẢO SÁT)
- **Header Label**: `block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2`. (Text: "HÌNH ÁNH KHẢO SÁT (0)").
- **Empty Upload Dropzone Box**: `w-full h-36 border-2 border-dashed border-gray-200 rounded-xl bg-white text-gray-400 hover:border-sky-500 hover:text-sky-600 hover:bg-sky-50/30 cursor-pointer flex flex-col items-center justify-center transition-all p-4`.
- **Icon**: `FileImage` or `Image` (`w-8 h-8 opacity-40 mb-2`).
- **Upload Helper Text**: `text-xs font-medium text-gray-500 text-center`. (Text: "Kéo thả hoặc bấm nút để tải ảnh lên").
- **Thumbnails Grid (When images uploaded)**: `grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3`.
- **Delete Image Button**: `absolute top-1.5 right-1.5 bg-black/50 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm` (`X` icon `w-3.5 h-3.5`).

---

## 5. Component 4: Submit Action Footer
- **Container**: `pt-4 mt-6 border-t border-gray-100 flex items-center justify-end`.
- **Submit Button**: `px-4 py-2 text-xs font-semibold text-white bg-[#004080] hover:bg-[#003366] rounded-lg transition-all active:scale-95 flex items-center gap-2 shadow-sm`.
- **Icon**: `Check` (`w-4 h-4 text-white`).
- **Button Text**: `✓ Cập nhật thông tin khảo sát`.

