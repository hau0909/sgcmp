# UI Generation Script: Update Bank Account Modal

This script provides a highly detailed, component-level UI specification for the **Update Bank Account Dialog Modal** used in the Admin panel. This component shares the same structure as the Add Modal, but with different text labels and pre-filled data.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Backdrop**: Black overlay with 40% opacity and a slight blur effect (`bg-black/40 backdrop-blur-sm`).
- **Colors**:
  - `bg-primary`: Primary blue (`#2c5ead`).
  - `bg-surface`: White (`#ffffff`).
  - `bg-[#eff4ff]`: Light blue for header and cancel button.
  - `text-[#0b1c30]`: Dark text for headings.
  - `text-[#434751]`: Muted text for labels.
  - `border-[#c3c6d3]`: Standard border color.
- **Typography**: `font-headline` for titles, `font-body` for standard labels.

---

## 2. Component 1: Modal Container & Overlay
- **Overlay**: `fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm`.
- **Dialog Box**: `bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden`.

---

## 3. Component 2: Dialog Header
- **Container**: `flex items-center justify-between px-6 py-5 border-b border-[#c3c6d3] bg-[#eff4ff]`.
- **Title**: `text-base font-bold text-[#0b1c30] font-headline` (Text: "Cập nhật tài khoản ngân hàng").
- **Close Button**: `text-[#434751] hover:text-[#0b1c30] p-1 rounded-full hover:bg-[#dce9ff] transition-colors`. Icon: `X` (`w-5 h-5`).

---

## 4. Component 3: Form Body
- **Container**: `px-6 py-5 flex flex-col gap-4`.
- **Note on State**: In "Edit" mode, all input fields below are pre-filled with the existing account's data.

### 4.1 Input Fields (General Styling)
- **Label**: `text-xs font-semibold text-[#434751] font-body`. Includes a red asterisk `<span className="text-red-500">*</span>` for required fields.
- **Input/Select Box**: `h-10 rounded-lg border border-[#c3c6d3] px-3 text-sm text-[#0b1c30] bg-white focus:outline-none focus:border-[#2c5ead] transition-colors`.
- **Helper Text**: `text-[11px] text-[#737785]` placed below the input.

### 4.2 Field: Ngân hàng (Bank Selection)
- **Type**: Select dropdown.
- **Options**: List of popular banks (e.g., MBBank, Vietcombank, etc.).

### 4.3 Field: Tên ngân hàng (Bank Name)
- **Type**: Text input.
- **Behavior**: Auto-filled when a bank is selected from the dropdown, but remains editable.

### 4.4 Field: Số tài khoản (Account Number)
- **Type**: Text input.
- **Helper Text**: "Chỉ nhập các ký tự số (0-9)."

### 4.5 Field: Tên chủ tài khoản (Account Name)
- **Type**: Text input.
- **Styling**: Includes `uppercase` class to transform text visually.
- **Helper Text**: "Chỉ nhập chữ cái và dấu cách. Tên sẽ tự động viết hoa."

### 4.6 Error Message Block
- **Container**: Rendered conditionally above the action buttons if an API error occurs.
- **Styling**: `text-xs text-red-600 font-medium bg-red-50 rounded-lg px-3 py-2`.

---

## 5. Component 4: Dialog Actions (Footer)
- **Container**: `flex justify-end gap-3 pt-1`.
- **Cancel Button**: `px-4 py-2 rounded-lg text-sm font-semibold text-[#434751] bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors`. Text: "Huỷ".
- **Submit Button**: 
  - Base: `px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#2c5ead] hover:bg-[#024594] transition-colors flex items-center gap-2`.
  - Disabled State: `disabled:opacity-60` with a spinner icon (`Loader2 animate-spin`) when loading.
  - Text: "Lưu thay đổi".
