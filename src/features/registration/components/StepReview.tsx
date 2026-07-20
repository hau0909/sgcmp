"use client";

import React, { useEffect, useState } from "react";
import { User, ShieldCheck, Mail, Phone, CreditCard, Calendar, MapPin, Building, Hash, FileText } from "lucide-react";
import { requestGetCities, requestGetWards } from "@/features/address";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface StepReviewProps {
  formData: {
    fullName: string;
    phoneNumber: string;
    email: string;
    avatarFile: File | null;
    avatarUrl: string;
    identityId: string;
    issueDate: string;
    issuePlace: string;
    frontFile: File | null;
    frontUrl: string;
    backFile: File | null;
    backUrl: string;
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
  consentChecked: boolean;
  setConsentChecked: (checked: boolean) => void;
  errors: Record<string, string>;
}

export default function StepReview({
  formData,
  consentChecked,
  setConsentChecked,
  errors,
}: StepReviewProps) {
  const { dict } = useTranslation();
  const [resolvedAddress, setResolvedAddress] = useState(dict.pages.registration.loading_address);

  useEffect(() => {
    async function resolveAddress() {
      if (formData.cityId === "" || formData.wardId === "") {
        setResolvedAddress(dict.pages.registration.incomplete_address);
        return;
      }

      try {
        const [citiesRes, wardsRes] = await Promise.all([
          requestGetCities(),
          requestGetWards(Number(formData.cityId)),
        ]);

        const cityName =
          citiesRes?.cities?.find((c: any) => c.city_id === formData.cityId)?.city_name || "";
        const wardName =
          wardsRes?.wards?.find((w: any) => w.ward_id === formData.wardId)?.ward_name || "";

        const parts: string[] = [];
        if (formData.street?.trim()) parts.push(formData.street.trim());
        if (wardName) parts.push(wardName);
        if (cityName) parts.push(cityName);

        setResolvedAddress(parts.join(", ") || dict.pages.registration.unknown_address);
      } catch (err) {
        console.error("Resolve address error:", err);
        setResolvedAddress(formData.street || dict.pages.registration.unknown_address);
      }
    }

    resolveAddress();
  }, [formData]);

  const renderFilePreview = (file: File | null, url: string) => {
    if (file) {
      if (file.type.startsWith("image/")) {
        return (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={URL.createObjectURL(file)}
            alt="Preview"
            className="w-full h-24 object-cover rounded-lg border border-outline-variant"
          />
        );
      } else {
        return (
          <div className="w-full h-24 rounded-lg border border-outline-variant/60 flex flex-col items-center justify-center bg-surface-container gap-1 p-2 text-center text-xs">
            <FileText className="w-7 h-7 text-primary" />
            <span className="font-semibold text-on-surface truncate w-full">{file.name}</span>
          </div>
        );
      }
    } else if (url) {
      if (url.toLowerCase().endsWith(".pdf")) {
        return (
          <div className="w-full h-24 rounded-lg border border-outline-variant/60 flex flex-col items-center justify-center bg-surface-container gap-1 p-2 text-center text-xs">
            <FileText className="w-7 h-7 text-primary" />
            <span className="font-semibold text-on-surface truncate w-full">{dict.pages.registration.pdf_doc}</span>
          </div>
        );
      }
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Preview"
          className="w-full h-24 object-cover rounded-lg border border-outline-variant"
        />
      );
    }
    return (
      <div className="w-full h-24 rounded-lg border border-dashed border-outline-variant flex items-center justify-center text-xs text-on-surface-variant bg-surface-container-low">
        {dict.pages.registration.not_attached}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-outline-variant/30 pb-4">
        <h3 className="text-lg font-bold text-on-surface">{dict.pages.registration.step_review_title}</h3>
        <p className="text-xs text-on-surface-variant">
          {dict.pages.registration.step_review_desc}
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Detailed Info Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Representative */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{dict.pages.registration.rep_info}</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-xs text-on-surface-variant block">Họ và tên:</span>
                <span className="font-semibold text-on-surface">{formData.fullName || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Số điện thoại:</span>
                <span className="font-semibold text-on-surface">{formData.phoneNumber || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Email tài khoản:</span>
                <span className="font-semibold text-on-surface">{formData.email || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Mã định danh CCCD:</span>
                <span className="font-mono font-semibold text-on-surface">{formData.identityId || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Ngày cấp:</span>
                <span className="font-semibold text-on-surface">{formData.issueDate || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Nơi cấp:</span>
                <span className="font-semibold text-on-surface">{formData.issuePlace || "-"}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Company Info */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
              <Building className="w-4 h-4" />
              <span>{dict.pages.registration.comp_info}</span>
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="sm:col-span-2">
                <span className="text-xs text-on-surface-variant block">Tên công ty:</span>
                <span className="font-bold text-on-surface text-base">{formData.companyName || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Mã số thuế / MST:</span>
                <span className="font-mono font-semibold text-on-surface">{formData.businessLicenseNo || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Điện thoại công ty:</span>
                <span className="font-semibold text-on-surface">{formData.companyPhone || "-"}</span>
              </div>
              <div>
                <span className="text-xs text-on-surface-variant block">Email công ty:</span>
                <span className="font-semibold text-on-surface">{formData.companyEmail || "-"}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-on-surface-variant block">Địa chỉ trụ sở:</span>
                <span className="font-semibold text-on-surface flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  {resolvedAddress}
                </span>
              </div>
              {formData.description && (
                <div className="sm:col-span-2">
                  <span className="text-xs text-on-surface-variant block">Mô tả hoạt động:</span>
                  <p className="text-xs text-on-surface mt-1 whitespace-pre-line leading-relaxed bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                    {formData.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - File Previews & Submission Action */}
        <div className="space-y-6">
          {/* Card 3: Files Preview */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs space-y-4">
            <h4 className="font-bold text-sm text-primary uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>{dict.pages.registration.attached_docs}</span>
            </h4>
            
            <div className="space-y-4">
              {/* CCCD Documents */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-on-surface block">Hình ảnh CCCD</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block mb-1">Mặt trước:</span>
                    {renderFilePreview(formData.frontFile, formData.frontUrl)}
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block mb-1">Mặt sau:</span>
                    {renderFilePreview(formData.backFile, formData.backUrl)}
                  </div>
                </div>
              </div>

              {/* Logo & License Documents */}
              <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                <span className="text-xs font-semibold text-on-surface block">Logo & Giấy phép</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-on-surface-variant block mb-1">Logo công ty:</span>
                    {renderFilePreview(formData.logoFile, formData.logoUrl)}
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant block mb-1">Giấy chứng nhận ĐKKD:</span>
                    {renderFilePreview(formData.licenseFile, formData.licenseUrl)}
                  </div>
                </div>
              </div>

              {/* Gallery Preview */}
              {formData.galleryFiles.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-outline-variant/20">
                  <span className="text-xs font-semibold text-on-surface block">
                    Hình ảnh công ty ({formData.galleryFiles.length} ảnh)
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {formData.galleryFiles.slice(0, 3).map((file, idx) => (
                      <div key={idx} className="relative h-16 rounded-md overflow-hidden border border-outline-variant">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={URL.createObjectURL(file)}
                          alt="Gallery preview"
                          className="w-full h-full object-cover"
                        />
                        {idx === 2 && formData.galleryFiles.length > 3 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xs">
                            +{formData.galleryFiles.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Consent checkbox */}
      <div className="pt-4 border-t border-outline-variant/30 space-y-2">
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            className="mt-1 w-4.5 h-4.5 rounded border-outline-variant text-primary focus:ring-primary focus:ring-1 cursor-pointer"
          />
          <span className="text-xs md:text-sm text-on-surface font-semibold leading-relaxed">
            {dict.pages.registration.consent}
          </span>
        </label>
        {errors.consent && (
          <p className="text-xs font-semibold text-error pl-7">{errors.consent}</p>
        )}
      </div>
    </div>
  );
}
