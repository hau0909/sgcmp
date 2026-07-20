import React, { useState } from "react";
import { AlertTriangle, Loader2, Send, Upload, X } from "lucide-react";
import { Contract } from "@/types/Contract";
import { ReportType } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CustomerReportFormProps {
  contracts: Contract[];
  isLoadingContracts: boolean;
  onSubmit: (payload: {
    contractId: string;
    type: ReportType;
    description: string;
    imageUrl: string | null;
    imageFile?: File | null;
  }) => void;
  isSubmitting: boolean;
  onCancel: () => void;
}

export function CustomerReportForm({
  contracts,
  isLoadingContracts,
  onSubmit,
  isSubmitting,
  onCancel,
}: CustomerReportFormProps) {
  const { dict } = useTranslation();
  const [selectedContractId, setSelectedContractId] = useState("");
  const [type, setType] = useState<ReportType>("LATE");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter for contracts that are not expired yet
  const displayContracts = contracts.filter((c) => {
    if (c.status === "cancelled") return false;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (c.end_date) {
      const end = new Date(c.end_date);
      end.setHours(23, 59, 59, 999);
      if (now > end) return false;
    }

    return true;
  });

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
            <select
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="bg-white rounded border border-outline-variant focus:border-primary outline-none text-sm text-on-surface px-3 py-2 w-full h-10 cursor-pointer"
              required
            >
              <option value="">-- {dict.report.form.contract_placeholder} --</option>
              {displayContracts.map((c) => {
                const dateInfo = c.end_date 
                  ? ` (Hết hạn: ${new Date(c.end_date).toLocaleDateString("vi-VN")})`
                  : "";
                return (
                  <option key={c.contract_id} value={c.contract_id}>
                    [{c.contract_code || "HD-CỦA-BẠN"}] {c.service_name || "Dịch vụ bảo vệ"}{dateInfo}
                  </option>
                );
              })}
            </select>
          )}
        </div>

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
