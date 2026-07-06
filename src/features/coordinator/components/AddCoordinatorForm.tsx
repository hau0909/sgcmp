"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { requestCreateCoordinator } from "@/features/coordinator/api/coordinator.api";
import { requestUpdateProfile } from "@/features/profile/api/profile.api";
import { requestCreateIdentity } from "@/features/identity/api/identity.api";
import { requestGetCities, requestGetWards } from "@/features/address/api/address.api";
import { useAuthStore } from "@/store/auth.store";
import { createClient } from "@/lib/supabase/client";
import {
  City,
  Ward,
} from "../types";
import { validateCoordinatorForm } from "../validator/coordinator.validator";
import { requestGetCoordinators } from "../api/coordinator.api";
import { requestGetCurrentPlan } from "@/features/subscription/api/subscription.api";
import {
  User,
  Phone,
  CreditCard,
  ChevronDown,
  Save,
  X,
  Camera,
  ImagePlus,
  AlertCircle,
  CheckCircle2,
  Upload,
} from "lucide-react";

export interface CoordinatorFormData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  phone_number: string;
  email: string;
  street: string;
  city_id: number | "";
  ward_id: number | "";
  id_number: string;
  issue_date: string;
  issue_place: string;
  avatarFile: File | null;
  avatarPreview: string;
  cccdFrontFile: File | null;
  cccdFrontPreview: string;
  cccdBackFile: File | null;
  cccdBackPreview: string;
}

export const COORDINATOR_FORM_INITIAL: CoordinatorFormData = {
  full_name: "",
  date_of_birth: "",
  gender: "",
  phone_number: "",
  email: "",
  street: "",
  city_id: "",
  ward_id: "",
  id_number: "",
  issue_date: "",
  issue_place: "",
  avatarFile: null,
  avatarPreview: "",
  cccdFrontFile: null,
  cccdFrontPreview: "",
  cccdBackFile: null,
  cccdBackPreview: "",
};


// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 border-b border-outline-variant bg-surface-container-lowest">
        <span className="text-primary w-4 h-4 flex items-center justify-center">{icon}</span>
        <h3 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function FieldLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="block text-body-sm font-body-sm text-on-surface-variant mb-1">
      {children}
      {required && <span className="text-error ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 flex items-center gap-1 text-xs text-error">
      <AlertCircle className="w-3 h-3 shrink-0" />
      {msg}
    </p>
  );
}

