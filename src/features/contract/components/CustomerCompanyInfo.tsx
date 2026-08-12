"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin, ShieldCheck, AlertTriangle } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CustomerCompanyInfoProps {
  companyName: string;
  signedCompanyName?: string | null;
  isNameChanged?: boolean;
  phone?: string;
  email?: string;
  address?: string;
}

function InfoRow({
  label,
  value,
  icon,
  colSpan2 = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  colSpan2?: boolean;
}) {
  return (
    <div className={`flex flex-col ${colSpan2 ? "md:col-span-2" : ""}`}>
      <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
        {label}
      </span>
      <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
        <span className="mt-0.5 shrink-0 text-outline-variant">{icon}</span>
        <span>{value}</span>
      </span>
    </div>
  );
}

export function CustomerCompanyInfo({
  companyName,
  signedCompanyName,
  isNameChanged,
  phone,
  email,
  address,
}: CustomerCompanyInfoProps) {
  const { dict } = useTranslation();
  const notUpdated = dict.contract.detail.not_updated;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <ShieldCheck className="w-5 h-5 text-secondary" />
        <span>{dict.contract.detail.company_info_title}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
        {isNameChanged ? (
          <div className="flex flex-col col-span-1 md:col-span-2 bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Thay đổi tên doanh nghiệp bảo vệ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-amber-200/50">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-amber-700/90 uppercase tracking-wider">
                  Tên công ty hiện tại
                </span>
                <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  {companyName}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-amber-700/90 uppercase tracking-wider">
                  Tên công ty lúc ký hợp đồng
                </span>
                <span className="text-sm font-bold text-amber-950 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  {signedCompanyName || companyName}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <InfoRow
            label={dict.contract.detail.company_name}
            value={companyName}
            icon={<Building2 className="w-3.5 h-3.5" />}
          />
        )}
        <InfoRow
          label={dict.contract.detail.phone}
          value={phone || notUpdated}
          icon={<Phone className="w-3.5 h-3.5" />}
        />
        <InfoRow
          label={dict.contract.detail.email}
          value={email || notUpdated}
          icon={<Mail className="w-3.5 h-3.5" />}
        />
        <InfoRow
          label={dict.contract.detail.address}
          value={address || notUpdated}
          icon={<MapPin className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  );
}

