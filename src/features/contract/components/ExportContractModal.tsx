"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Download,
  Building2,
  User,
  DollarSign,
  MapPin,
  Calendar,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Info,
  CreditCard,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/utils/formatPrice";
import { DAYS_OF_WEEK_SHORT, isDayActive } from "./ContractServiceInfo";
import { useTranslation } from "@/components/providers/LanguageProvider";

export interface BankOption {
  code: string;
  shortName: string;
  name: string;
}

export const POPULAR_BANKS: BankOption[] = [
  { code: "VCB", shortName: "Vietcombank", name: "Ngân hàng Ngoại thương Việt Nam (Vietcombank)" },
  { code: "MB", shortName: "MBBank", name: "Ngân hàng Quân Đội (MBBank)" },
  { code: "CTG", shortName: "VietinBank", name: "Ngân hàng Công thương Việt Nam (VietinBank)" },
  { code: "BIDV", shortName: "BIDV", name: "Ngân hàng Đầu tư và Phát triển Việt Nam (BIDV)" },
  { code: "TCB", shortName: "Techcombank", name: "Ngân hàng Kỹ thương Việt Nam (Techcombank)" },
  { code: "VPB", shortName: "VPBank", name: "Ngân hàng Việt Nam Thịnh Vượng (VPBank)" },
  { code: "ACB", shortName: "ACB", name: "Ngân hàng Á Châu (ACB)" },
  { code: "TPB", shortName: "TPBank", name: "Ngân hàng Tiên Phong (TPBank)" },
  { code: "VBA", shortName: "Agribank", name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn (Agribank)" },
  { code: "STB", shortName: "Sacombank", name: "Ngân hàng Sài Gòn Thương Tín (Sacombank)" },
  { code: "HDB", shortName: "HDBank", name: "Ngân hàng Phát triển TP.HCM (HDBank)" },
  { code: "VIB", shortName: "VIB", name: "Ngân hàng Quốc tế Việt Nam (VIB)" },
  { code: "OCB", shortName: "OCB", name: "Ngân hàng Phương Đông (OCB)" },
  { code: "SHB", shortName: "SHB", name: "Ngân hàng Sài Gòn - Hà Nội (SHB)" },
  { code: "OTHER", shortName: "Khác", name: "Ngân hàng khác" },
];

export interface ContractExportFormData {
  // Signing info
  signing_date: string; // YYYY-MM-DD for datepicker
  signing_location: string;
  contract_code: string;

  // Party A (Customer)
  customer_company_name: string;
  customer_address: string;
  customer_tax_code: string;
  customer_phone: string;
  customer_email: string;
  customer_representative: string;
  customer_position: string;

  // Party B (Company)
  company_name: string;
  company_address: string;
  company_tax_code: string;
  company_phone: string;
  company_email: string;
  company_representative: string;
  company_position: string;

  // Service & Location & Duration
  service_name: string;
  target_address: string;
  start_date: string; // YYYY-MM-DD for datepicker
  end_date: string;   // YYYY-MM-DD for datepicker
  duration_note: string;
  service_scope_req: string;
  service_scope_list: string[];

  // Section 2.4 Parameters (Fixed / Read-Only from Booking)
  time_slots_str: string;
  guards_per_slot_str: string;
  days_per_week_list: string[];
  days_per_week_str: string;

  // Pricing & Payment (Fixed / Read-Only from Booking)
  quotation_type: "hourly" | "monthly" | "package" | string;
  total_price: number | string;
  total_price_formatted: string;
  unit_price_detail: string;
  vat_status: string; // Nullable placeholder only
  overtime_normal: string;
  overtime_sunday: string;
  overtime_holiday: string;

  // Payment Details
  payment_method: "Chuyển khoản ngân hàng" | "Tiền mặt";
  bank_name: string;
  bank_branch: string;
  bank_account_no: string;
  bank_account_holder: string;
  bank_info: string;
  payment_term: string;
}

interface ExportContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  contract: any;
  onExport: (formData: ContractExportFormData) => void;
}

type TabType = "general" | "parties" | "pricing";
const TABS_ORDER: TabType[] = ["general", "parties", "pricing"];

// Date formatting helpers
function toInputDateFormat(dateStr: any): string {
  if (!dateStr) return "";
  const s = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split(/[\/\.-]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
    }
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  try {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split("T")[0];
    }
  } catch (e) {}
  return "";
}