function TextInput({
  id, name, value, onChange, placeholder, type = "text", error,
}: {
  id: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string; error?: string;
}) {
  return (
    <div>
      <input
        id={id} name={name} type={type} value={value} onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-3 pr-3 py-1.5 h-[36px] bg-surface-container-lowest border rounded text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 transition-all placeholder:text-on-surface-variant/50 ${
          error
            ? "border-error focus:border-error focus:ring-error/30"
            : "border-outline-variant focus:border-primary focus:ring-primary"
        }`}
      />
      <FieldError msg={error} />
    </div>
  );
}

function SelectInput({
  id, name, value, onChange, placeholder, options, error, disabled,
}: {
  id: string; name: string; value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string; options: { label: string; value: string | number }[];
  error?: string; disabled?: boolean;
}) {
  return (
    <div>
      <div className="relative">
        <select
          id={id} name={name} value={value} onChange={onChange} disabled={disabled}
          className={`w-full appearance-none pl-3 pr-8 py-1.5 h-[36px] bg-surface-container-lowest border rounded text-body-sm font-body-sm text-on-surface focus:outline-none focus:ring-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
            error
              ? "border-error focus:border-error focus:ring-error/30"
              : "border-outline-variant focus:border-primary focus:ring-primary"
          }`}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-[10px] w-[16px] h-[16px] text-on-surface-variant pointer-events-none" />
      </div>
      <FieldError msg={error} />
    </div>
  );
}

function ImageUploadBox({
  label, preview, onFileChange, error, shape = "rect",
}: {
  label: string; preview: string; onFileChange: (file: File | null) => void;
  error?: string; shape?: "circle" | "rect";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handleClick = () => inputRef.current?.click();
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileChange(file);
  };
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  if (shape === "circle") {
    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative group">
          <button
            type="button" onClick={handleClick}
            className={`w-28 h-28 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all hover:border-primary ${
              error ? "border-error" : preview ? "border-primary" : "border-outline-variant"
            }`}
          >
            {preview
              ? <img src={preview} alt="avatar" className="w-full h-full object-cover" />
              : <Camera className="w-8 h-8 text-on-surface-variant" />}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-0 right-0 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 transition-colors z-10"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <span className="text-xs text-on-surface-variant">Ảnh đại diện <span className="text-error">*</span></span>
        {preview && (
          <span className="inline-flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3 h-3" /> Đã chọn
          </span>
        )}
        <FieldError msg={error} />
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </div>
    );
  }

  return (
    <div>
      <div className="relative group">
        <button
          type="button" onClick={handleClick}
          className={`relative w-full min-h-[160px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all duration-200 overflow-hidden ${
            error ? "border-error bg-error/5" : preview ? "border-outline-variant bg-surface-container-low" : "border-outline-variant hover:border-primary/50 hover:bg-surface-container-lowest"
          }`}
        >
          {preview ? (
            <img src={preview} alt="cccd" className="max-h-[140px] rounded-lg object-contain w-full" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/5 text-primary flex items-center justify-center">
                <Upload className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-on-surface">{label}</p>
                <p className="text-xs text-on-surface-variant">Hỗ trợ định dạng ẢNH</p>
              </div>
            </div>
          )}
        </button>
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md hover:bg-error/90 transition-colors z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <FieldError msg={error} />
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AddCoordinatorForm() {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<CoordinatorFormData>(COORDINATOR_FORM_INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [successRedirecting, setSuccessRedirecting] = useState(false);

  const companyId = useAuthStore((state) => state.company_id);

  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [wardsLoading, setWardsLoading] = useState(false);

  // States check limit SaaS
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [limitError, setLimitError] = useState("");

  // 1. Kiểm tra giới hạn SaaS ngay khi vào form
  useEffect(() => {
    if (!companyId) return;
    let isMounted = true;
    const checkLimit = async () => {
      try {
        setCheckingLimit(true);
        const [planRes, coordinatorsRes] = await Promise.all([
          requestGetCurrentPlan(companyId).catch(() => null),
          requestGetCoordinators(companyId, 1, 1).catch(() => ({ total: 0 }))
        ]);

        if (!isMounted) return;

        // requestGetCurrentPlan returns CurrentPlanWithSubscription which has .plan
        const currentPlan = planRes?.plan || planRes;
        if (currentPlan && currentPlan.max_coordinators !== null) {
          if (coordinatorsRes.total >= currentPlan.max_coordinators) {
             setLimitError(`Gói dịch vụ hiện tại (Tối đa ${currentPlan.max_coordinators} Điều phối viên) đã đạt giới hạn. Vui lòng nâng cấp gói để tạo thêm.`);
          }
        }
      } catch (err) {
        console.error("Lỗi kiểm tra giới hạn:", err);
      } finally {
        if (isMounted) setCheckingLimit(false);
      }
    };
    checkLimit();
    return () => { isMounted = false; };
  }, [companyId]);

  // 2. Fetch Tỉnh/Thành phố
  useEffect(() => {
    requestGetCities()
      .then((data: any) => setCities(data?.cities || data || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (form.city_id === "") { setWards([]); return; }
    setWardsLoading(true);
    requestGetWards(form.city_id as number)
      .then((data: any) => setWards(data?.wards || data || []))
      .catch(console.error)
      .finally(() => setWardsLoading(false));
  }, [form.city_id]);

  const clearError = (name: string) =>
    setErrors((prev) => { const e = { ...prev }; delete e[name]; return e; });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "city_id") {
      setForm((prev) => ({ ...prev, city_id: value === "" ? "" : Number(value), ward_id: "" }));
    } else if (name === "ward_id") {
      setForm((prev) => ({ ...prev, ward_id: value === "" ? "" : Number(value) }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    clearError(name);
  };

  const handleImageFile = (
    field: "avatarFile" | "cccdFrontFile" | "cccdBackFile",
    previewField: "avatarPreview" | "cccdFrontPreview" | "cccdBackPreview",
    file: File | null
  ) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setForm((prev) => ({ ...prev, [field]: file, [previewField]: url }));
    } else {
      setForm((prev) => ({ ...prev, [field]: null, [previewField]: "" }));
    }
    clearError(field);
  };

  const uploadToStorage = async (file: File, bucket: string, path: string): Promise<string> => {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, { cacheControl: "3600", upsert: true });
    if (error) throw new Error(`Upload lỗi: ${error.message}`);
    const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(data.path);
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError("");

    const errs = validateCoordinatorForm(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstKey = Object.keys(errs)[0];
      document.getElementById(firstKey)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!companyId) {
      setSubmitError("Không tìm thấy thông tin công ty.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Tạo auth account
      const result = await requestCreateCoordinator({
        email: form.email,
        fullName: form.full_name,
        phoneNumber: form.phone_number,
        companyId,
        identityId: form.id_number,
        issueDate: form.issue_date,
        issuePlace: form.issue_place,
      });

      if (!result.success || !result.userId) {
        setSubmitError(result.message || "Lỗi tạo tài khoản");
        return;
      }

      const { userId } = result;
      const ext = (f: File) => f.name.split(".").pop()?.toLowerCase() || "jpg";

      // 2. Upload ảnh
      let avatarUrl = "";
      let frontUrl = "";
      let backUrl = "";

      if (form.avatarFile)
        avatarUrl = await uploadToStorage(form.avatarFile, "profiles", `${userId}/avatar.${ext(form.avatarFile)}`);
      if (form.cccdFrontFile)
        frontUrl = await uploadToStorage(form.cccdFrontFile, "profiles", `${userId}/identity/front.${ext(form.cccdFrontFile)}`);
      if (form.cccdBackFile)
        backUrl = await uploadToStorage(form.cccdBackFile, "profiles", `${userId}/identity/back.${ext(form.cccdBackFile)}`);

      // 3. Ghép địa chỉ
      const cityObj = cities.find((c) => c.city_id === form.city_id);
      const wardObj = wards.find((w) => w.ward_id === form.ward_id);
      const fullAddress = [form.street, wardObj?.ward_name, cityObj?.city_name].filter(Boolean).join(", ");

      // 4. Cập nhật profile
      const profileResult = await requestUpdateProfile({
        userId,
        fullName: form.full_name,
        phoneNumber: form.phone_number,
        gender: form.gender,
        dateOfBirth: form.date_of_birth,
        address: fullAddress,
        avatarUrl: avatarUrl || undefined,
      });

      if (!profileResult.success) {
        setSubmitError("Cập nhật hồ sơ thất bại: " + profileResult.message);
        return;
      }

      // 5. Lưu định danh CCCD
      const identityResult = await requestCreateIdentity({
        userId,
        identityId: form.id_number,
        issueDate: form.issue_date,
        issuePlace: form.issue_place,
        frontUrl: frontUrl || undefined,
        backUrl: backUrl || undefined,
      });

      if (!identityResult.success) {
        setSubmitError("Lỗi lưu thông tin CCCD: " + identityResult.message);
        return;
      }

      setToastMessage("Tạo tài khoản Điều phối viên thành công!");
      setSuccessRedirecting(true);
      setTimeout(() => {
        setForm(COORDINATOR_FORM_INITIAL);
        setToastMessage(null);
        setSuccessRedirecting(false);
        router.push("/coordinators");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err.message || "Đã có lỗi không xác định xảy ra.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingLimit) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 text-center shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
        <p className="text-xs text-on-surface-variant/80 font-medium">
          Đang kiểm tra thông tin gói dịch vụ...
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {limitError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-error bg-error/10 text-error">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold mb-1">Đã đạt giới hạn</h3>
            <p className="text-sm opacity-90">{limitError}</p>
          </div>
        </div>
      )}

      <fieldset disabled={!!limitError} className="space-y-5">
      {/* ── 1. Thông tin cơ bản ── */}
      <SectionCard icon={<User className="w-4 h-4" />} title="Thông tin cơ bản">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          {/* Avatar upload */}
          <div className="shrink-0">
            <ImageUploadBox
              shape="circle"
              label="Ảnh đại diện"
              preview={form.avatarPreview}
              error={errors.avatarFile}
              onFileChange={(f) => handleImageFile("avatarFile", "avatarPreview", f)}
            />
          </div>

          {/* Basic fields */}
          <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FieldLabel htmlFor="full_name" required>Họ và tên</FieldLabel>
              <TextInput id="full_name" name="full_name" value={form.full_name}
                onChange={handleChange} placeholder="Nhập họ và tên" error={errors.full_name} />
            </div>
            <div>
              <FieldLabel htmlFor="date_of_birth" required>Ngày sinh</FieldLabel>
              <TextInput id="date_of_birth" name="date_of_birth" type="date"
                value={form.date_of_birth} onChange={handleChange} error={errors.date_of_birth} />
            </div>
            <div>
              <FieldLabel htmlFor="gender" required>Giới tính</FieldLabel>
              <SelectInput
                id="gender" name="gender" value={form.gender} onChange={handleChange}
                placeholder="Chọn giới tính"
                options={[
                  { label: "Nam", value: "Nam" },
                  { label: "Nữ", value: "Nữ" },
                ]}
                error={errors.gender}
              />
            </div>
          </div>
        </div>
      </SectionCard>

      {/* ── 2. Thông tin liên hệ ── */}
      <SectionCard icon={<Phone className="w-4 h-4" />} title="Thông tin liên hệ">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="phone_number" required>Số điện thoại</FieldLabel>
            <TextInput id="phone_number" name="phone_number" type="tel"
              value={form.phone_number} onChange={handleChange}
              placeholder="0912 345 678" error={errors.phone_number} />
          </div>
          <div>
            <FieldLabel htmlFor="email" required>Email</FieldLabel>
            <TextInput id="email" name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="example@domain.com" error={errors.email} />
          </div>
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="street" required>Địa chỉ chi tiết (số nhà, đường)</FieldLabel>
            <TextInput id="street" name="street" value={form.street} onChange={handleChange}
              placeholder="VD: 123 Nguyễn Trãi" error={errors.street} />
          </div>
          <div>
            <FieldLabel htmlFor="city_id" required>Tỉnh / Thành phố</FieldLabel>
            <SelectInput
              id="city_id" name="city_id" value={form.city_id} onChange={handleChange}
              placeholder="Chọn Tỉnh/Thành phố"
              options={cities.map((c) => ({ label: c.city_name, value: c.city_id }))}
              error={errors.city_id}
            />
          </div>
          <div>
            <FieldLabel htmlFor="ward_id" required>Phường / Xã</FieldLabel>
            <SelectInput
              id="ward_id" name="ward_id" value={form.ward_id} onChange={handleChange}
              placeholder={
                wardsLoading
                  ? "Đang tải..."
                  : form.city_id === ""
                  ? "Chọn Tỉnh/TP trước"
                  : "Chọn Phường/Xã"
              }
              options={wards.map((w) => ({ label: w.ward_name, value: w.ward_id }))}
              disabled={form.city_id === "" || wardsLoading}
              error={errors.ward_id}
            />
          </div>
        </div>
      </SectionCard>

      {/* ── 3. Thông tin định danh ── */}
      <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Thông tin định danh">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FieldLabel htmlFor="id_number" required>Số CCCD / CMND (9 hoặc 12 số)</FieldLabel>
            <TextInput id="id_number" name="id_number" value={form.id_number}
              onChange={handleChange} placeholder="Nhập số giấy tờ" error={errors.id_number} />
          </div>
          <div>
            <FieldLabel htmlFor="issue_date" required>Ngày cấp</FieldLabel>
            <TextInput id="issue_date" name="issue_date" type="date"
              value={form.issue_date} onChange={handleChange} error={errors.issue_date} />
          </div>
          <div>
            <FieldLabel htmlFor="issue_place" required>Nơi cấp</FieldLabel>
            <TextInput id="issue_place" name="issue_place" value={form.issue_place}
              onChange={handleChange}
              placeholder="Cục CS QLHC về TTXH" error={errors.issue_place} />
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Ảnh CCCD ── */}
      <SectionCard icon={<CreditCard className="w-4 h-4" />} title="Ảnh CCCD">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel htmlFor="cccdFront" required>Mặt trước CCCD</FieldLabel>
            <ImageUploadBox
              label="Nhấn để chọn ảnh mặt trước"
              preview={form.cccdFrontPreview}
              error={errors.cccdFrontFile}
              onFileChange={(f) => handleImageFile("cccdFrontFile", "cccdFrontPreview", f)}
            />
          </div>
          <div>
            <FieldLabel htmlFor="cccdBack" required>Mặt sau CCCD</FieldLabel>
            <ImageUploadBox
              label="Nhấn để chọn ảnh mặt sau"
              preview={form.cccdBackPreview}
              error={errors.cccdBackFile}
              onFileChange={(f) => handleImageFile("cccdBackFile", "cccdBackPreview", f)}
            />
          </div>
        </div>
      </SectionCard>

      {/* Submit-level error hiện ở dưới cùng */}
      {submitError && (
        <div className="flex items-start gap-2 p-3 rounded-lg border border-error bg-error/5 text-sm text-error mt-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}
      </fieldset>

      {/* ── Action buttons ── */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={() => {
            setForm(COORDINATOR_FORM_INITIAL);
            setErrors({});
            setSubmitError("");
            router.back();
          }}
          disabled={successRedirecting}
          className="h-[36px] px-4 border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container text-body-sm font-body-sm transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <X className="w-[15px] h-[15px]" />
          Hủy bỏ
        </button>
        <button
          type="submit"
          disabled={submitting || !!limitError || successRedirecting}
          className="h-[36px] px-4 rounded bg-secondary hover:bg-primary text-on-secondary text-body-sm font-bold transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 duration-100"
        >
          <Save className="w-[15px] h-[15px]" />
          {submitting ? "Đang tạo..." : successRedirecting ? "Thành công!" : "Tạo tài khoản mới"}
        </button>
      </div>

      {/* Toast notification component */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3.5 rounded-xl shadow-2xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold leading-normal">
            {toastMessage}
          </span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white ml-2 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </form>
  );
}
