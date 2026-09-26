# UI Generation Script: View Request Verifications

This script provides a highly detailed, component-level UI specification for the **View Request Verifications Page**.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Colors**:
  - `bg-surface-container-lowest`: Main background for cards and inputs.
  - `bg-[#C4E2F5]`: Table header row background.
  - Status Colors: 
    - Approved: `bg-emerald-50 text-emerald-700 border-emerald-200`.
    - Rejected: `bg-red-50 text-red-700 border-red-200`.
    - Pending: `bg-amber-50 text-amber-700 border-amber-200`.

---

## 2. Component 1: Filter Section
- **Container**: `bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]`.
- **Search Input**: 
  - Wrapper: `relative`.
  - Icon: `absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[16px] h-[16px]`.
  - Input: `w-full pl-9 pr-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all`.
- **Status Dropdown**:
  - Select: `w-full pl-3 pr-8 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer`.

---

## 3. Component 2: Data Table
- **Container**: `bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden flex flex-col`.
- **Table Header**: `bg-[#C4E2F5] border-b border-outline-variant`. Cells use `py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap`.
- **Table Row**: `border-b border-outline-variant/30 hover:bg-primary-fixed/30 transition-colors h-[40px]`.
- **Status Badge**: `inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider`.
- **Action Button**: `text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer`. (Text: "Xem chi tiết").

---

## 4. Component 3: Empty & Loading States
- **Loading State**: `flex flex-col items-center justify-center py-16`. Spinner: `w-8 h-8 border-b-2 border-primary rounded-full animate-spin`.
- **Empty State**: `flex flex-col items-center justify-center py-16 text-on-surface-variant bg-surface-bright`. Icon: `ClipboardCheck className="w-12 h-12 opacity-30 mb-3"`.
