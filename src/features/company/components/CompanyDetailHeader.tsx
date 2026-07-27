"use client";

import React from "react";
import { ShieldCheck, Shield } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CompanyDetailHeaderProps {
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
  companyId: string;
  address?: string;
  createdYear?: number;
  onOpenBookingModal?: () => void;
}

export default function CompanyDetailHeader({
  name,
  logoUrl,
  bannerUrl,
  companyId,
  address,
  createdYear,
  onOpenBookingModal,
}: CompanyDetailHeaderProps) {
  const { dict } = useTranslation();

  const t = dict.customer?.company_detail || {};

  const cityOrRegion = address
    ? address.split(",").slice(-2).join(",").trim()
    : (t.nationwide || "Toàn quốc");

  const operatingYearText = createdYear
    ? `${t.operating_since || "Hoạt động trên nền tảng từ"} ${createdYear}`
    : (t.operating_platform || "Hoạt động trên nền tảng");

  return (
    <div className="w-full relative rounded-2xl overflow-hidden shadow-xs">
      {/* Editorial Dark Navy Hero Banner */}
      <div className="relative h-64 sm:h-72 w-full bg-gradient-to-r from-primary via-primary-container to-secondary overflow-hidden">
        {bannerUrl ? (
          <img
            alt={`${name} Banner`}
            className="w-full h-full object-cover animate-fade-in opacity-80"
            src={bannerUrl}
          />
        ) : (
          <div className="absolute inset-0 bg-grid-pattern opacity-15" />
        )}

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/20" />

        {/* Top Header Eyebrow Row */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
          <div className="text-white/75 text-[11px] font-semibold tracking-widest uppercase">
            {t.eyebrow_header || "Hồ sơ đơn vị cung cấp dịch vụ bảo vệ"}
          </div>
          <div className="flex items-center gap-1.5 text-amber-300 text-xs font-medium">
            <span>✓</span>
            <span>{t.verified || "Đã xác minh"}</span>
          </div>
        </div>

        {/* Bottom Hero Logo & Info Row */}
        <div className="absolute left-6 right-6 bottom-6 flex flex-col sm:flex-row sm:items-end gap-5 z-10">
          {/* Logo Ring */}
          <div className="relative shrink-0">
            {logoUrl ? (
              <img
                alt={`${name} Logo`}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-amber-400/90 object-cover shadow-md bg-surface-container-lowest"
                src={logoUrl}
              />
            ) : (
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-full border-3 border-amber-400/90 bg-primary text-on-primary flex items-center justify-center font-bold shadow-md shrink-0">
                <Shield className="w-9 h-9 text-amber-300 stroke-[1.8]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3.5xl font-bold text-white tracking-tight leading-tight">
              {name}
            </h1>
            <p className="text-white/80 text-xs sm:text-sm mt-1.5 font-normal">
              {t.pro_security || "Dịch vụ an ninh chuyên nghiệp"} · {operatingYearText} · {cityOrRegion}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


