# UI Generation Script: Send Publish Request

This script provides a highly detailed, component-level UI specification tailored for AI-assisted design generators (such as Stitch) or front-end developers to recreate the **Send Publish Request** section on the Company Profile page.

---

## 1. Page Context & Theme Settings
- **Theme Framework**: Material Design 3 tokens mapped to Tailwind CSS classes.
- **Colors**:
  - `bg-primary`: Primary blue theme color (`var(--color-primary)`).
  - `text-on-primary`: Text on primary blue button.
  - `bg-surface-container-lowest`: Dark/light variant container background.
  - `border-outline-variant`: Light gray border color (`var(--color-outline-variant)`).
  - `text-on-surface`: Default text color (`var(--color-on-surface)`).
  - `text-on-surface-variant`: Muted/secondary text color (`var(--color-on-surface-variant)`).
- **Typography**: Roboto-sans / Inter with clean tracking, uppercase subheaders, and variable weights.

---

## 2. Component 1: Operational Status Banner (Light Blue Theme)
- **Container Styling**:
  - Flex layout: row on desktop (`lg:flex-row lg:items-center`), column on mobile.
  - Background: `bg-blue-50` (OKLCH light blue).
  - Border: `border border-blue-200`.
  - Padding & Border Radius: `p-4 rounded-2xl`.
  - Shadow: `shadow-xs`.
  - Content Alignment: space-between (`justify-between gap-4`).
- **Status Icon Badge**:
  - Container: `p-2 bg-blue-100 text-blue-600 rounded-xl mt-0.5 self-start`.
  - Icon: `ShieldCheck` (from lucide-react, size `w-5 h-5`).
- **Text Section**:
  - Title: `text-sm font-bold text-blue-900`.
    - Text: `Trạng thái hoạt động: Hoạt động (Chưa công khai)`
  - Subtitle Description: `text-xs text-blue-800/90 leading-relaxed max-w-xl`.
    - Text: `Hồ sơ đăng ký tài khoản đã được phê duyệt. Để gửi yêu cầu công khai doanh nghiệp lên hệ thống, vui lòng hoàn thiện các thông tin bắt buộc dưới đây:`

---

## 3. Component 2: Profile Completeness Checklist Box
- **Container Styling**:
  - Background: `bg-blue-100/50` (semi-transparent blue).
  - Border: `border border-blue-200/60`.
  - Padding & Border Radius: `p-3 mt-2 rounded-xl`.
  - Typography: `text-xs font-semibold text-blue-900 space-y-2 max-w-xl`.
- **Title**: `font-bold text-[13px] text-blue-950 mb-2`.
  - Text: `Checklist hoàn thiện hồ sơ để công khai:`
- **Checklist Item Layout**:
  - Vertical list of items, spacing: `space-y-2`.
  - List item: flex container with items-center (`flex items-center gap-2`).
  - Badge indicator:
    - **If Completed**: `w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-emerald-500 text-white`. Icon: `✓`.
    - **If Incomplete**: `w-4 h-4 rounded-full flex items-center justify-center text-[10px] bg-blue-200 text-blue-800`. Icon: `○`.
  - **Item 1: Logo**:
    - Text: `Tải lên logo đại diện của doanh nghiệp`
  - **Item 2: Banner**:
    - Text: `Tải lên ảnh bìa đại diện của doanh nghiệp`
  - **Item 3: Gallery**:
    - Text: `Tải lên ít nhất 2 hình ảnh hoạt động`
    - Subtext count dynamic format: `(Đã hoàn thành: {count} ảnh)` or `(Hiện tại: {count}/2 ảnh)`.
  - **Item 4: Services**:
    - Text: `Cấu hình ít nhất 1 dịch vụ cung cấp`
    - Subtext status dynamic format: `(Đã hoàn thành: {count} dịch vụ)` or `(Chưa có dịch vụ nào)`.

---

## 4. Component 3: Publish Trigger Button
- **Placement**: Placed inside the banner container on the right side on desktop (`lg:self-center`), or full width / left-aligned on mobile.
- **States**:
  - **Disabled State** (checklist incomplete):
    - Classes: `bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300 px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start`.
  - **Enabled State** (checklist completed):
    - Classes: `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 whitespace-nowrap self-start cursor-pointer`.
  - **Action Content**:
    - Left Icon: `Upload` (size `w-3.5 h-3.5`).
    - Label Text: `Gửi yêu cầu công khai`.

---

## 5. Component 4: Confirmation Dialog Modal
- **Overlay backdrop**:
  - Classes: `fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in`.
- **Modal Dialog Box**:
  - Classes: `bg-surface border border-outline-variant rounded-3xl p-6 max-w-md w-full space-y-6 shadow-2xl animate-scale-up`.
- **Title Layout**:
  - Classes: `flex items-center gap-3 text-on-surface`.
  - Icon: `UploadCloud` (size `w-5 h-5 text-primary`).
  - Text: `Xác nhận gửi yêu cầu công khai` (style: `text-base font-bold`).
- **Body & Textarea**:
  - Description paragraph: `text-xs text-on-surface-variant font-medium leading-relaxed`.
    - Text: `Hệ thống sẽ gửi yêu cầu duyệt công khai hồ sơ doanh nghiệp của bạn tới Ban quản trị hệ thống. Khi trạng thái chuyển sang Đang chờ duyệt, bạn sẽ không thể chỉnh sửa thông tin cho tới khi được phản hồi.`
  - Label: `text-xs font-bold text-on-surface block mb-1.5`.
    - Text: `Ghi chú gửi Admin (tùy chọn)`
  - Textarea field:
    - Classes: `w-full text-sm border border-outline-variant rounded-xl px-3 py-2 font-medium text-on-surface bg-surface-container-lowest focus:border-primary focus:ring-1 focus:ring-primary/20 outline-hidden resize-none`.
    - Height: `rows={3}`.
    - Placeholder: `Nhập ghi chú hoặc lời nhắn gửi ban quản trị nếu có...`.
- **Action Buttons**:
  - Container: `flex items-center justify-end gap-2 pt-2`.
  - **Cancel Button**:
    - Classes: `px-4 py-2 border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low transition-all text-xs font-bold rounded-xl cursor-pointer disabled:opacity-60`.
    - Text: `Hủy`
  - **Confirm Submit Button**:
    - Classes: `px-4 py-2 bg-primary hover:bg-primary/95 text-on-primary font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-60`.
    - Text when submitting: `Đang gửi...` (with spinner).
    - Text when idle: `Xác nhận gửi`.

---

## 6. Component 5: Pending Review Status Banner (Amber Theme)
- **Container Styling**:
  - Flex layout: row on desktop, column on mobile.
  - Background: `bg-amber-50` (OKLCH light amber).
  - Border: `border border-amber-200`.
  - Padding & Border Radius: `p-4 rounded-2xl`.
- **Status Icon Badge**:
  - Container: `p-2 bg-amber-100 text-amber-600 rounded-xl mt-0.5 self-start`.
  - Icon: `ShieldAlert` or `Clock` (size `w-5 h-5`).
- **Text Section**:
  - Title: `text-sm font-bold text-amber-900`.
    - Text: `Trạng thái hoạt động: Đang chờ duyệt công khai`
  - Subtitle Description: `text-xs text-amber-800/90 leading-relaxed`.
    - Text: `Yêu cầu công khai đang được Admin xét duyệt. Vui lòng chờ.`
