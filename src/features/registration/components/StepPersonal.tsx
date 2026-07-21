"use client";

import React from "react";
import { User, Phone, Mail, CreditCard, Calendar, MapPin } from "lucide-react";
import UploadZone from "./UploadZone";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface StepPersonalProps {
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
  };
  updateFormData: (data: Partial<StepPersonalProps["formData"]>) => void;
  errors: Record<string, string>;
  clearError: (field: string) => void;
}

export default function StepPersonal({
  formData,
  updateFormData,
  errors,
  clearError,
}: StepPersonalProps) {
  const inputClass = (hasError?: boolean) =>
    `h-11 w-full rounded-lg border px-10 text-sm outline-none transition placeholder:text-slate-400 focus:ring-1 ${
      hasError
        ? "border-error focus:border-error focus:ring-error"
        : "border-outline-variant focus:border-primary focus:ring-primary"
    }`;

  const handleFieldChange = (field: keyof StepPersonalProps["formData"], value: any) => {
    updateFormData({ [field]: value });
    clearError(field);
  };

  const { dict } = useTranslation();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="border-b border-outline-variant/30 pb-4">
        <h3 className="text-lg font-bold text-on-surface">{dict.pages.registration.step_personal_title}</h3>
        <p className="text-xs text-on-surface-variant">
          {dict.pages.registration.step_personal_desc}
        </p>
      </div>

      {/* Grid for basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.full_name} <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder={dict.pages.registration.full_name_placeholder}
              value={formData.fullName}
              onChange={(e) => handleFieldChange("fullName", e.target.value)}
              className={inputClass(!!errors.fullName)}
            />
          </div>
          {errors.fullName && (
            <p className="text-xs font-semibold text-error">{errors.fullName}</p>
          )}
        </div>

        {/* Phone Number */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.phone} <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="tel"
              placeholder={dict.pages.registration.phone_placeholder}
              value={formData.phoneNumber}
              onChange={(e) => handleFieldChange("phoneNumber", e.target.value)}
              className={inputClass(!!errors.phoneNumber)}
            />
          </div>
          {errors.phoneNumber && (
            <p className="text-xs font-semibold text-error">{errors.phoneNumber}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.email_system}
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-5 h-5 text-on-surface-variant/50" />
            <input
              type="email"
              value={formData.email}
              disabled
              className="h-11 w-full rounded-lg border border-outline-variant bg-surface-container-low px-10 text-sm text-on-surface-variant outline-none"
            />
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium mt-1">{dict.pages.registration.email_system_hint}</p>
        </div>

        {/* Avatar Upload */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.avatar}
          </label>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant flex items-center justify-center bg-surface-container shrink-0">
              {formData.avatarFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={URL.createObjectURL(formData.avatarFile)}
                  alt="Avatar preview"
                  className="w-full h-full object-cover"
                />
              ) : formData.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={formData.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-6 h-6 text-on-surface-variant/70" />
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              id="avatar-input"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFieldChange("avatarFile", e.target.files[0]);
                }
              }}
            />
            <label
              htmlFor="avatar-input"
              className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low cursor-pointer transition-colors"
            >
              {dict.pages.registration.select_image}
            </label>
            {(formData.avatarFile || formData.avatarUrl) && (
              <button
                type="button"
                onClick={() => {
                  updateFormData({ avatarFile: null, avatarUrl: "" });
                }}
                className="text-xs text-error font-semibold hover:underline"
              >
                {dict.pages.registration.delete}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="border-b border-outline-variant/30 pb-4 pt-2">
        <h3 className="text-lg font-bold text-on-surface">{dict.pages.registration.step_identity_title}</h3>
        <p className="text-xs text-on-surface-variant">
          {dict.pages.registration.step_identity_desc}
        </p>
      </div>

      {/* Identity Form */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CCCD Number */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.identity_no} <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <CreditCard className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder={dict.pages.registration.identity_no_placeholder}
              value={formData.identityId}
              onChange={(e) => handleFieldChange("identityId", e.target.value)}
              className={inputClass(!!errors.identityId)}
            />
          </div>
          {errors.identityId && (
            <p className="text-xs font-semibold text-error">{errors.identityId}</p>
          )}
        </div>

        {/* Issue Date */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.issue_date} <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <Calendar className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="date"
              value={formData.issueDate}
              onChange={(e) => handleFieldChange("issueDate", e.target.value)}
              className={inputClass(!!errors.issueDate)}
            />
          </div>
          {errors.issueDate && (
            <p className="text-xs font-semibold text-error">{errors.issueDate}</p>
          )}
        </div>

        {/* Issue Place */}
        <div className="space-y-1">
          <label className="block text-sm font-semibold text-on-surface">
            {dict.pages.registration.issue_place} <span className="text-error">*</span>
          </label>
          <div className="relative flex items-center">
            <MapPin className="absolute left-3 w-5 h-5 text-on-surface-variant/70" />
            <input
              type="text"
              placeholder={dict.pages.registration.issue_place_placeholder}
              value={formData.issuePlace}
              onChange={(e) => handleFieldChange("issuePlace", e.target.value)}
              className={inputClass(!!errors.issuePlace)}
            />
          </div>
          {errors.issuePlace && (
            <p className="text-xs font-semibold text-error">{errors.issuePlace}</p>
          )}
        </div>
      </div>

      {/* Upload Zone CCCD Photos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div className="space-y-1">
          <UploadZone
            label={dict.pages.registration.front_id}
            accept="image/*"
            placeholder={dict.pages.registration.front_id_placeholder}
            defaultValue={formData.frontFile || formData.frontUrl}
            onChange={(file) => handleFieldChange("frontFile", file)}
          />
          {errors.frontFile && (
            <p className="text-xs font-semibold text-error">{errors.frontFile}</p>
          )}
        </div>

        <div className="space-y-1">
          <UploadZone
            label={dict.pages.registration.back_id}
            accept="image/*"
            placeholder={dict.pages.registration.back_id_placeholder}
            defaultValue={formData.backFile || formData.backUrl}
            onChange={(file) => handleFieldChange("backFile", file)}
          />
          {errors.backFile && (
            <p className="text-xs font-semibold text-error">{errors.backFile}</p>
          )}
        </div>
      </div>
    </div>
  );
}
