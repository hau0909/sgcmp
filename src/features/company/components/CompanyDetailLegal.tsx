"use client";

import React from "react";
import { Building2, ShieldCheck, FileCheck, Shield } from "lucide-react";

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
  return (
    <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-xs">
      <h2 className="text-headline-sm font-semibold text-on-surface mb-4 uppercase tracking-wider text-[12px] border-b border-outline-variant pb-2">
        Pháp lý &amp; Giấy phép
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="border border-outline-variant rounded-lg p-4 bg-surface-bright flex flex-col h-full shadow-2xs">
          <div className="flex justify-between items-start mb-3">
            <Building2 className="text-outline w-[24px] h-[24px]" />
            <ShieldCheck className="text-secondary w-[20px] h-[20px]" />
          </div>
          <h3 className="text-body-sm font-semibold text-on-surface mb-1">
            Đăng ký kinh doanh
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
            GP Dịch vụ bảo vệ
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
            Bảo hiểm trách nhiệm
          </h3>
          <p className="text-[11px] font-mono text-outline-variant mt-auto">
            Mức: {insuranceLevel}
          </p>
        </div>
      </div>
    </section>
  );
}