export function ExportContractModal({
  isOpen,
  onClose,
  contract,
  onExport,
}: ExportContractModalProps) {
  const { locale } = useTranslation();
  const isEn = locale === "en";

  const [activeTab, setActiveTab] = useState<TabType>("general");
  const [maxReachedStepIndex, setMaxReachedStepIndex] = useState<number>(0);
  const [formData, setFormData] = useState<ContractExportFormData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const contractId = contract?.contract_id || contract?.contract_code || "default";
  const sessionStorageKey = `contract_export_draft_${contractId}`;

  // UI Static Labels with full i18n support
  const tUI = {
    headerTitle: isEn ? "Complete Contract Export Form" : "Hoàn thiện thông tin Xuất Hợp Đồng (Master Template)",
    headerSubtitle: isEn ? "Review and adjust details before exporting the Security Service Contract Word document." : "Rà soát thông tin để xuất Hợp đồng dịch vụ bảo vệ đầy đủ, bám sát Master Template.",
    warningBanner: isEn ? "Your entered data is only saved temporarily in the current session and will be reset upon page refresh. System data remains untouched." : "Dữ liệu nhập của bạn chỉ được lưu tạm thời trong phiên làm việc hiện tại và sẽ bị mất nếu tải lại trang. Tuy nhiên, các dữ liệu cố định lấy từ hệ thống vẫn sẽ được giữ nguyên.",
    restoreData: isEn ? "Reset to original data" : "Khôi phục dữ liệu gốc",

    // Tab Titles (Clean 3 steps only)
    tabGeneral: isEn ? "1. General Info & Contract Code" : "1. Thông tin chung & Số HĐ",
    tabParties: isEn ? "2. Parties Information" : "2. Thông tin Các Bên",
    tabPricing: isEn ? "3. Pricing & Payment" : "3. Giá & Thanh toán (Điều 2.4 & 6)",

    // Tab 1 Fields
    contractCodeLabel: isEn ? "Contract Code" : "Số hợp đồng",
    contractCodeSub: isEn ? "Contract tracking reference code" : "Mã số lưu vết hợp đồng",
    signingDateLabel: isEn ? "Signing Date" : "Ngày ký hợp đồng",
    signingDateSub: isEn ? "Official contract execution date" : "Chọn ngày giao kết chính thức",
    signingLocationLabel: isEn ? "Signing Location" : "Địa điểm ký hợp đồng",
    signingLocationSub: isEn ? "Official place where parties execute the contract" : "Nơi hai bên chính thức ký kết (Hiển thị đầy đủ địa chỉ dài)",
    serviceNameLabel: isEn ? "Package Service Name (Article 2.1)" : "Tên gói dịch vụ đăng ký (Điều 2.1)",
    serviceScopeReqLabel: isEn ? "Requested Service Scope (Article 3)" : "Phạm vi dịch vụ yêu cầu (Điều 3)",
    targetAddressLabel: isEn ? "Service Location (Security Target - Article 2.2)" : "Địa điểm thực hiện dịch vụ (Mục tiêu bảo vệ - Điều 2.2)",
    durationSectionTitle: isEn ? "CONTRACT DURATION (ARTICLE 2.3)" : "THỜI GIAN THỰC HIỆN HỢP ĐỒNG (ĐIỀU 2.3)",
    startDateLabel: isEn ? "Start Date" : "Từ ngày",
    endDateLabel: isEn ? "End Date" : "Đến hết ngày",
    scopeListTitle: isEn ? "Detailed Scope Description (Article 3 - List)" : "Mô tả công việc chi tiết (Điều 3 - Dạng List)",
    scopeListSub: isEn ? "Enter specific tasks. Click plus (+) to add rows." : "Nhập từng nhiệm vụ chi tiết. Nhấn nút dấu cộng (+) để thêm dòng mới.",
    addScopeRow: isEn ? "Add Description Line" : "Thêm dòng mô tả",

    // Tab 2 Fields
    partyATitle: isEn ? "SERVICE CUSTOMER (PARTY A)" : "BÊN THUÊ DỊCH VỤ (BÊN A)",
    partyACompanyLabel: isEn ? "Party A Company / Store Name" : "Tên đơn vị / Cửa hàng / Công ty Bên A",
    partyATaxLabel: isEn ? "Tax Code (Optional for Individuals)" : "Mã số thuế Bên A",
    partyAAddressLabel: isEn ? "Party A Registered Address" : "Địa chỉ trụ sở / Cửa hàng Bên A",
    partyAPhoneLabel: isEn ? "Contact Phone" : "Điện thoại liên hệ",
    partyAEmailLabel: isEn ? "Contact Email" : "Email liên hệ",
    partyARepLabel: isEn ? "Represented by" : "Đại diện bởi",
    partyAPosLabel: isEn ? "Representative Position" : "Chức vụ đại diện",

    partyBTitle: isEn ? "SERVICE PROVIDER (PARTY B)" : "BÊN CUNG CẤP DỊCH VỤ (BÊN B)",
    partyBCompanyLabel: isEn ? "Party B Company Name" : "Tên công ty Bên B",
    partyBTaxLabel: isEn ? "Party B Tax Code" : "Mã số thuế Bên B",
    partyBAddressLabel: isEn ? "Party B Headquarter Address" : "Địa chỉ trụ sở Bên B",
    partyBPhoneLabel: isEn ? "Party B Phone" : "Điện thoại Bên B",
    partyBEmailLabel: isEn ? "Party B Email" : "Email Bên B",
    partyBRepLabel: isEn ? "Represented by" : "Đại diện bởi",
    partyBPosLabel: isEn ? "Representative Position" : "Chức vụ đại diện Bên B",

    // Tab 3 Fields
    sec24Title: isEn ? "ARTICLE 2.4 PARAMETERS (SHIFTS, GUARDS & FEES)" : "BẢNG THÔNG SỐ ĐIỀU 2.4 (KHUNG GIỜ TRỰC, NHÂN SỰ & PHÍ)",
    timeSlotsLabel: isEn ? "Working Shifts" : "Khung giờ trực",
    guardsPerSlotLabel: isEn ? "Guards / Shift" : "Số lượng bảo vệ/Ca",
    daysPerWeekLabel: isEn ? "Weekly Schedule" : "Lịch hoạt động tuần",
    totalContractValLabel: isEn ? "Total Contract Value" : "Tổng giá trị hợp đồng",
    unitPriceLabel: isEn ? "Applied Unit Price (Article 2.4)" : "Đơn giá áp dụng (Điều 2.4)",
    vatStatusLabel: isEn ? "VAT Status (Article 6.1 - Optional)" : "Trạng thái Thuế VAT (Điều 6.1)",
    overtimeTitle: isEn ? "6.2 Overtime / Additional Service Fees (if applicable)" : "6.2 Phí dịch vụ tăng cường / Ngoài giờ (nếu có phát sinh)",
    otNormalLabel: isEn ? "Regular Days (VND/hr/guard)" : "Ngày thường (VNĐ/giờ/nhân sự)",
    otSundayLabel: isEn ? "Sundays (VND/hr/guard)" : "Ngày Chủ nhật (VNĐ/giờ/nhân sự)",
    otHolidayLabel: isEn ? "Holidays (VND/hr/guard)" : "Ngày Lễ, Tết (VNĐ/giờ/nhân sự)",
    paymentSecTitle: isEn ? "6.3 Payment Terms & Receiving Bank Account" : "6.3 Quy trình thanh toán & Tài khoản ngân hàng nhận",
    paymentMethodLabel: isEn ? "Payment Method" : "Hình thức thanh toán",
    paymentTermLabel: isEn ? "Payment Term" : "Thời hạn thanh toán",
    bankDetailsTitle: isEn ? "Party B Receiving Bank Account Details" : "Thông tin Tài khoản Ngân hàng nhận thanh toán của Bên B",
    bankNameLabel: isEn ? "Bank Name" : "Ngân hàng",
    bankBranchLabel: isEn ? "Branch" : "Chi nhánh",
    bankAccountNoLabel: isEn ? "Account Number (STK)" : "Số tài khoản (STK)",
    bankAccountHolderLabel: isEn ? "Account Holder Name" : "Tên tài khoản",

    // Buttons
    backBtn: isEn ? "Back" : "Quay lại",
    cancelBtn: isEn ? "Cancel" : "Hủy bỏ",
    nextBtn: isEn ? "Next" : "Tiếp theo",
    exportBtn: isEn ? "Export Contract (.doc)" : "Xuất Hợp Đồng (.doc)",

    // Confirm Overlay
    confirmTitle: isEn ? "Confirm Word Contract Export" : "Xác nhận Xuất Hợp Đồng Word",
    confirmSub: isEn ? "All information has been thoroughly checked. Are you sure you want to export the Word (.doc) contract file now?" : "Tất cả thông tin đã được kiểm tra kỹ lưỡng. Bạn có chắc chắn muốn xuất file Hợp đồng Word (.doc) ngay bây giờ?",
    confirmReviewBtn: isEn ? "Review again" : "Rà soát lại",
    confirmFinalBtn: isEn ? "Confirm Export" : "Xác nhận xuất file",
  };

  // Initialize or load draft from sessionStorage
  useEffect(() => {
    if (!contract || !isOpen) return;

    try {
      const savedDraft = sessionStorage.getItem(sessionStorageKey);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (parsed && typeof parsed === "object") {
          setFormData(parsed);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load export draft from sessionStorage", e);
    }

    // DB Objects
    const company = contract.company || {};
    const customer = contract.customer || {};
    const booking = contract.booking || {};
    const services = booking?.services || {};

    // Signing date as YYYY-MM-DD for datepicker
    const signingDatePickerVal = toInputDateFormat(contract.created_at || new Date().toISOString());

    const rawPrice = booking.quoted_price || booking.total_price || contract.total_price || 0;
    const qType = booking.quotation_type || contract.quotation_type || "monthly";

    // Quotation-type specific price formatting matching booking quote
    let formattedPrice = "";
    let unitPriceDetail = "";
    if (rawPrice) {
      const pStr = formatPrice(rawPrice) + " VNĐ";
      if (qType === "hourly") {
        const hourlyRate = booking.negotiated_price || booking.unit_price || booking.hourly_rate || (booking.guards_per_slot ? Math.round(rawPrice / (booking.guards_per_slot * 54)) : 20000);
        formattedPrice = `${formatPrice(rawPrice)} VNĐ`;
        unitPriceDetail = `${formatPrice(hourlyRate)} VNĐ / giờ / nhân sự`;
      } else if (qType === "monthly") {
        formattedPrice = `${pStr} / tháng`;
        unitPriceDetail = `${pStr} / tháng`;
      } else {
        formattedPrice = `${pStr}`;
        unitPriceDetail = `${pStr} / trọn gói`;
      }
    } else {
      formattedPrice = contract.formatted_price || "";
      unitPriceDetail = contract.formatted_price || "";
    }

    // Scope list initialized with ONLY 1 sample item row (#1)
    const defaultScopeList = [""];

    const companyNameStr = company.name && company.name !== "Công ty chưa xác định" ? company.name : "";
    const serviceNameStr = contract.service_name || services.service_name || "Dịch vụ Bảo vệ Kinh doanh & Giải trí";
    const timeSlotsJoined = (booking.time_slots || ["08:00 - 22:00", "22:00 - 08:00"]).join(", ");

    // Extract working days array cleanly from booking data (checking day_per_week first)
    const rawWorkingDays = booking.day_per_week || booking.days_per_week || booking.working_days || booking.days_of_week || booking.days || contract.day_per_week || [];
    let workingDaysList: string[] = [];
    if (Array.isArray(rawWorkingDays)) {
      workingDaysList = rawWorkingDays.map((d) => String(d).trim());
    } else if (typeof rawWorkingDays === "string") {
      try {
        const parsed = JSON.parse(rawWorkingDays);
        if (Array.isArray(parsed)) workingDaysList = parsed.map((d) => String(d).trim());
        else workingDaysList = rawWorkingDays.split(",").map((s) => s.trim());
      } catch (e) {
        workingDaysList = rawWorkingDays.split(",").map((s) => s.trim());
      }
    }

    // Date Picker initial dates
    const startDatePickerVal = toInputDateFormat(contract.start_date || booking.start_date || new Date().toISOString());
    const endDatePickerVal = toInputDateFormat(contract.end_date || booking.end_date || new Date().toISOString());

    let defaultPaymentTerm = "Bên A thanh toán cho Bên B định kỳ hàng tháng, từ ngày 01 đến ngày 05 của tháng tiếp theo.";
    if (qType === "hourly") {
      defaultPaymentTerm = "Bên A thanh toán cho Bên B theo tổng số giờ dịch vụ thực tế sau khi hoàn tất đợt dịch vụ hoặc vào cuối đợt.";
    } else if (qType === "package") {
      defaultPaymentTerm = "Bên A thanh toán cho Bên B 50% ngay sau khi ký hợp đồng và 50% còn lại sau khi hoàn tất gói dịch vụ.";
    }

    const initialData: ContractExportFormData = {
      signing_date: signingDatePickerVal,
      signing_location: company.address ? `Trụ sở ${company.name}` : "Trụ sở Bên B",
      contract_code: contract.contract_code || `HD-${contract.contract_id?.slice(0, 8)?.toUpperCase() || "001"}`,

      customer_company_name: customer.company_name && customer.company_name !== "........................" ? customer.company_name : (customer.representative || ""),
      customer_address: customer.address && customer.address !== "Chưa cập nhật" ? customer.address : (booking.address || ""),
      customer_tax_code: customer.tax_code && customer.tax_code !== "........................" ? customer.tax_code : "",
      customer_phone: customer.phone && customer.phone !== "Chưa cập nhật" ? customer.phone : "",
      customer_email: customer.email && customer.email !== "Chưa cập nhật" ? customer.email : "",
      customer_representative: customer.representative && customer.representative !== "Khách hàng không tên" ? customer.representative : "",
      customer_position: customer.position && customer.position !== "........................" ? customer.position : "",

      company_name: companyNameStr,
      company_address: company.address && company.address !== "Chưa cập nhật" ? company.address : "",
      company_tax_code: company.tax_code && company.tax_code !== "Chưa cập nhật" ? company.tax_code : "",
      company_phone: company.phone && company.phone !== "Chưa cập nhật" ? company.phone : "",
      company_email: company.email && company.email !== "Chưa cập nhật" ? company.email : "",
      company_representative: company.representative && company.representative !== "Chưa cập nhật" ? company.representative : "",
      company_position: company.position || "Giám đốc / Đại diện pháp luật",

      service_name: serviceNameStr,
      target_address: booking.address || customer.address || "",
      start_date: startDatePickerVal,
      end_date: endDatePickerVal,
      duration_note: "",
      service_scope_req: "Bảo vệ an ninh, giữ xe khách hàng, bảo vệ tài sản và duy trì trật tự.",
      service_scope_list: defaultScopeList,

      time_slots_str: timeSlotsJoined,
      guards_per_slot_str: String(booking.guards_per_slot || 1),
      days_per_week_list: workingDaysList,
      days_per_week_str: "7 ngày / tuần (Thứ Hai đến Chủ Nhật)",

      quotation_type: qType,
      total_price: rawPrice,
      total_price_formatted: formattedPrice,
      unit_price_detail: unitPriceDetail,
      vat_status: "",
      overtime_normal: "",
      overtime_sunday: "",
      overtime_holiday: "",

      payment_method: "Chuyển khoản ngân hàng",
      bank_name: "",
      bank_branch: "",
      bank_account_no: "",
      bank_account_holder: companyNameStr,
      bank_info: "",
      payment_term: defaultPaymentTerm,
    };

    setFormData(initialData);
    setMaxReachedStepIndex(0);
  }, [contract, isOpen, sessionStorageKey]);

  // Persist form changes to sessionStorage
  const updateFormData = (updater: (prev: ContractExportFormData | null) => ContractExportFormData | null) => {
    setFormData((prev) => {
      const next = updater(prev);
      if (next) {
        try {
          sessionStorage.setItem(sessionStorageKey, JSON.stringify(next));
        } catch (e) {
          console.warn("Could not save export draft to sessionStorage", e);
        }
      }
      return next;
    });
  };

  const resetToDefaultData = () => {
    try {
      sessionStorage.removeItem(sessionStorageKey);
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  if (!isOpen || !formData) return null;

  const handleInputChange = (field: keyof ContractExportFormData, value: any) => {
    updateFormData((prev) => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };
      
      // Auto compile bank_info string
      if (field === "payment_method" || field === "bank_name" || field === "bank_branch" || field === "bank_account_no" || field === "bank_account_holder") {
        if (updated.payment_method === "Chuyển khoản ngân hàng") {
          if (updated.bank_account_no && updated.bank_name) {
            const branchSuffix = updated.bank_branch ? ` - Chi nhánh: ${updated.bank_branch}` : "";
            updated.bank_info = `Tên tài khoản: ${updated.bank_account_holder || updated.company_name} | STK: ${updated.bank_account_no} | Ngân hàng: ${updated.bank_name}${branchSuffix}`;
          } else {
            updated.bank_info = "";
          }
        } else {
          updated.bank_info = "Thanh toán trực tiếp bằng tiền mặt tại trụ sở Bên B.";
        }
      }
      return updated;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Scope List handlers
  const handleAddScopeItem = () => {
    updateFormData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        service_scope_list: [...prev.service_scope_list, ""],
      };
    });
  };

  const handleScopeItemChange = (index: number, value: string) => {
    updateFormData((prev) => {
      if (!prev) return null;
      const list = [...prev.service_scope_list];
      list[index] = value;
      return { ...prev, service_scope_list: list };
    });
  };

  const handleRemoveScopeItem = (index: number) => {
    updateFormData((prev) => {
      if (!prev) return null;
      const list = prev.service_scope_list.filter((_, i) => i !== index);
      return { ...prev, service_scope_list: list.length > 0 ? list : [""] };
    });
  };

  // Strict Form Validation Logic per Step / Tab
  const validateTab = (tab: TabType): boolean => {
    const newErrors: Record<string, string> = {};

    if (tab === "general") {
      if (!formData.signing_date.trim()) newErrors.signing_date = isEn ? "Please select contract signing date" : "Vui lòng chọn ngày ký hợp đồng";
      if (!formData.signing_location.trim()) newErrors.signing_location = isEn ? "Please enter signing location" : "Vui lòng nhập địa điểm ký hợp đồng";
      if (!formData.target_address.trim()) newErrors.target_address = isEn ? "Please enter security target location" : "Vui lòng nhập địa điểm bảo vệ (Mục tiêu)";
      if (!formData.start_date.trim()) newErrors.start_date = isEn ? "Please select start date" : "Vui lòng chọn ngày bắt đầu hợp đồng";
      if (!formData.end_date.trim()) newErrors.end_date = isEn ? "Please select end date" : "Vui lòng chọn ngày kết thúc hợp đồng";
    }

    if (tab === "parties") {
      if (!formData.customer_company_name.trim()) newErrors.customer_company_name = isEn ? "Please enter Party A name" : "Vui lòng nhập tên công ty/đơn vị Bên A";
      if (!formData.customer_address.trim()) newErrors.customer_address = isEn ? "Please enter Party A address" : "Vui lòng nhập địa chỉ Bên A";
      if (!formData.customer_representative.trim()) newErrors.customer_representative = isEn ? "Please enter Party A representative" : "Vui lòng nhập người đại diện Bên A";
      if (!formData.customer_position.trim()) newErrors.customer_position = isEn ? "Please enter Party A representative position" : "Vui lòng nhập chức vụ đại diện Bên A";

      if (!formData.company_name.trim()) newErrors.company_name = isEn ? "Please enter Party B company name" : "Vui lòng nhập tên công ty Bên B";
      if (!formData.company_address.trim()) newErrors.company_address = isEn ? "Please enter Party B address" : "Vui lòng nhập địa chỉ trụ sở Bên B";
      if (!formData.company_tax_code.trim()) newErrors.company_tax_code = isEn ? "Please enter Party B tax code" : "Vui lòng nhập mã số thuế Bên B";
      if (!formData.company_representative.trim()) newErrors.company_representative = isEn ? "Please enter Party B representative" : "Vui lòng nhập đại diện Bên B";
      if (!formData.company_position.trim()) newErrors.company_position = isEn ? "Please enter Party B representative position" : "Vui lòng nhập chức vụ đại diện Bên B";
    }

    if (tab === "pricing") {
      if (!formData.payment_method) newErrors.payment_method = isEn ? "Please select payment method" : "Vui lòng chọn hình thức thanh toán";
      if (!formData.payment_term.trim()) newErrors.payment_term = isEn ? "Please enter payment term" : "Vui lòng nhập thời hạn thanh toán";

      if (formData.payment_method === "Chuyển khoản ngân hàng") {
        if (!formData.bank_name) newErrors.bank_name = isEn ? "Please select bank" : "Vui lòng chọn ngân hàng";
        if (!formData.bank_account_no.trim()) newErrors.bank_account_no = isEn ? "Please enter account number" : "Vui lòng nhập số tài khoản";
        if (!formData.bank_account_holder.trim()) newErrors.bank_account_holder = isEn ? "Please enter account holder" : "Vui lòng nhập tên chủ tài khoản";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAll = (): boolean => {
    const isGValid = validateTab("general");
    const isPValid = validateTab("parties");
    const isPrValid = validateTab("pricing");

    if (!isGValid) {
      setActiveTab("general");
      return false;
    }
    if (!isPValid) {
      setActiveTab("parties");
      return false;
    }
    if (!isPrValid) {
      setActiveTab("pricing");
      return false;
    }

    return true;
  };

  // Sequential Step-by-Step Enforcement: No skipping unreached steps!
  const handleSelectTab = (targetTab: TabType) => {
    const targetIndex = TABS_ORDER.indexOf(targetTab);
    const currentIndex = TABS_ORDER.indexOf(activeTab);

    if (targetIndex < currentIndex) {
      setActiveTab(targetTab);
      return;
    }

    if (targetIndex > maxReachedStepIndex) {
      if (!validateTab(activeTab)) return;
    } else {
      setActiveTab(targetTab);
    }
  };

  const handleNextTab = () => {
    const currentIndex = TABS_ORDER.indexOf(activeTab);

    if (activeTab === "general" && validateTab("general")) {
      const nextTab = TABS_ORDER[currentIndex + 1];
      setActiveTab(nextTab);
      setMaxReachedStepIndex((prev) => Math.max(prev, currentIndex + 1));
    } else if (activeTab === "parties" && validateTab("parties")) {
      const nextTab = TABS_ORDER[currentIndex + 1];
      setActiveTab(nextTab);
      setMaxReachedStepIndex((prev) => Math.max(prev, currentIndex + 1));
    }
  };

  const handlePrevTab = () => {
    const currentIndex = TABS_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TABS_ORDER[currentIndex - 1]);
    }
  };

  const handleOpenExportConfirm = () => {
    if (validateAll()) {
      setIsConfirmOpen(true);
    }
  };

  const handleConfirmFinalExport = () => {
    setIsConfirmOpen(false);
    onExport(formData);
    onClose();
  };

  // Scope placeholders
  const scopePlaceholders = [
    isEn ? "e.g., Vehicle management, card issuance, polite customer welcoming." : "VD: Quản lý bãi xe khách hàng, cấp phát thẻ giữ xe, hỗ trợ dắt xe và mở cửa đón/tiễn khách hàng lịch sự.",
    isEn ? "e.g., Assist in preventing theft and property swap during business hours." : "VD: Quan sát hỗ trợ ngăn ngừa trộm cắp, tráo tem nhãn quần áo/tài sản trong giờ mở cửa.",
    isEn ? "e.g., Gate security, firefighting readiness, and night patrol." : "VD: Bảo vệ an toàn cửa ngõ, PCCC và tuần tra chống đột nhập ban đêm.",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md w-screen h-screen flex items-center justify-center p-4 overflow-hidden">
      <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-outline-variant my-auto">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-outline-variant/40 bg-surface-container-low/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-on-surface font-headline flex items-center gap-2">
                {tUI.headerTitle}
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  Word
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">
                {tUI.headerSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Banner */}
        <div className="bg-amber-50/90 dark:bg-amber-950/30 px-6 py-2.5 border-b border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-300 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {tUI.warningBanner}
            </span>
          </div>
          <button
            type="button"
            onClick={resetToDefaultData}
            className="text-[11px] font-bold underline text-amber-800 hover:text-amber-950 dark:text-amber-200 cursor-pointer ml-3 shrink-0"
          >
            {tUI.restoreData}
          </button>
        </div>

        {/* Sequential Step Header Bar (3 Steps Only) */}
        <div className="flex items-center gap-1 border-b border-outline-variant/40 bg-surface-container-lowest px-6 pt-2 shrink-0 overflow-x-auto">
          {TABS_ORDER.map((tabKey, idx) => {
            const isCurrent = activeTab === tabKey;
            const isUnlocked = idx <= maxReachedStepIndex;
            const isCompleted = idx < maxReachedStepIndex;

            const labelMap: Record<TabType, string> = {
              general: tUI.tabGeneral,
              parties: tUI.tabParties,
              pricing: tUI.tabPricing,
            };

            const iconMap: Record<TabType, React.ReactNode> = {
              general: <Calendar className="w-4 h-4" />,
              parties: <Building2 className="w-4 h-4" />,
              pricing: <DollarSign className="w-4 h-4" />,
            };

            return (
              <button
                key={tabKey}
                type="button"
                disabled={!isUnlocked}
                onClick={() => handleSelectTab(tabKey)}
                className={`px-4 py-2.5 text-xs font-bold border-b-2 flex items-center gap-2 transition-all whitespace-nowrap ${
                  isCurrent
                    ? "border-primary text-primary bg-primary/5 rounded-t-lg"
                    : isUnlocked
                    ? "border-transparent text-on-surface hover:bg-surface-container-low cursor-pointer"
                    : "border-transparent text-on-surface-variant/40 cursor-not-allowed opacity-50"
                }`}
                title={!isUnlocked ? (isEn ? "Please complete previous steps first" : "Vui lòng hoàn thành các bước trước đó") : undefined}
              >
                {isCompleted ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  iconMap[tabKey]
                )}
                <span>{labelMap[tabKey]}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: General Info */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Row 1: Contract Code & Signing Date (Datepicker input) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-0.5">
                    {tUI.contractCodeLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <p className="text-[11px] text-on-surface-variant/70 mb-1">{tUI.contractCodeSub}</p>
                  <input
                    type="text"
                    value={formData.contract_code}
                    onChange={(e) => handleInputChange("contract_code", e.target.value)}
                    placeholder="VD: 88/2026/HĐDV-VTL"
                    className="w-full px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-bright font-mono font-bold"
                  />
                </div>

                {/* Datepicker for Ngày ký hợp đồng */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-0.5">
                    {tUI.signingDateLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <p className="text-[11px] text-on-surface-variant/70 mb-1">{tUI.signingDateSub}</p>
                  <input
                    type="date"
                    value={formData.signing_date}
                    onChange={(e) => handleInputChange("signing_date", e.target.value)}
                    className={`w-full px-3 py-2 text-xs border rounded-lg bg-surface-bright font-semibold cursor-pointer ${
                      errors.signing_date ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                    }`}
                  />
                  {errors.signing_date && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.signing_date}</p>}
                </div>
              </div>

              {/* Full width row for Signing Location */}
              <div>
                <label className="block text-xs font-bold text-on-surface mb-0.5">
                  {tUI.signingLocationLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <p className="text-[11px] text-on-surface-variant/70 mb-1">{tUI.signingLocationSub}</p>
                <input
                  type="text"
                  value={formData.signing_location}
                  onChange={(e) => handleInputChange("signing_location", e.target.value)}
                  placeholder="VD: Trụ sở CÔNG TY TNHH MTV DỊCH VỤ BẢO VỆ CHUYÊN NGHIỆP SÔNG HẬU - TP. Cần Thơ"
                  className={`w-full px-3 py-2 text-xs border rounded-lg bg-surface-bright font-medium focus:ring-2 focus:ring-primary/40 ${
                    errors.signing_location ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                  }`}
                />
                {errors.signing_location && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.signing_location}</p>}
              </div>

              {/* Service & Target Location */}
              <div className="border-t border-outline-variant/30 pt-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Clean Non-editable Service Name */}
                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      {tUI.serviceNameLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={formData.service_name}
                      className="w-full px-3 py-2 text-xs border border-outline-variant/60 rounded-lg bg-surface-container-low font-bold text-primary cursor-not-allowed opacity-90"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-on-surface mb-1">
                      {tUI.serviceScopeReqLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.service_scope_req}
                      onChange={(e) => handleInputChange("service_scope_req", e.target.value)}
                      placeholder="VD: Bảo vệ an ninh, giữ xe khách hàng, bảo vệ tài sản..."
                      className="w-full px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {tUI.targetAddressLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.target_address}
                    onChange={(e) => handleInputChange("target_address", e.target.value)}
                    placeholder="VD: Shop Thời Trang - Số 122 Đường 30 Tháng 4, P. An Phú, Q. Ninh Kiều, TP. Cần Thơ"
                    className={`w-full px-3 py-2 text-xs border rounded-lg bg-surface-bright font-medium focus:ring-2 focus:ring-primary/40 ${
                      errors.target_address ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                    }`}
                  />
                  {errors.target_address && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.target_address}</p>}
                </div>
              </div>

              {/* HTML Date Pickers for Start and End dates */}
              <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {tUI.durationSectionTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.startDateLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <p className="text-[11px] text-on-surface-variant/70 mb-1">{isEn ? "Select start date" : "Chọn ngày bắt đầu hợp đồng"}</p>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) => handleInputChange("start_date", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-surface-bright font-semibold cursor-pointer ${
                        errors.start_date ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.start_date && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.start_date}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.endDateLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <p className="text-[11px] text-on-surface-variant/70 mb-1">{isEn ? "Select end date" : "Chọn ngày kết thúc hợp đồng"}</p>
                    <input
                      type="date"
                      value={formData.end_date}
                      onChange={(e) => handleInputChange("end_date", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-surface-bright font-semibold cursor-pointer ${
                        errors.end_date ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.end_date && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.end_date}</p>}
                  </div>
                </div>
              </div>

              {/* Dynamic Scope Description List */}
              <div className="border-t border-outline-variant/30 pt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-xs font-bold text-on-surface">
                      {tUI.scopeListTitle}
                    </label>
                    <p className="text-[11px] text-on-surface-variant/70">
                      {tUI.scopeListSub}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddScopeItem}
                    className="text-xs font-semibold flex items-center gap-1 border-primary text-primary hover:bg-primary/5 py-1 px-2.5 rounded-lg cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{tUI.addScopeRow}</span>
                  </Button>
                </div>

                <div className="space-y-2 mt-2">
                  {formData.service_scope_list.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-primary w-6 shrink-0 text-center">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleScopeItemChange(idx, e.target.value)}
                        placeholder={scopePlaceholders[idx] || `VD: Mô tả chi tiết nhiệm vụ thứ ${idx + 1}...`}
                        className="flex-1 px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-bright font-medium"
                      />
                      {formData.service_scope_list.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveScopeItem(idx)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Xóa dòng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Parties Info */}
          {activeTab === "parties" && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Bên A - Khách hàng */}
              <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 space-y-3">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 border-b border-outline-variant/30 pb-2">
                  <User className="w-4 h-4 text-primary" />
                  {tUI.partyATitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyACompanyLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_company_name}
                      onChange={(e) => handleInputChange("customer_company_name", e.target.value)}
                      placeholder="VD: CỬA HÀNG THỜI TRANG NHẬT LONG (CÔNG TY TNHH...)"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.customer_company_name ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.customer_company_name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.customer_company_name}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyATaxLabel}
                    </label>
                    <input
                      type="text"
                      value={formData.customer_tax_code}
                      onChange={(e) => handleInputChange("customer_tax_code", e.target.value)}
                      placeholder="Nhập MST (VD: 1801234567)"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyAAddressLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_address}
                      onChange={(e) => handleInputChange("customer_address", e.target.value)}
                      placeholder="VD: Số 122 Đường 30 Tháng 4, P. An Phú, Q. Ninh Kiều, TP. Cần Thơ"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.customer_address ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.customer_address && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.customer_address}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">{tUI.partyAPhoneLabel}</label>
                    <input
                      type="text"
                      value={formData.customer_phone}
                      onChange={(e) => handleInputChange("customer_phone", e.target.value)}
                      placeholder="VD: 0292 3888 777 - Hotline: 0918 123 456"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">{tUI.partyAEmailLabel}</label>
                    <input
                      type="text"
                      value={formData.customer_email}
                      onChange={(e) => handleInputChange("customer_email", e.target.value)}
                      placeholder="Địa chỉ Email"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyARepLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_representative}
                      onChange={(e) => handleInputChange("customer_representative", e.target.value)}
                      placeholder="VD: Ông TRẦN VĂN THỊNH"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-bold ${
                        errors.customer_representative ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.customer_representative && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.customer_representative}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyAPosLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.customer_position}
                      onChange={(e) => handleInputChange("customer_position", e.target.value)}
                      placeholder="VD: Chủ Cửa hàng / Giám đốc"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.customer_position ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.customer_position && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.customer_position}</p>}
                  </div>
                </div>
              </div>

              {/* Bên B - Công ty */}
              <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 space-y-3">
                <h3 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 border-b border-outline-variant/30 pb-2">
                  <Building2 className="w-4 h-4 text-secondary" />
                  {tUI.partyBTitle}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyBCompanyLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_name}
                      onChange={(e) => handleInputChange("company_name", e.target.value)}
                      placeholder="VD: CÔNG TY CỔ PHẦN DỊCH VỤ BẢO VỆ VIỆT THIÊN LONG"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.company_name ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.company_name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.company_name}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyBTaxLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_tax_code}
                      onChange={(e) => handleInputChange("company_tax_code", e.target.value)}
                      placeholder="VD: 1801654321"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.company_tax_code ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.company_tax_code && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.company_tax_code}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyBAddressLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_address}
                      onChange={(e) => handleInputChange("company_address", e.target.value)}
                      placeholder="VD: 12B, tổ 3, KV1, Phường Cái Răng, TP. Cần Thơ"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.company_address ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.company_address && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.company_address}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">{tUI.partyBPhoneLabel}</label>
                    <input
                      type="text"
                      value={formData.company_phone}
                      onChange={(e) => handleInputChange("company_phone", e.target.value)}
                      placeholder="VD: 0902 360 799"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">{tUI.partyBEmailLabel}</label>
                    <input
                      type="text"
                      value={formData.company_email}
                      onChange={(e) => handleInputChange("company_email", e.target.value)}
                      placeholder="VD: contact@vietthienlongsecurity.com"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyBRepLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_representative}
                      onChange={(e) => handleInputChange("company_representative", e.target.value)}
                      placeholder="VD: Ông PHAN KIM LÂM"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-bold ${
                        errors.company_representative ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.company_representative && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.company_representative}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface mb-0.5">
                      {tUI.partyBPosLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.company_position}
                      onChange={(e) => handleInputChange("company_position", e.target.value)}
                      placeholder="VD: Giám đốc Điều hành"
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.company_position ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.company_position && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.company_position}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Pricing & Payment */}
          {activeTab === "pricing" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              {/* Clean Section 2.4 Parameters */}
              <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 space-y-3">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  {tUI.sec24Title}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-1">{tUI.timeSlotsLabel}</label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={formData.time_slots_str}
                      className="w-full px-3 py-1.5 border border-outline-variant/60 rounded-lg bg-surface-container-low font-bold cursor-not-allowed text-secondary opacity-90"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-1">{tUI.guardsPerSlotLabel}</label>
                    <input
                      type="text"
                      readOnly
                      disabled
                      value={`${formData.guards_per_slot_str} ${isEn ? "guards / shift" : "nhân sự / ca"}`}
                      className="w-full px-3 py-1.5 border border-outline-variant/60 rounded-lg bg-surface-container-low font-bold cursor-not-allowed opacity-90"
                    />
                  </div>

                  {/* Active Days Badges container */}
                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-1">{tUI.daysPerWeekLabel}</label>
                    <div className="flex gap-1 bg-surface-container-low/40 p-1 border border-outline-variant/60 rounded-xl">
                      {DAYS_OF_WEEK_SHORT.map((dayObj) => {
                        const active = isDayActive(formData.days_per_week_list, dayObj.value, dayObj.label);
                        return (
                          <div
                            key={dayObj.value}
                            className={`flex-1 text-center py-1 text-xs font-bold rounded-md select-none transition-all ${
                              active
                                ? "bg-primary text-on-primary shadow-xs"
                                : "bg-surface-container-low text-on-surface-variant/30 font-medium"
                            }`}
                          >
                            {dayObj.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing inputs: Read-Only / Fixed from Booking Quote */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {tUI.totalContractValLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.total_price_formatted}
                    className="w-full px-3 py-2 text-xs border border-outline-variant/60 rounded-lg bg-surface-container-low font-mono font-bold text-primary cursor-not-allowed opacity-90"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {tUI.unitPriceLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    disabled
                    value={formData.unit_price_detail}
                    className="w-full px-3 py-2 text-xs border border-outline-variant/60 rounded-lg bg-surface-container-low font-mono font-semibold text-on-surface cursor-not-allowed opacity-90"
                  />
                </div>

                {/* Nullable VAT Status (Placeholder ONLY) */}
                <div>
                  <label className="block text-xs font-bold text-on-surface mb-1">
                    {tUI.vatStatusLabel}
                  </label>
                  <input
                    type="text"
                    value={formData.vat_status}
                    onChange={(e) => handleInputChange("vat_status", e.target.value)}
                    placeholder="VD: chưa bao gồm Thuế VAT (8%) hoặc Đã bao gồm VAT"
                    className="w-full px-3 py-2 text-xs border border-outline-variant rounded-lg bg-surface-bright font-medium"
                  />
                </div>
              </div>

              {/* Overtime Pricing */}
              <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 space-y-3">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  {tUI.overtimeTitle}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-0.5">{tUI.otNormalLabel}</label>
                    <input
                      type="text"
                      value={formData.overtime_normal}
                      onChange={(e) => handleInputChange("overtime_normal", e.target.value)}
                      placeholder="VD: 30.000 VNĐ/giờ/nhân sự"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-0.5">{tUI.otSundayLabel}</label>
                    <input
                      type="text"
                      value={formData.overtime_sunday}
                      onChange={(e) => handleInputChange("overtime_sunday", e.target.value)}
                      placeholder="VD: 45.000 VNĐ/giờ/nhân sự"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-0.5">{tUI.otHolidayLabel}</label>
                    <input
                      type="text"
                      value={formData.overtime_holiday}
                      onChange={(e) => handleInputChange("overtime_holiday", e.target.value)}
                      placeholder="VD: 70.000 VNĐ/giờ/nhân sự"
                      className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6.3: Refined Payment Method & Bank Selector */}
              <div className="p-4 bg-surface-container-low/60 rounded-xl border border-outline-variant/60 space-y-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-primary" />
                  {tUI.paymentSecTitle}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-0.5">
                      {tUI.paymentMethodLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <select
                      value={formData.payment_method}
                      onChange={(e) => handleInputChange("payment_method", e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg bg-surface-bright font-medium cursor-pointer ${
                        errors.payment_method ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    >
                      <option value="Chuyển khoản ngân hàng">{isEn ? "Bank Transfer" : "Chuyển khoản ngân hàng"}</option>
                      <option value="Tiền mặt">{isEn ? "Cash" : "Tiền mặt"}</option>
                    </select>
                    {errors.payment_method && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.payment_method}</p>}
                  </div>

                  <div>
                    <label className="block font-semibold text-on-surface-variant mb-0.5">
                      {tUI.paymentTermLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.payment_term}
                      onChange={(e) => handleInputChange("payment_term", e.target.value)}
                      placeholder="VD: Bên A thanh toán từ ngày 01 đến ngày 05 của tháng tiếp theo."
                      className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium ${
                        errors.payment_term ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                      }`}
                    />
                    {errors.payment_term && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.payment_term}</p>}
                  </div>
                </div>

                {/* Bank details section */}
                {formData.payment_method === "Chuyển khoản ngân hàng" && (
                  <div className="pt-3 border-t border-outline-variant/30 space-y-3 animate-in fade-in duration-150">
                    <label className="block text-xs font-bold text-on-surface">
                      {tUI.bankDetailsTitle}
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <label className="block font-medium text-on-surface-variant mb-0.5">
                          {tUI.bankNameLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <select
                          value={formData.bank_name}
                          onChange={(e) => handleInputChange("bank_name", e.target.value)}
                          className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-medium cursor-pointer ${
                            errors.bank_name ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                          }`}
                        >
                          <option value="">{isEn ? "-- Select bank --" : "-- Chọn ngân hàng --"}</option>
                          {POPULAR_BANKS.map((b) => (
                            <option key={b.code} value={b.shortName}>
                              {b.shortName} - {b.name}
                            </option>
                          ))}
                        </select>
                        {errors.bank_name && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.bank_name}</p>}
                      </div>

                      <div>
                        <label className="block font-medium text-on-surface-variant mb-0.5">{tUI.bankBranchLabel}</label>
                        <input
                          type="text"
                          value={formData.bank_branch}
                          onChange={(e) => handleInputChange("bank_branch", e.target.value)}
                          placeholder="VD: Cần Thơ"
                          className="w-full px-3 py-1.5 border border-outline-variant rounded-lg bg-surface-bright font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-medium text-on-surface-variant mb-0.5">
                          {tUI.bankAccountNoLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.bank_account_no}
                          onChange={(e) => handleInputChange("bank_account_no", e.target.value)}
                          placeholder="VD: 1029384756"
                          className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-mono font-medium ${
                            errors.bank_account_no ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                          }`}
                        />
                        {errors.bank_account_no && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.bank_account_no}</p>}
                      </div>

                      <div>
                        <label className="block font-medium text-on-surface-variant mb-0.5">
                          {tUI.bankAccountHolderLabel} <span className="text-red-500 font-bold ml-0.5">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.bank_account_holder}
                          onChange={(e) => handleInputChange("bank_account_holder", e.target.value)}
                          placeholder="Tên chủ tài khoản"
                          className={`w-full px-3 py-1.5 border rounded-lg bg-surface-bright font-bold ${
                            errors.bank_account_holder ? "border-red-500 bg-red-50/30" : "border-outline-variant"
                          }`}
                        />
                        {errors.bank_account_holder && <p className="text-[11px] text-red-500 mt-1 font-semibold">{errors.bank_account_holder}</p>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Footer Navigation Buttons */}
        <div className="p-4 px-6 border-t border-outline-variant/40 bg-surface-container-low/50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {activeTab !== "general" && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevTab}
                className="px-4 py-2 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{tUI.backBtn}</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="px-3 py-2 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              {tUI.cancelBtn}
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {activeTab !== "pricing" ? (
              <Button
                type="button"
                onClick={handleNextTab}
                className="bg-primary hover:bg-primary/90 text-on-primary font-bold px-5 py-2 text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <span>{tUI.nextBtn}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleOpenExportConfirm}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2 text-xs flex items-center gap-2 shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>{tUI.exportBtn}</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Step Dialog Overlay */}
      {isConfirmOpen && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md w-screen h-screen flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden border border-outline-variant text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 font-headline">
              <Download className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-on-surface font-headline">
                {tUI.confirmTitle}
              </h3>
              <p className="text-xs text-on-surface-variant/80 mt-1 leading-relaxed">
                {tUI.confirmSub}
              </p>
            </div>

            <div className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-left text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{tUI.contractCodeLabel}:</span>
                <strong className="text-on-surface font-mono">{formData.contract_code}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{isEn ? "Party A:" : "Bên thuê (A):"}</span>
                <strong className="text-on-surface">{formData.customer_company_name || formData.customer_representative}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{isEn ? "Party B:" : "Bên cung cấp (B):"}</span>
                <strong className="text-on-surface">{formData.company_name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">{tUI.totalContractValLabel}:</span>
                <strong className="text-primary font-mono">{formData.total_price_formatted}</strong>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="flex-1 py-2 text-xs font-semibold cursor-pointer"
              >
                {tUI.confirmReviewBtn}
              </Button>
              <Button
                type="button"
                onClick={handleConfirmFinalExport}
                className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md cursor-pointer"
              >
                {tUI.confirmFinalBtn}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
