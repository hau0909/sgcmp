# UI Generation Script: Confirm/Deny Quotation (Customer)

This script provides a focused, component-level UI specification for AI-assisted design generators (such as Stitch) or front-end developers to implement the **Confirm / Deny Quotation** elements on the Customer Request Detail page (`/my-requests/[id]`).

---

## 1. Customer Quotation Panel & Action Buttons
- **Condition**: Renders inside the Quotation Panel on `/my-requests/[id]` when `viewMode === "customer"` and request status is `quoted` or `pending`.
- **Panel Container**:
  - Classes: `bg-surface-container rounded-2xl border border-outline-variant/30 p-6 shadow-sm`
- **Quotation Summary Card**:
  - Classes: `p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 mb-6 space-y-3`
  - Total Quoted Price Display:
    - Label: `text-xs font-semibold text-on-surface-variant` ("Tổng tiền báo giá:")
    - Amount: `text-xl font-bold text-primary font-mono` (e.g., `15,000,000 đ`)
  - Quotation Breakdown Badges:
    - Package / Hourly / Monthly badge: `inline-flex items-center gap-1 px-2.5 py-1 bg-primary-container text-on-primary-container text-xs font-semibold rounded-md`
- **Action Buttons Layout**:
  - Classes: `flex flex-col sm:flex-row gap-3 mt-6`
  - **Accept Quotation CTA Button**:
    - Styling: `w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer`
    - Left Icon: `Send` (size `w-4 h-4 shrink-0`)
    - Label: `Đồng ý báo giá`
  - **Deny / Reject Quotation Button**:
    - Styling: `w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer`
    - Left Icon: `XCircle` (size `w-4 h-4 shrink-0`)
    - Label: `Từ chối báo giá`

---

## 2. Accept Quote Confirmation Modal
- **Overlay Backdrop**:
  - Classes: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200`
- **Modal Box**:
  - Classes: `bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200`
- **Body Section**:
  - Layout: `p-6 text-center`
  - Icon: Green checkmark badge (`w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto mb-4 flex items-center justify-center`), Icon `CheckCircle` (`w-6 h-6`).
  - Title: `text-lg font-bold text-on-surface mb-2 font-headline` (`Xác nhận đồng ý báo giá`)
  - Description: `text-sm text-on-surface-variant/80 font-body mb-3` (`Bạn có chắc chắn muốn chấp nhận báo giá này không? Hợp đồng sẽ được tự động khởi tạo.`)
  - Price Preview Box: `p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface flex justify-between items-center`
    - Label: `Tổng tiền báo giá:`
    - Amount: `font-mono text-primary font-bold text-sm`
- **Footer Buttons**:
  - Classes: `flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30`
  - Cancel Button: `flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm cursor-pointer` (`Đóng`)
  - Confirm Button: `flex-1 py-2.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary transition-all active:scale-95 text-sm cursor-pointer shadow-sm` (`Xác nhận đồng ý`)

---

## 3. Deny / Reject Quote Confirmation Modal
- **Overlay Backdrop**:
  - Classes: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200`
- **Modal Box**:
  - Classes: `bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200`
- **Body Section**:
  - Layout: `p-6 text-center`
  - Icon: Red warning circle (`w-12 h-12 rounded-full bg-error/10 text-error mx-auto mb-4 flex items-center justify-center`), Icon `AlertTriangle` (`w-6 h-6`).
  - Title: `text-lg font-bold text-on-surface mb-2 font-headline` (`Từ chối báo giá`)
  - Description: `text-sm text-on-surface-variant/80 font-body` (`Bạn có chắc chắn muốn từ chối báo giá này không? Hành động này không thể hoàn tác.`)
- **Footer Buttons**:
  - Classes: `flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30`
  - Cancel Button: `flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm cursor-pointer` (`Đóng`)
  - Confirm Button: `flex-1 py-2.5 px-4 rounded-xl font-bold bg-error hover:bg-error/90 text-white transition-all active:scale-95 text-sm cursor-pointer shadow-sm` (`Xác nhận từ chối`)

---

## 4. Post-Action UI Transitions
1. **On Accept Success**:
   - Modal closes automatically.
   - Success Toast message appears: `"Đã chấp nhận báo giá và khởi tạo hợp đồng thành công!"`.
   - Action buttons ("Đồng ý báo giá" / "Từ chối báo giá") are hidden.
   - Status badge updates to `Đã chấp nhận` (`bg-emerald-50 text-emerald-700 border-emerald-300`).
   - A direct action link button `"Xem hợp đồng"` (`/my-contracts/[id]`) is rendered.
2. **On Deny Success**:
   - Modal closes automatically.
   - Success Toast message appears: `"Yêu cầu đặt lịch đã bị từ chối thành công."`.
   - Action buttons are removed.
   - Status badge transitions to `Từ chối` (`bg-red-50 text-red-700 border-red-200`).
