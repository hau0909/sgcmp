"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, ChevronRight, Lock, Upload, X } from "lucide-react";
import { useOnboardingData } from "../hooks/useOnboardingData";
import OnboardingFooter from "./OnboardingFooter";
import {
  onboardingBreadcrumb,
  onboardingBreadcrumbActive,
  onboardingCard,
  onboardingCardTitle,
  onboardingInfoBox,
  onboardingInfoText,
  onboardingInput,
  onboardingInputError,
  onboardingLabel,
  onboardingPageBg,
  onboardingPageSubtitle,
  onboardingPageTitle,
} from "./onboardingStyles";
import { DEFAULT_BUSINESS_LICENSE, ISSUE_PLACES, type BusinessLicenseData } from "../types";

type FormErrors = Partial<Record<keyof BusinessLicenseData, string>> & { licenseFile?: string };

const fieldClass = (hasError?: boolean) => (hasError ? onboardingInputError : onboardingInput);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];

export default function BusinessLicenseForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data, isLoaded, saveBusinessLicense } = useOnboardingData();
  const [form, setForm] = useState<BusinessLicenseData>(DEFAULT_BUSINESS_LICENSE);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (isLoaded) setForm(data.businessLicense);
  }, [isLoaded, data.businessLicense]);

  const updateField = <K extends keyof BusinessLicenseData>(key: K, value: BusinessLicenseData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrors((p) => ({ ...p, licenseFile: "Chỉ chấp nhận file PDF, JPG hoặc PNG" }));
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setErrors((p) => ({ ...p, licenseFile: "Kích thước file tối đa 10MB" }));
      return;
    }
    setLicenseFile(file);
    updateField("licenseFileName", file.name);
    setErrors((p) => ({ ...p, licenseFile: undefined }));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};
    if (!form.registrationNumber.trim()) newErrors.registrationNumber = "Vui lòng nhập số giấy chứng nhận";
    if (!form.issueDate) newErrors.issueDate = "Vui lòng chọn ngày cấp";
    if (!form.issuePlace) newErrors.issuePlace = "Vui lòng chọn nơi cấp";
    if (!form.representativeName.trim()) newErrors.representativeName = "Vui lòng nhập họ và tên";
    if (!form.representativeId.trim()) newErrors.representativeId = "Vui lòng nhập số CCCD/Hộ chiếu";
    if (!form.representativePosition.trim()) newErrors.representativePosition = "Vui lòng nhập chức vụ";
    if (!licenseFile && !form.licenseFileName) newErrors.licenseFile = "Vui lòng tải lên giấy phép kinh doanh";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateForm()) return;
    saveBusinessLicense({ ...form, licenseFileName: licenseFile?.name ?? form.licenseFileName });
    router.push("/onboarding/review");
  };

  return (
    <div className={`flex flex-col flex-1 min-h-0 ${onboardingPageBg}`}>
      <div className="flex-1 overflow-y-auto px-6 lg:px-10 py-8">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <nav className={onboardingBreadcrumb}>
            <span>Onboarding</span>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <span className={onboardingBreadcrumbActive}>Giấy phép Kinh doanh</span>
          </nav>
          <div>
            <h2 className={onboardingPageTitle}>Xác thực Giấy phép Kinh doanh</h2>
            <p className={`${onboardingPageSubtitle} max-w-2xl`}>
              Cung cấp thông tin chính xác về giấy phép kinh doanh để hệ thống xác minh tính hợp lệ của doanh nghiệp theo quy định pháp luật.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <div className={`${onboardingCard} p-6`}>
                <h3 className={onboardingCardTitle}>Thông tin Giấy phép</h3>
                <div className="space-y-4">
                  <div>
                    <label className={onboardingLabel}>Số giấy chứng nhận đăng ký kinh doanh <span className="text-error">*</span></label>
                    <input type="text" placeholder="VD: 0123456789" value={form.registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} className={fieldClass(!!errors.registrationNumber)} />
                    {errors.registrationNumber && <p className="mt-1 text-xs text-error">{errors.registrationNumber}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={onboardingLabel}>Ngày cấp <span className="text-error">*</span></label>
                      <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
                        <input type="date" value={form.issueDate} onChange={(e) => updateField("issueDate", e.target.value)} className={`${fieldClass(!!errors.issueDate)} pl-10`} />
                      </div>
                      {errors.issueDate && <p className="mt-1 text-xs text-error">{errors.issueDate}</p>}
                    </div>
                    <div>
                      <label className={onboardingLabel}>Nơi cấp <span className="text-error">*</span></label>
                      <select value={form.issuePlace} onChange={(e) => updateField("issuePlace", e.target.value)} className={fieldClass(!!errors.issuePlace)}>
                        <option value="">Chọn tỉnh/thành phố</option>
                        {ISSUE_PLACES.map((p) => <option key={p} value={p}>{p}</option>)}
                      </select>
                      {errors.issuePlace && <p className="mt-1 text-xs text-error">{errors.issuePlace}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className={`${onboardingCard} p-6`}>
                <h3 className={onboardingCardTitle}>Người đại diện pháp luật</h3>
                <div className="space-y-4">
                  <div>
                    <label className={onboardingLabel}>Họ và tên người đại diện <span className="text-error">*</span></label>
                    <input type="text" placeholder="Họ và tên đầy đủ" value={form.representativeName} onChange={(e) => updateField("representativeName", e.target.value)} className={fieldClass(!!errors.representativeName)} />
                    {errors.representativeName && <p className="mt-1 text-xs text-error">{errors.representativeName}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={onboardingLabel}>Số CCCD/Hộ chiếu <span className="text-error">*</span></label>
                      <input type="text" placeholder="Số định danh" value={form.representativeId} onChange={(e) => updateField("representativeId", e.target.value)} className={fieldClass(!!errors.representativeId)} />
                      {errors.representativeId && <p className="mt-1 text-xs text-error">{errors.representativeId}</p>}
                    </div>
                    <div>
                      <label className={onboardingLabel}>Chức vụ <span className="text-error">*</span></label>
                      <input type="text" placeholder="VD: Giám đốc" value={form.representativePosition} onChange={(e) => updateField("representativePosition", e.target.value)} className={fieldClass(!!errors.representativePosition)} />
                      {errors.representativePosition && <p className="mt-1 text-xs text-error">{errors.representativePosition}</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className={`${onboardingCard} p-6 h-full flex flex-col`}>
                <h3 className="text-[15px] font-bold text-on-surface mb-2 font-headline">Tài liệu đính kèm</h3>
                <p className="text-xs text-on-surface-variant mb-5 leading-relaxed font-body">
                  Tải lên bản scan hoặc ảnh chụp màu của giấy chứng nhận đăng ký kinh doanh bản gốc.
                </p>
                <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                {(licenseFile || form.licenseFileName) ? (
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-outline-variant bg-surface-container-low px-4 py-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed/50 flex items-center justify-center shrink-0">
                        <Upload className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-on-surface truncate">{licenseFile?.name ?? form.licenseFileName}</p>
                        {licenseFile && <p className="text-[11px] text-on-surface-variant">{(licenseFile.size / 1024 / 1024).toFixed(2)} MB</p>}
                      </div>
                    </div>
                    <button type="button" onClick={() => { setLicenseFile(null); updateField("licenseFileName", null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="p-1.5 rounded-md text-on-surface-variant hover:text-error hover:bg-error-container shrink-0"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    className={`flex-1 min-h-[220px] flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed cursor-pointer transition-colors ${
                      isDragging ? "border-primary bg-primary-fixed/30" : errors.licenseFile ? "border-error bg-error-container/30" : "border-outline-variant hover:border-primary hover:bg-surface-container-low"
                    }`}
                  >
                    <div className="w-14 h-14 rounded-full bg-surface-container-low flex items-center justify-center">
                      <Upload className="w-7 h-7 text-on-surface-variant" />
                    </div>
                    <div className="text-center px-4">
                      <p className="text-sm font-semibold text-on-surface">Kéo thả file hoặc nhấn để tải lên</p>
                      <p className="text-xs text-on-surface-variant mt-1">PDF, JPG, PNG — Tối đa 10MB</p>
                    </div>
                  </div>
                )}
                {errors.licenseFile && <p className="mt-2 text-xs text-error">{errors.licenseFile}</p>}
                <div className={`${onboardingInfoBox} mt-5`}>
                  <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <p className={onboardingInfoText}>
                    Thông tin được mã hóa theo tiêu chuẩn AES-256 và chỉ sử dụng cho mục đích xác minh pháp lý.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <OnboardingFooter backHref="/onboarding/component-profile" onNext={handleNext} onSkip={() => router.push("/onboarding/review")} skipLabel="Bỏ qua bước này" nextLabel="Tiếp theo" />
    </div>
  );
}
