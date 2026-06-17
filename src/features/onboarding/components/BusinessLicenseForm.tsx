"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  ChevronRight,
  Lock,
  Upload,
  X,
} from "lucide-react";
import { useOnboardingData } from "../hooks/useOnboardingData";
import OnboardingFooter from "./OnboardingFooter";
import { DEFAULT_BUSINESS_LICENSE, ISSUE_PLACES, type BusinessLicenseData } from "../types";

type FormErrors = Partial<Record<keyof BusinessLicenseData, string>> & {
  licenseFile?: string;
};

const inputClass = (hasError?: boolean) =>
  `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition placeholder:text-on-surface-variant/60 focus:ring-1 ${
    hasError
      ? "border-error focus:border-error focus:ring-error"
      : "border-outline-variant focus:border-primary focus:ring-primary bg-surface-container-lowest"
  }`;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export default function BusinessLicenseForm({ onNext, onBack, onSkip }: { onNext?: () => void; onBack?: () => void; onSkip?: () => void }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoaded, saveBusinessLicense } = useOnboardingData();

  const [form, setForm] = useState<BusinessLicenseData>(DEFAULT_BUSINESS_LICENSE);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [idFrontCard, setIdFrontCard] = useState<string | null>(null);
  const [idBackCard, setIdBackCard] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      setForm(data.businessLicense);
      setIdFrontCard(data.businessLicense.idFrontCardFileName);
      setIdBackCard(data.businessLicense.idBackCardFileName);
    }
  }, [isLoaded, data.businessLicense]);

  const updateField = <K extends keyof BusinessLicenseData>(key: K, value: BusinessLicenseData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        licenseFile: "Chỉ chấp nhận file PDF, JPG hoặc PNG",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        licenseFile: "Kích thước file tối đa 10MB",
      }));
      return;
    }

    setLicenseFile(file);
    updateField("licenseFileName", file.name);
    setErrors((prev) => ({ ...prev, licenseFile: undefined }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleCCCDUpload = (e: React.ChangeEvent<HTMLInputElement>, side: "front" | "back") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((prev) => ({
        ...prev,
        [side === "front" ? "idFrontCardFileName" : "idBackCardFileName"]: "Chỉ chấp nhận file JPG hoặc PNG",
      }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((prev) => ({
        ...prev,
        [side === "front" ? "idFrontCardFileName" : "idBackCardFileName"]: "Kích thước file tối đa 10MB",
      }));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === "front") {
        setIdFrontCard(reader.result as string);
        setErrors((prev) => ({ ...prev, idFrontCardFileName: undefined }));
      } else {
        setIdBackCard(reader.result as string);
        setErrors((prev) => ({ ...prev, idBackCardFileName: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!form.registrationNumber.trim()) {
      newErrors.registrationNumber = "Vui lòng nhập số giấy chứng nhận";
    }
    if (!form.issueDate) {
      newErrors.issueDate = "Vui lòng chọn ngày cấp";
    }
    if (!form.issuePlace) {
      newErrors.issuePlace = "Vui lòng chọn nơi cấp";
    }
    if (!form.representativeName.trim()) {
      newErrors.representativeName = "Vui lòng nhập họ và tên";
    }
    if (!form.representativeId.trim()) {
      newErrors.representativeId = "Vui lòng nhập số CCCD/Hộ chiếu";
    }
    if (!form.representativePosition.trim()) {
      newErrors.representativePosition = "Vui lòng nhập chức vụ";
    }
    if (!licenseFile && !form.licenseFileName) {
      newErrors.licenseFile = "Vui lòng tải lên giấy phép kinh doanh";
    }
    if (!idFrontCard) {
      newErrors.idFrontCardFileName = "Vui lòng tải lên ảnh mặt trước CCCD";
    }
    if (!idBackCard) {
      newErrors.idBackCardFileName = "Vui lòng tải lên ảnh mặt sau CCCD";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;

    saveBusinessLicense({
      ...form,
      licenseFileName: licenseFile?.name ?? form.licenseFileName,
      idFrontCardFileName: idFrontCard,
      idBackCardFileName: idBackCard,
    });
    if (onNext) {
      onNext();
    } else {
      router.push("/onboarding/review");
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    } else {
      router.push("/onboarding/review");
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className="text-primary font-semibold">Giấy phép Kinh doanh</span>
          </nav>

          {/* Page Header */}
          <div>
            <h2 className="text-2xl font-bold text-on-surface tracking-tight">
              Xác thực Giấy phép Kinh doanh
            </h2>
            <p className="text-sm text-on-surface-variant mt-1 max-w-2xl">
              Cung cấp thông tin chính xác về giấy phép kinh doanh để hệ thống xác minh
              tính hợp lệ của doanh nghiệp theo quy định pháp luật.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Forms */}
            <div className="lg:col-span-3 space-y-6">
              {/* License Info Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-on-surface mb-5">
                  Thông tin Giấy phép
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                      Số giấy chứng nhận đăng ký kinh doanh
                      <span className="text-error ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="VD: 0123456789"
                      value={form.registrationNumber}
                      onChange={(e) => updateField("registrationNumber", e.target.value)}
                      className={inputClass(!!errors.registrationNumber)}
                    />
                    {errors.registrationNumber && (
                      <p className="mt-1 text-xs font-medium text-error">{errors.registrationNumber}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                        Ngày cấp
                        <span className="text-error ml-0.5">*</span>
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                        <input
                          type="date"
                          value={form.issueDate}
                          onChange={(e) => updateField("issueDate", e.target.value)}
                          className={`${inputClass(!!errors.issueDate)} pl-10`}
                        />
                      </div>
                      {errors.issueDate && (
                        <p className="mt-1 text-xs font-medium text-error">{errors.issueDate}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                        Nơi cấp
                        <span className="text-error ml-0.5">*</span>
                      </label>
                      <select
                        value={form.issuePlace}
                        onChange={(e) => updateField("issuePlace", e.target.value)}
                        className={inputClass(!!errors.issuePlace)}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        {ISSUE_PLACES.map((place) => (
                          <option key={place} value={place}>
                            {place}
                          </option>
                        ))}
                      </select>
                      {errors.issuePlace && (
                        <p className="mt-1 text-xs font-medium text-error">{errors.issuePlace}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Legal Representative Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm">
                <h3 className="text-base font-bold text-on-surface mb-5">
                  Người đại diện pháp luật
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                      Họ và tên người đại diện
                      <span className="text-error ml-0.5">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Họ và tên đầy đủ"
                      value={form.representativeName}
                      onChange={(e) => updateField("representativeName", e.target.value)}
                      className={inputClass(!!errors.representativeName)}
                    />
                    {errors.representativeName && (
                      <p className="mt-1 text-xs font-medium text-error">{errors.representativeName}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                        Số CCCD/Hộ chiếu
                        <span className="text-error ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Số định danh"
                        value={form.representativeId}
                        onChange={(e) => updateField("representativeId", e.target.value)}
                        className={inputClass(!!errors.representativeId)}
                      />
                      {errors.representativeId && (
                        <p className="mt-1 text-xs font-medium text-error">{errors.representativeId}</p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-on-surface">
                        Chức vụ
                        <span className="text-error ml-0.5">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Giám đốc"
                        value={form.representativePosition}
                        onChange={(e) => updateField("representativePosition", e.target.value)}
                        className={inputClass(!!errors.representativePosition)}
                      />
                      {errors.representativePosition && (
                        <p className="mt-1 text-xs font-medium text-error">{errors.representativePosition}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Mặt trước CCCD */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Mặt trước CCCD
                        <span className="text-error ml-0.5">*</span>
                      </label>
                      
                      {idFrontCard ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low group">
                          <img src={idFrontCard} alt="Mặt trước CCCD" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setIdFrontCard(null)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-error transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-outline-variant hover:border-primary hover:bg-surface-container-low cursor-pointer transition-colors min-h-[100px]">
                          <Upload className="w-5 h-5 text-on-surface-variant mb-1" />
                          <span className="text-[11px] font-semibold text-on-surface">Tải lên Mặt trước</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCCCDUpload(e, "front")}
                            className="hidden"
                          />
                        </label>
                      )}
                      {errors.idFrontCardFileName && (
                        <p className="mt-1 text-xs font-medium text-error">{errors.idFrontCardFileName}</p>
                      )}
                    </div>

                    {/* Mặt sau CCCD */}
                    <div>
                      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Mặt sau CCCD
                        <span className="text-error ml-0.5">*</span>
                      </label>
                      
                      {idBackCard ? (
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-outline-variant bg-surface-container-low group">
                          <img src={idBackCard} alt="Mặt sau CCCD" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setIdBackCard(null)}
                            className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white hover:bg-error transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center aspect-video rounded-lg border-2 border-dashed border-outline-variant hover:border-primary hover:bg-surface-container-low cursor-pointer transition-colors min-h-[100px]">
                          <Upload className="w-5 h-5 text-on-surface-variant mb-1" />
                          <span className="text-[11px] font-semibold text-on-surface">Tải lên Mặt sau</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleCCCDUpload(e, "back")}
                            className="hidden"
                          />
                        </label>
                      )}
                      {errors.idBackCardFileName && (
                        <p className="mt-1 text-xs font-medium text-error">{errors.idBackCardFileName}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Upload */}
            <div className="lg:col-span-2">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm h-full flex flex-col">
                <h3 className="text-base font-bold text-on-surface mb-2">
                  Tài liệu đính kèm
                </h3>
                <p className="text-xs text-on-surface-variant mb-5 leading-relaxed">
                  Tải lên bản scan hoặc ảnh chụp màu của giấy chứng nhận đăng ký kinh doanh
                  bản gốc.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />

                {(licenseFile || form.licenseFileName) ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">
                          {licenseFile?.name ?? form.licenseFileName}
                        </p>
                        {licenseFile && (
                          <p className="text-[11px] text-on-surface-variant">
                            {(licenseFile.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLicenseFile(null);
                        updateField("licenseFileName", null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container transition-colors shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex-1 min-h-[200px] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : errors.licenseFile
                          ? "border-error bg-error-container/20"
                          : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center">
                      <Upload className="w-7 h-7 text-on-surface-variant" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-semibold text-on-surface">
                        Kéo thả file hoặc nhấn để tải lên
                      </p>
                      <p className="text-xs text-on-surface-variant mt-1">
                        PDF, JPG, PNG — Tối đa 10MB
                      </p>
                    </div>
                  </div>
                )}

                {errors.licenseFile && (
                  <p className="mt-2 text-xs font-medium text-error">{errors.licenseFile}</p>
                )}

                <div className="mt-4 flex items-start gap-3 rounded-lg bg-[#eff6ff] border border-[#bfdbfe] px-4 py-3">
                  <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-xs text-[#1e40af] leading-relaxed">
                    Thông tin được mã hóa theo tiêu chuẩn AES-256 và chỉ sử dụng cho mục đích
                    xác minh pháp lý.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <OnboardingFooter
        onBack={onBack}
        backHref={onBack ? undefined : "/onboarding/component-profile"}
        onNext={handleNext}
        onSkip={handleSkip}
        skipLabel="Bỏ qua bước này"
        nextLabel="Tiếp theo"
      />
    </div>
  );
}
