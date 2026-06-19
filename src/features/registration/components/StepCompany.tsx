"use client";

import React, { useEffect, useState } from "react";
import { Building, Hash, MapPin, Mail, Phone, FileText, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { requestGetCities, requestGetWards } from "@/features/address";
import { City, Ward } from "@/features/address/types";
import UploadZone from "./UploadZone";

interface StepCompanyProps {
  formData: {
    companyName: string;
    businessLicenseNo: string;
    cityId: number | "";
    wardId: number | "";
    street: string;
    companyEmail: string;
    companyPhone: string;
    description: string;
    logoFile: File | null;
    logoUrl: string;
    licenseFile: File | null;
    licenseUrl: string;
    galleryFiles: File[];
  };
  updateFormData: (data: Partial<StepCompanyProps["formData"]>) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
}

export default function StepCompany({
  formData,
  updateFormData,
  errors,
  clearError,
}: StepCompanyProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Load cities on mount
  useEffect(() => {
    async function loadCities() {
      try {
        setLoadingCities(true);
        const res = await requestGetCities();
        if (res?.success && res.cities) {
          setCities(res.cities);
        }
      } catch (err) {
        console.error("Failed to load cities:", err);
      } finally {
        setLoadingCities(false);
      }
    }
    loadCities();
  }, []);

  // Load wards when cityId changes
  useEffect(() => {
    if (formData.cityId === "") {
      setWards([]);
      return;
    }

    async function loadWards() {
      try {
        setLoadingWards(true);
        const res = await requestGetWards(Number(formData.cityId));
        if (res?.success && res.wards) {
          setWards(res.wards);
        }
      } catch (err) {
        console.error("Failed to load wards:", err);
      } finally {
        setLoadingWards(false);
      }
    }
    loadWards();
  }, [formData.cityId]);

  const inputClass = (hasError?: boolean) =>
    `h-11 w-full rounded-lg border px-10 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 ${
      hasError
        ? "border-error focus:border-error focus:ring-error"
        : "border-outline-variant focus:border-primary focus:ring-primary"
    }`;

  const selectClass = (hasError?: boolean) =>
    `h-11 w-full rounded-lg border px-3 text-sm outline-none transition focus:ring-1 appearance-none bg-white ${
      hasError
        ? "border-error focus:border-error focus:ring-error"
        : "border-outline-variant focus:border-primary focus:ring-primary"
    }`;

  const handleFieldChange = (field: keyof StepCompanyProps["formData"], value: any) => {
    updateFormData({ [field]: value });
    clearError(field);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? "" : Number(e.target.value);
    updateFormData({
      cityId: value,
      wardId: "", // reset ward
    });
    clearError("cityId");
    clearError("wardId");
  };

  const handleGalleryAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const updatedGallery = [...formData.galleryFiles, ...newFiles];
      handleFieldChange("galleryFiles", updatedGallery);
    }
  };

  const handleGalleryRemove = (indexToRemove: number) => {
    const updatedGallery = formData.galleryFiles.filter((_, idx) => idx !== indexToRemove);
    handleFieldChange("galleryFiles", updatedGallery);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-outline-variant/30 pb-4">
        <h3 className="text-lg font-bold text-on-surface">1. Thông tin doanh nghiệp</h3>
        <p className="text-xs text-on-surface-variant">
          Nhập các thông tin cơ bản và thông tin liên hệ của doanh nghiệp cần đăng ký.
        </p>
      </div>

      {/* Grid for company info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Company Name */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            Tên Doanh nghiệp <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <Building className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder="VD: CÔNG TY TNHH BẢO VỆ SGC"
              value={formData.companyName}
              onChange={(e) => handleFieldChange("companyName", e.target.value.toUpperCase())}
              className={inputClass(!!errors.companyName)}
            />
          </div>
          {errors.companyName && (
            <p className="text-xs font-semibold text-error">{errors.companyName}</p>
          )}
        </div>

        {/* MST / Business License No */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            Mã số doanh nghiệp / Mã số thuế <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <Hash className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder="Nhập mã số thuế / mã doanh nghiệp"
              value={formData.businessLicenseNo}
              onChange={(e) => handleFieldChange("businessLicenseNo", e.target.value)}
              className={inputClass(!!errors.businessLicenseNo)}
            />
          </div>
          {errors.businessLicenseNo && (
            <p className="text-xs font-semibold text-error">{errors.businessLicenseNo}</p>
          )}
        </div>

        {/* Company Email */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            Email liên hệ <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="email"
              placeholder="contact@company.com"
              value={formData.companyEmail}
              onChange={(e) => handleFieldChange("companyEmail", e.target.value)}
              className={inputClass(!!errors.companyEmail)}
            />
          </div>
          {errors.companyEmail && (
            <p className="text-xs font-semibold text-error">{errors.companyEmail}</p>
          )}
        </div>

        {/* Company Phone */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            Số điện thoại doanh nghiệp <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="tel"
              placeholder="Nhập số điện thoại văn phòng"
              value={formData.companyPhone}
              onChange={(e) => handleFieldChange("companyPhone", e.target.value)}
              className={inputClass(!!errors.companyPhone)}
            />
          </div>
          {errors.companyPhone && (
            <p className="text-xs font-semibold text-error">{errors.companyPhone}</p>
          )}
        </div>
      </div>

      <div className="border-b border-outline-variant/30 pb-4 pt-2">
        <h3 className="text-lg font-bold text-on-surface">2. Địa chỉ trụ sở chính</h3>
        <p className="text-xs text-on-surface-variant">
          Chọn Thành phố, Phường/Xã và nhập địa chỉ chi tiết trụ sở chính của công ty.
        </p>
      </div>

      {/* Hierarchical address fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* City Select */}
        <div className="space-y-1 relative">
          <label className="block text-sm font-semibold text-on-surface">
            Tỉnh / Thành phố <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <select
              value={formData.cityId}
              onChange={handleCityChange}
              disabled={loadingCities}
              className={selectClass(!!errors.cityId)}
            >
              <option value="">-- Chọn Tỉnh / Thành phố --</option>
              {cities.map((city) => (
                <option key={city.city_id} value={city.city_id}>
                  {city.city_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 flex items-center text-on-surface-variant">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          {errors.cityId && (
            <p className="text-xs font-semibold text-error">{errors.cityId}</p>
          )}
        </div>

        {/* Ward Select */}
        <div className="space-y-1 relative">
          <label className="block text-sm font-semibold text-on-surface">
            Quận / Huyện / Phường / Xã <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <select
              value={formData.wardId}
              onChange={(e) => handleFieldChange("wardId", e.target.value === "" ? "" : Number(e.target.value))}
              disabled={loadingWards || formData.cityId === ""}
              className={selectClass(!!errors.wardId)}
            >
              <option value="">-- Chọn Phường / Xã --</option>
              {wards.map((ward) => (
                <option key={ward.ward_id} value={ward.ward_id}>
                  {ward.ward_name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 flex items-center text-on-surface-variant">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          {errors.wardId && (
            <p className="text-xs font-semibold text-error">{errors.wardId}</p>
          )}
        </div>

        {/* Detailed Address (Street) */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            Số nhà, Tên đường <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="VD: 123 Đường Láng"
              value={formData.street}
              onChange={(e) => handleFieldChange("street", e.target.value)}
              className="h-11 w-full rounded-lg border border-outline-variant px-4 text-sm outline-none transition focus:border-primary focus:ring-primary"
            />
          </div>
          {errors.street && (
            <p className="text-xs font-semibold text-error">{errors.street}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="block text-sm font-semibold text-on-surface">
          Mô tả về doanh nghiệp (Không bắt buộc)
        </label>
        <textarea
          rows={3}
          placeholder="Giới thiệu sơ lược về dịch vụ, quy mô nhân sự, thế mạnh của doanh nghiệp bảo vệ..."
          value={formData.description}
          onChange={(e) => handleFieldChange("description", e.target.value)}
          className="w-full rounded-lg border border-outline-variant p-4 text-sm outline-none transition focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="border-b border-outline-variant/30 pb-4 pt-2">
        <h3 className="text-lg font-bold text-on-surface">3. Giấy phép & Hình ảnh đính kèm</h3>
        <p className="text-xs text-on-surface-variant">
          Upload logo công ty, bản quét giấy phép đăng ký kinh doanh và một số hình ảnh thực tế.
        </p>
      </div>

      {/* Logo & License Uploads */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <UploadZone
            label="Logo doanh nghiệp *"
            accept="image/*"
            placeholder="Kéo thả Logo vào đây hoặc nhấp chọn"
            defaultValue={formData.logoFile || formData.logoUrl}
            onChange={(file) => handleFieldChange("logoFile", file)}
          />
          {errors.logoFile && (
            <p className="text-xs font-semibold text-error">{errors.logoFile}</p>
          )}
        </div>

        <div className="space-y-1">
          <UploadZone
            label="Giấy phép đăng ký kinh doanh (Bản scan PDF/Ảnh) *"
            accept="image/*,application/pdf"
            placeholder="Kéo thả Giấy phép (PDF/Ảnh) vào đây hoặc nhấp chọn"
            defaultValue={formData.licenseFile || formData.licenseUrl}
            onChange={(file) => handleFieldChange("licenseFile", file)}
          />
          {errors.licenseFile && (
            <p className="text-xs font-semibold text-error">{errors.licenseFile}</p>
          )}
        </div>
      </div>

      {/* Company Images Gallery Upload */}
      <div className="space-y-2 pt-2">
        <label className="block text-sm font-semibold text-on-surface">
          Hình ảnh thực tế hoạt động của công ty (Nhiều ảnh)
        </label>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          {formData.galleryFiles.map((file, idx) => (
            <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-outline-variant/60 group bg-surface-container">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Company preview ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleGalleryRemove(idx)}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-error text-white flex items-center justify-center shadow-md opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity hover:bg-error/95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-[10px] text-white py-1 text-center font-bold">
                {idx === 0 ? "BÌA (Banner)" : "Hình ảnh"}
              </div>
            </div>
          ))}

          {/* Add image box */}
          <label className="relative aspect-square rounded-xl border-2 border-dashed border-outline-variant hover:border-primary/50 hover:bg-surface-container-low flex flex-col items-center justify-center gap-2 cursor-pointer transition-all">
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleGalleryAdd}
            />
            <Plus className="w-6 h-6 text-on-surface-variant" />
            <span className="text-[11px] font-semibold text-on-surface-variant">Thêm ảnh</span>
          </label>
        </div>
        <p className="text-[11px] text-on-surface-variant/80">
          * Ảnh đầu tiên được tải lên sẽ tự động làm ảnh bìa chính (Banner) trên trang chi tiết công ty.
        </p>
      </div>
    </div>
  );
}
