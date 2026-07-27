"use client";

import React from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CompanyDetailLegalInfoProps {
  companyName: string;
  businessLicenseNo?: string;
  address: string;
  phone: string;
  email: string;
  logoUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  ownerAvatarUrl?: string;
}

function getOperatingScope(address: string): string {
  if (!address) return "Toàn quốc và các khu vực lân cận";

  const parts = address.split(",").map((p) => p.trim());
  if (parts.length < 2) {
    return `${address} và các khu vực lân cận`;
  }

  const cityOrProvince = parts[parts.length - 1];
  const districtOrWard = parts[parts.length - 2];

  if (cityOrProvince && districtOrWard) {
    return `${cityOrProvince}, ${districtOrWard} và các khu vực lân cận`;
  } else if (cityOrProvince) {
    return `${cityOrProvince} và các khu vực lân cận`;
  }

  return `${address} và các khu vực lân cận`;
}

export default function CompanyDetailLegalInfo({
  companyName,
  businessLicenseNo,
  address,
  phone,
  email,
  logoUrl,
  ownerName,
  ownerPhone,
  ownerEmail,
  ownerAvatarUrl,
}: CompanyDetailLegalInfoProps) {
  const { dict } = useTranslation();
  const t = dict.customer?.company_detail || {};

  const getRepInitials = (name?: string) => {
    if (!name) return "NV";
    return name
      .split(" ")
      .slice(-2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const displayRepPhone = ownerPhone || phone;
  const displayRepEmail = ownerEmail || email;
  const displayAvatarUrl = ownerAvatarUrl || logoUrl;
  const operatingScope = getOperatingScope(address);

  return (
    <section className="py-8 border-b border-outline-variant/60">
      <div className="text-[11px] font-bold tracking-widest text-primary uppercase mb-1">
        {t.legal_eyebrow || "Hồ sơ pháp lý"}
      </div>
      <h2 className="text-2xl font-bold text-on-surface mb-4">
        {t.basic_info_title || "Thông tin cơ bản"}
      </h2>

      {/* Editorial Credential Rows */}
      <div className="divide-y divide-outline-variant/40">
        <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
          <span className="text-on-surface-variant shrink-0 sm:w-48">
            {t.company_name || "Tên doanh nghiệp"}
          </span>
          <span className="font-semibold text-on-surface sm:text-right">{companyName}</span>
        </div>

        {businessLicenseNo && (
          <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
            <span className="text-on-surface-variant shrink-0 sm:w-48">
              {t.tax_code || "Mã số thuế"}
            </span>
            <span className="font-mono font-semibold text-on-surface sm:text-right">{businessLicenseNo}</span>
          </div>
        )}

        <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 text-sm">
          <span className="text-on-surface-variant shrink-0 sm:w-48">
            {t.headquarters || "Trụ sở chính"}
          </span>
          <span className="font-medium text-on-surface sm:text-right">{address}</span>
        </div>

        {/* Company direct contact line */}
        <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
          <span className="text-on-surface-variant shrink-0 sm:w-48">
            {t.company_contact || "Liên hệ công ty"}
          </span>
          <span className="font-mono text-on-surface sm:text-right">
            {phone} &nbsp;·&nbsp; {email}
          </span>
        </div>

        <div className="py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 text-sm">
          <span className="text-on-surface-variant shrink-0 sm:w-48">
            {t.operating_scope || "Phạm vi hoạt động"}
          </span>
          <span className="font-medium text-on-surface sm:text-right">
            {operatingScope}
          </span>
        </div>
      </div>

      {/* Representative Line */}
      {ownerName && (
        <div className="mt-6 pt-4 border-t border-outline-variant/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Avatar URL or Fallback Initials */}
            {displayAvatarUrl ? (
              <img
                src={displayAvatarUrl}
                alt={ownerName}
                className="w-11 h-11 rounded-full object-cover border border-outline-variant/60 shadow-2xs shrink-0"
              />
            ) : (
              <div className="w-11 h-11 rounded-full bg-primary text-on-primary font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                {getRepInitials(ownerName)}
              </div>
            )}

            <div>
              <div className="text-sm font-bold text-on-surface">{ownerName}</div>
              <div className="text-xs text-on-surface-variant">
                {t.contact_rep || "Người đại diện liên hệ"}
              </div>
              {address && (
                <div className="text-[11.5px] text-on-surface-variant/80 mt-0.5">
                  {address}
                </div>
              )}
            </div>
          </div>

          {/* Representative Specific Contact */}
          {(displayRepPhone || displayRepEmail) && (
            <div className="text-xs text-on-surface-variant sm:text-right font-mono leading-relaxed w-full sm:w-auto border-t sm:border-t-0 border-outline-variant/30 pt-2 sm:pt-0">
              {displayRepPhone && <div>{displayRepPhone}</div>}
              {displayRepEmail && <div>{displayRepEmail}</div>}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
