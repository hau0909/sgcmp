# UI Generation Script: Delete Bank Account Modal

This script provides a highly detailed, component-level UI specification for the **Delete Bank Account Confirmation Dialog** used in the Admin panel.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Backdrop**: Black overlay with 40% opacity and a slight blur effect (`bg-black/40 backdrop-blur-sm`).
- **Colors**:
  - `bg-red-600`: Red for destructive actions (`#dc2626`).
  - `bg-red-100`: Light red for warning icons (`#fee2e2`).
  - `text-red-600`: Red text for icons/labels.
  - `bg-surface`: White (`#ffffff`).
  - `bg-[#eff4ff]`: Light blue for cancel button.
  - `text-[#0b1c30]`: Dark text for headings.
  - `text-[#434751]`: Muted text for descriptions.
- **Typography**: `font-headline` for titles, `font-body` for standard text.

---

## 2. Component 1: Modal Container & Overlay
- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm`.
- **Dialog Box**: `bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden`.

---

## 3. Component 2: Dialog Body (Header & Message)
- **Container**: `px-6 py-5 flex flex-col gap-4`.
- **Layout**: `flex items-start gap-4`.
- **Icon Box (Left)**: 
  - Styling: `w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0`.
  - Icon: `Trash2` (`w-5 h-5 text-red-600`).
- **Text Content (Right)**:
  - Title: `text-base font-bold text-[#0b1c30] font-headline` (Text: "Xác nhận xóa tài khoản").
  - Description: `text-sm text-[#434751] mt-1 font-body`.
  - Dynamic Data: Contains the text "Bạn có chắc muốn xóa tài khoản **{account_number}** ({bank_name})?". The account number and bank name are wrapped in `<span className="font-bold text-[#0b1c30]">`.

---

## 4. Component 3: Active Account Warning Banner (Conditional)
- **Visibility**: Rendered *only* if the account being deleted has `is_active` set to `true`.
- **Container**: `flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3`.
- **Icon**: `TriangleAlert` (`w-4 h-4 text-amber-600 shrink-0 mt-0.5`).
- **Text**: `text-sm text-amber-700 font-medium`.
- **Content**: "<span className="font-bold">Cảnh báo:</span> Đây là tài khoản đang <span className="font-bold">hoạt động</span>. Sau khi xóa, chức năng thanh toán sẽ tạm thời ngưng hoạt động."

---

## 5. Component 4: Dialog Actions (Footer)
- **Container**: `flex justify-end gap-3 pt-1`.
- **Cancel Button**: 
  - Base: `px-4 py-2 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors`. 
  - Text: "Huỷ".
- **Delete Confirm Button**: 
  - Base: `px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-2`.
  - Disabled State: `disabled:opacity-60` with a spinner icon (`Loader2 animate-spin`) when loading.
  - Text: "Xóa tài khoản".
