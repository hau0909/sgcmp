# UI Generation Script: Create Request Verification

This script provides the component-level UI specification for the **Create Request Verification** action button on Request Detail page and empty state card on Verification Detail page.

---

## 1. Context & Theme Settings
- **Theme Framework**: Tailwind CSS.
- **Colors**:
  - Container: `bg-surface-container-lowest border-outline-variant`.
  - Icon background: `bg-blue-50 text-blue-500`.
  - Typography: `text-gray-900` for headings, `text-gray-500` for body text.
  - Primary Action Button: `bg-blue-600 hover:bg-blue-700 text-white`.
  - Secondary Header Trigger Button: `px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50`.
  - Created State Pill Button: `px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition flex items-center gap-2 shadow-sm`.
  - Error text: `text-red-500`.

---

## 2. Component 1: Request Detail Header Action Button (Trigger)
- **Initial State (No Verification Session)**:
  - **Button Element**: `px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg text-sm font-medium flex items-center gap-1.5 shadow-sm transition-all`.
  - **Icon**: `Plus` (`w-4 h-4 text-gray-600`).
  - **Text**: `+ Tạo khảo sát`.
- **Created State (Verification Session Exists - Image 2)**:
  - **Button Element**: `px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-sm font-medium transition flex items-center gap-2 shadow-sm`.
  - **Icon**: `ClipboardCheck` (`w-4 h-4 text-white`).
  - **Text**: `Xem khảo sát`.

---

## 3. Component 2: Verification Empty State Card
- **Container**: `flex flex-col items-center justify-center p-12 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant`.
- **Icon Container**: `w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4`.
- **Icon**: `FileText` (from lucide-react), `w-8 h-8 text-blue-500`.
- **Title**: `text-lg font-bold text-gray-900 mb-2`. (Text: "Chưa có phiên khảo sát").
- **Description**: `text-gray-500 mb-6 text-center max-w-md text-sm`. (Text: "Yêu cầu này chưa được tiến hành khảo sát. Vui lòng tạo phiên khảo sát mới để tiếp tục quy trình.").
- **Button Element**: `px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition flex items-center gap-2 disabled:opacity-50`.
- **Icons**: 
  - Normal state: `CheckCircle` (`w-4 h-4`).
  - Loading state: `Loader2` (`w-4 h-4 animate-spin`).
- **Error Text (Conditional)**: Rendered dynamically if an error occurs. `mt-4 text-sm text-red-500`.

