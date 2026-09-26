# UI Generation Script: Complete Contract (Customer)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Complete Contract** elements on the Contract Detail page.

---

## 1. Complete Contract CTA Button (Header)
- **Condition**: Renders in the page header only when the contract status is `active` and `canComplete` is true (contract end date is today or in the past).
- **Styling**:
  - Background & Hover: `bg-emerald-600 hover:bg-emerald-700`
  - Text & Border: `text-white border border-emerald-600 hover:border-emerald-700`
  - Padding & Radius: `px-4 py-2 rounded-lg`
  - Font: `text-sm font-bold`
  - Layout: `flex items-center gap-1.5 shadow-md transition-all duration-100 active:scale-95 cursor-pointer`
  - Icons: Left icon `CheckCircle2` (size `w-4 h-4`)
  - Label: `Hoàn thành hợp đồng`

---

## 2. Complete Contract Confirmation Modal
- **Overlay backdrop**:
  - Classes: `fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in`
- **Modal Box**:
  - Classes: `bg-white rounded-xl border border-[#c3c6d3] max-w-md w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200`
- **Header Layout**:
  - Classes: `bg-[#eff4ff] border-b border-[#acc7ff] px-6 py-4 flex items-center justify-between`
  - Left Section: Flex row with gap-2, green checkmark icon (`CheckCircle` size `w-5 h-5 text-emerald-600`), and modal title: `Xác nhận hoàn thành hợp đồng` (bold, text-dark, font-headline).
  - Close button: `X` icon on the right, gray color, hover dark gray, cursor-pointer.
- **Body Layout**:
  - Classes: `p-6 space-y-3 font-body`
  - Main question: `text-sm text-on-surface-variant leading-relaxed`. Text: `Bạn có chắc chắn muốn xác nhận hoàn thành hợp đồng #{contract.contract_code} không?`
  - Warning/Alert box:
    - Classes: `text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-3 rounded-lg leading-normal flex gap-2`
    - Content: Left checkmark icon, message text: `Lưu ý: Hành động này sẽ chuyển trạng thái của hợp đồng này sang 'Đã hoàn thành'. Hành động này không thể hoàn tác.`
- **Footer Layout**:
  - Classes: `bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-3`
  - Cancel Button:
    - Classes: `px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors rounded text-sm font-semibold cursor-pointer`
    - Label: `Hủy bỏ`
  - Confirm Button:
    - Classes: `px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors rounded text-sm font-semibold cursor-pointer shadow-sm`
    - Label: `Xác nhận`

---

## 3. Post-Completion UI Transitions
Once the API call is successful:
1. **Modal Close**: The confirmation modal is dismissed.
2. **Status Badge Update**:
   - The status badge changes from `Đang hoạt động` (blue) to `Đã hoàn thành`.
   - Badge Styling: `bg-emerald-50 text-emerald-700 border-emerald-300 px-3 py-1 text-xs font-semibold rounded-full border`.
3. **CTA Button Swap**:
   - The "Hoàn thành hợp đồng" button is replaced by the "Đánh giá" (Review) button.
   - Review Button Styling: `bg-primary hover:bg-primary/90 text-on-primary font-bold shadow-md px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 active:scale-95 cursor-pointer` (with left `Star` icon).
