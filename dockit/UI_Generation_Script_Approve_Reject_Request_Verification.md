# UI Generation Script: Approve/Reject Request Verification

This script provides a highly detailed, component-level UI specification for the **Approve/Reject Request Verification** interactions, including the GHI CHÚ textarea, bottom action buttons (Image 3), and confirmation modal overlays used by Company Admin.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Colors**:
  - GHI CHÚ Textarea: `bg-white border-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500`.
  - Approve Action Button (Footer): `bg-[#004080] hover:bg-[#003366] text-white font-semibold rounded-lg shadow-sm`.
  - Approve Modal Header: `bg-emerald-50 text-emerald-700 border-emerald-100`.
  - Reject Action Button (Footer): `bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-lg font-semibold`.
  - Reject Modal Header: `bg-red-50 text-red-700 border-red-100`.
  - Reject Modal Confirm Button: `bg-red-600 hover:bg-red-700 text-white`.

---

## 2. Component 1: GHI CHÚ Field & Footer Action Buttons (Image 3)
- **GHI CHÚ Textarea**: `w-full h-24 p-3 border border-gray-200 rounded-xl bg-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all text-xs text-gray-900 placeholder-gray-400`.
- **Placeholder**: `Nhập ghi chú phản hồi khảo sát nếu cần...`.
- **Footer Action Buttons Container**: `pt-4 border-t border-gray-100 flex items-center justify-end gap-3`.
- **Reject Button (`✕ Từ chối`)**: `px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`. Includes `X` icon (`w-3.5 h-3.5`).
- **Approve Button (`✓ Duyệt khảo sát`)**: `px-4 py-2 text-xs font-semibold text-white bg-[#004080] hover:bg-[#003366] border border-transparent rounded-lg transition-all active:scale-95 flex items-center gap-1.5 shadow-sm`. Includes `Check` icon (`w-3.5 h-3.5`).

---

## 3. Component 2: Confirmation Dialog Modal
- **Overlay**: `fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200`.
- **Modal Card Box**: `bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-200`.
- **Modal Header**: `p-4 border-b` with conditional color:
  - Approve: `bg-emerald-50 border-emerald-100 text-emerald-700`. Icon `CheckCircle` (`w-5 h-5`). Title: "Xác nhận duyệt khảo sát".
  - Reject: `bg-red-50 border-red-100 text-red-700`. Icon `AlertCircle` (`w-5 h-5`). Title: "Xác nhận từ chối khảo sát".
- **Body Content**: `p-6 space-y-4 text-sm text-gray-600`.
  - Reject Notes Summary Box: `bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs`. Includes note content in italic and warning text `text-red-600 font-medium` ("Hành động này không thể hoàn tác.").
- **Modal Footer**: `p-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-slate-50/50`.
- **Cancel Button**: `px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors`. (Text: "Hủy bỏ").
- **Confirm Button**: `px-4 py-2 text-xs font-bold text-white rounded-lg transition-all flex items-center gap-2`.
  - Approve: `bg-emerald-600 hover:bg-emerald-700` (Text: "Đồng ý duyệt").
  - Reject: `bg-red-600 hover:bg-red-700` (Text: "Xác nhận từ chối").
  - Spinner `Loader2` appears when calling the API.

