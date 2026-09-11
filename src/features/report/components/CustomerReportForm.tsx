import React, { useState, useEffect } from "react";
import { AlertTriangle, Clock, HelpCircle, Loader2, Send, Upload, X } from "lucide-react";
import { Contract } from "@/types/Contract";
import { ReportType } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { requestGetTodayShiftsByContract } from "@/features/shift/api/shift.api";
import type { ShiftWithAssignments } from "@/features/shift/type";
import { formatTime, getUserTimeZone } from "@/utils/dateTime";

const CONTRACT_STATUS_BADGE: Record<string, string> = {
  active: "✅",
  pending_signatures: "⏳",
  completed: "☑️",
  cancelled: "❌",
};

const CONTRACT_STATUS_FALLBACK: Record<string, string> = {
  active: "Đang hiệu lực",
  pending_signatures: "Chờ ký kết",
  completed: "Đã hoàn thành",
  cancelled: "Đã hủy",
};

const getContractStatusText = (status: string, dict?: any) => {
  const badge = CONTRACT_STATUS_BADGE[status] ?? "";
  const label =
    dict?.report?.form?.contract_status?.[status] ??
    CONTRACT_STATUS_FALLBACK[status] ??
    status;
  return badge ? `${badge} ${label}` : label;
};

interface CustomerReportFormProps {
  contracts: Contract[];
  isLoadingContracts: boolean;
  onSubmit: (payload: {
    contractId: string;
    shiftId: string | null;
    type: ReportType;
    description: string;
    imageUrl: string | null;
    imageFile?: File | null;
  }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  defaultContractId?: string;
  defaultShiftId?: string;
  defaultDate?: string;
}

export function CustomerReportForm({
  contracts,
  isLoadingContracts,
  onSubmit,
  isSubmitting,
  onCancel,
  defaultContractId,
  defaultShiftId,
  defaultDate,
}: CustomerReportFormProps) {
  const { dict } = useTranslation();
  const [selectedContractId, setSelectedContractId] = useState(defaultContractId ?? "");
  const [selectedShiftId, setSelectedShiftId] = useState(defaultShiftId ?? "");
  const [todayShifts, setTodayShifts] = useState<ShiftWithAssignments[]>([]);
  const [isLoadingShifts, setIsLoadingShifts] = useState(false);
  const [type, setType] = useState<ReportType>("LATE");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter for contracts:
  // 1. Exclude 'pending_signatures' and 'cancelled'
  // 2. Allow 'active'
  // 3. Allow 'completed' only if completed within the last 14 days
  // 4. Always include defaultContractId if provided
  const displayContracts = contracts
    .filter((c) => {
      if (defaultContractId && c.contract_id === defaultContractId) return true;

      // Exclude pending_signatures and cancelled
      if (c.status === "pending_signatures" || c.status === "cancelled") {
        return false;
      }

      // Active contracts are always allowed
      if (c.status === "active") {
        return true;
      }

      // Completed contracts: only if completed within the last 14 days
      if (c.status === "completed") {
        if (!c.end_date) return true;
        const endDate = new Date(c.end_date);
        if (isNaN(endDate.getTime())) return true;
        // Đặt mốc hết hạn là cuối ngày kết thúc (23:59:59)
        endDate.setHours(23, 59, 59, 999);

        const now = new Date();
        const diffInDays = (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffInDays <= 14;
      }

      return false;
    })
    .sort((a, b) => {
      // Prioritize active contracts at the top
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;
      return 0;
    });

  const getClientTodayDate = () => {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: getUserTimeZone(),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());

    const year = parts.find((p) => p.type === "year")?.value ?? "";
    const month = parts.find((p) => p.type === "month")?.value ?? "";
    const day = parts.find((p) => p.type === "day")?.value ?? "";

    return `${year}-${month}-${day}`;
  };

  // Fetch today's shifts when contract changes
  useEffect(() => {
    if (!selectedContractId) {
      setTodayShifts([]);
      setSelectedShiftId("");
      return;
    }

    let cancelled = false;
    setIsLoadingShifts(true);
    setTodayShifts([]);

    const queryDate = defaultDate || getClientTodayDate();

    requestGetTodayShiftsByContract(selectedContractId, queryDate)
      .then((res) => {
        if (!cancelled) {
          setTodayShifts(res.data ?? []);
          // Pre-select defaultShiftId only on first load
          if (defaultShiftId && res.data?.some((s) => s.shift_id === defaultShiftId)) {
            setSelectedShiftId(defaultShiftId);
          } else if (!defaultShiftId) {
            setSelectedShiftId("");
          }
        }
      })
      .catch(() => {
        if (!cancelled) setTodayShifts([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingShifts(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedContractId, defaultDate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage(dict.report.form.error_file_size || "Kích thước tệp quá lớn. Vui lòng chọn ảnh dưới 5MB.");
        return;
      }
      setImageFile(file);
      setErrorMessage(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedContractId) {
      setErrorMessage(dict.report.form.error_contract || "Vui lòng chọn hợp đồng đang áp dụng.");
      return;
    }

    if (!description.trim()) {
      setErrorMessage(dict.report.form.error_description || "Vui lòng mô tả chi tiết nội dung sự việc.");
      return;
    }

    onSubmit({
      contractId: selectedContractId,
      shiftId: selectedShiftId || null,
      type,
      description: description.trim(),
      imageUrl: imagePreview,
      imageFile: imageFile,
    });
  };

  return (
    <div className="max-w-2xl mx-auto bg-white border border-outline-variant rounded-xl shadow-xs overflow-hidden">
      {/* Header */}
      <div className="bg-[#eff4ff] border-b border-[#acc7ff] p-5 flex items-center gap-3">
        <AlertTriangle className="w-6 h-6 text-primary shrink-0" />
        <div>
          <h3 className="font-bold text-on-surface text-base">{dict.report.form.title}</h3>
          <p className="text-xs text-on-surface-variant">{dict.report.form.subtitle}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-5 font-body">
        {errorMessage && (
          <div className="p-3 border border-red-200 bg-red-50 text-red-700 text-xs rounded font-medium">
            {errorMessage}
          </div>
        )}

        {/* Contract dropdown */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {dict.report.form.contract_label} <span className="text-red-500">*</span>
          </label>
          {isLoadingContracts ? (
            <div className="h-10 rounded border border-outline-variant flex items-center px-3 gap-2 bg-slate-50">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-xs text-on-surface-variant">Đang tải danh sách hợp đồng...</span>
            </div>
          ) : (
            <>
              <select
                value={selectedContractId}
                onChange={(e) => {
                  setSelectedContractId(e.target.value);
                  setSelectedShiftId("");
                }}
                className="bg-white rounded border border-outline-variant focus:border-primary outline-none text-sm text-on-surface px-3 py-2 w-full h-10 cursor-pointer"
                required
              >
                <option value="">-- {dict?.report?.form?.contract_placeholder || "Chọn hợp đồng..."} --</option>
                {displayContracts.map((c) => {
                  const dateInfo = c.end_date
                    ? ` · ${dict?.report?.form?.contract_expiry || "Hết hạn"}: ${new Date(c.end_date).toLocaleDateString()}`
                    : "";
                  const statusText = getContractStatusText(c.status, dict);
                  return (
                    <option key={c.contract_id} value={c.contract_id}>
                      [{c.contract_code || "HD-CỦA-BẠN"}] {c.service_name || (dict?.report?.form?.default_service || "Dịch vụ bảo vệ")} — {statusText}{dateInfo}
                    </option>
                  );
                })}
              </select>

              {/* Ghi chú bình thường, không tô màu, hiển thị tooltip khi hover icon ? */}
              <div className="flex items-center text-xs text-on-surface-variant mt-0.5">
                <div className="group relative inline-flex items-center gap-1.5 cursor-help">
                  <span className="hover:text-on-surface transition-colors">
                    * {dict?.report?.form?.completed_contract_hint || "Lưu ý về hợp đồng đã hoàn thành"}
                  </span>
                  <HelpCircle className="w-3.5 h-3.5 text-on-surface-variant/70 group-hover:text-primary transition-colors shrink-0" />
                  <div className="absolute left-0 bottom-full mb-1.5 hidden group-hover:block w-72 p-2.5 bg-[#1e293b] text-white text-xs font-normal rounded-lg shadow-xl z-30 leading-relaxed pointer-events-none">
                    <span className="font-semibold text-slate-100">
                      {dict?.report?.form?.completed_contract_title || "Hợp đồng đã hoàn thành"}:{" "}
                    </span>
                    <span className="text-slate-200">
                      {dict?.report?.form?.completed_contract_note ||
                        "Hệ thống chỉ hỗ trợ tiếp nhận phản ánh/khiếu nại trong vòng 14 ngày kể từ ngày kết thúc hợp đồng."}
                    </span>
                    <div className="absolute top-full left-3 border-4 border-transparent border-t-[#1e293b]" />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Shift dropdown — only shows when a contract is selected */}
        {selectedContractId && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {dict?.shift_week?.today_shifts_label || "Ca trực hôm nay"}
              <span className="text-on-surface-variant font-normal normal-case tracking-normal ml-1">
                {dict?.shift_week?.today_shifts_optional || "(tùy chọn)"}
              </span>
            </label>
            {isLoadingShifts ? (
              <div className="h-10 rounded border border-outline-variant flex items-center px-3 gap-2 bg-slate-50">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-xs text-on-surface-variant">
                  {dict?.shift_week?.today_shifts_loading || "Đang tải ca trực hôm nay..."}
                </span>
              </div>
            ) : todayShifts.length === 0 ? (
              <div className="h-10 rounded border border-outline-variant flex items-center px-3 bg-slate-50">
                <span className="text-xs text-on-surface-variant italic">
                  {dict?.shift_week?.today_shifts_empty || "Không có ca trực nào hôm nay cho hợp đồng này"}
                </span>
              </div>
            ) : (
              <select
                value={selectedShiftId}
                onChange={(e) => setSelectedShiftId(e.target.value)}
                className="bg-white rounded border border-outline-variant focus:border-primary outline-none text-sm text-on-surface px-3 py-2 w-full h-10 cursor-pointer"
              >
                <option value="">{dict?.shift_week?.shift_no_specific || "-- Không chọn ca cụ thể --"}</option>
                {todayShifts.map((s) => (
                  <option key={s.shift_id} value={s.shift_id}>
                    {s.shift_name || (dict?.shift_week?.shift_default_name || "Ca trực")}: {formatTime(s.start_time)} – {formatTime(s.end_time)}
                    {s.location ? ` (${s.location})` : ""}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {/* Type of Incident */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {dict.report.form.type_label} <span className="text-red-500">*</span>
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as ReportType)}
            className="bg-white rounded border border-outline-variant focus:border-primary outline-none text-sm text-on-surface px-3 py-2 w-full h-10 cursor-pointer"
            required
          >
            <option value="LATE">Đi muộn (LATE)</option>
            <option value="ABSENT">Vắng mặt (ABSENT)</option>
            <option value="BAD_ATTITUDE">Thái độ không tốt (BAD_ATTITUDE)</option>
            <option value="SLEEPING">Ngủ gật trong giờ trực (SLEEPING)</option>
            <option value="OTHER">Khác (OTHER)</option>
          </select>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {dict.report.form.desc_label} <span className="text-red-500">*</span>
          </label>
          <textarea
            placeholder={dict.report.form.desc_placeholder}
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 500))}
            className="bg-white rounded border border-outline-variant focus:border-primary outline-none text-sm text-on-surface px-3 py-2 w-full min-h-36 resize-y leading-relaxed"
            maxLength={500}
            required
          />
          <p className={`text-[11px] text-right font-medium ${description.length >= 500 ? "text-red-500" : "text-on-surface-variant/60"}`}>
            {description.length}/500 ký tự
          </p>
        </div>

        {/* Attached Image */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-on-surface uppercase tracking-wider">
            {dict.report.form.attachment_label}
          </label>

          <div className="flex items-center gap-4">
            {!imagePreview ? (
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-outline-variant hover:border-primary rounded-lg cursor-pointer w-full h-28 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-6 h-6 text-on-surface-variant mb-1" />
                  <p className="text-xs text-on-surface font-semibold">Tải ảnh lên</p>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">PNG, JPG, JPEG (Tối đa 5MB)</p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full border border-outline-variant rounded-lg p-2 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-16 h-16 object-cover rounded border border-outline-variant"
                  />
                  <div>
                    <p className="text-xs font-semibold text-on-surface line-clamp-1">{imageFile?.name}</p>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">
                      {imageFile ? (imageFile.size / (1024 * 1024)).toFixed(2) + " MB" : ""}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 hover:bg-red-50 text-red-500 rounded-full transition-colors mr-2 cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 border border-slate-200 hover:bg-slate-100 transition-colors rounded text-sm font-semibold text-slate-700 cursor-pointer font-body"
          >
            {dict.report.form.cancel}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-primary hover:bg-[#023b7e] disabled:opacity-50 text-white font-bold rounded text-sm flex items-center gap-2 shadow-md cursor-pointer transition-all active:scale-[0.98] font-body"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> {dict.report.form.submitting}
              </>
            ) : (
              <>
                <Send className="w-4 h-4" /> {dict.report.form.submit}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
