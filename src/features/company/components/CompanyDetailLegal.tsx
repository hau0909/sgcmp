"use client";

import React from "react";
import { Building2, ShieldCheck, FileCheck, Shield } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CompanyDetailLegalProps {
  businessLicenseNo: string;
  securityLicenseNo: string;
  insuranceLevel: string;
}

export default function CompanyDetailLegal({
  businessLicenseNo,
  securityLicenseNo,
  insuranceLevel,
}: CompanyDetailLegalProps) {
  const { dict } = useTranslation();
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
      <h2 className="text-headline-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[12px] border-b border-outline-variant pb-2">
        {dict.customer.company_detail.legal_title}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col h-full shadow-2xs">
          <div className="flex justify-between items-start mb-3">
            <Building2 className="text-outline w-[24px] h-[24px]" />
            <ShieldCheck className="text-secondary w-[20px] h-[20px]" />
          </div>
          <h3 className="text-body-sm font-semibold text-on-surface mb-1">
            {dict.customer.company_detail.business_license}
          </h3>
          <p className="text-[11px] font-mono text-outline-variant mt-auto">
            ID: {businessLicenseNo}
          </p>
        </div>
        {/* Card 2 */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col h-full shadow-2xs">
          <div className="flex justify-between items-start mb-3">
            <FileCheck className="text-outline w-[24px] h-[24px]" />
            <ShieldCheck className="text-secondary w-[20px] h-[20px]" />
          </div>
          <h3 className="text-body-sm font-semibold text-on-surface mb-1">
            {dict.customer.company_detail.security_license}
          </h3>
          <p className="text-[11px] font-mono text-outline-variant mt-auto">
            ID: {securityLicenseNo}
          </p>
        </div>
        {/* Card 3 */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col h-full shadow-2xs">
          <div className="flex justify-between items-start mb-3">
            <Shield className="text-outline w-[24px] h-[24px]" />
            <ShieldCheck className="text-secondary w-[20px] h-[20px]" />
          </div>
          <h3 className="text-body-sm font-semibold text-on-surface mb-1">
            {dict.customer.company_detail.insurance}
          </h3>
          <p className="text-[11px] font-mono text-outline-variant mt-auto">
            {dict.customer.company_detail.level}: {insuranceLevel}
          </p>
        </div>
      </div>
    </section>
  );
}
