"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin, ShieldCheck, User, FileBadge } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { ContractParties } from "@/types/ContractParties";

interface CustomerCompanyInfoProps {
  companyName?: string;
  phone?: string;
  email?: string;
  address?: string;
  contractParties?: ContractParties | null;
}

export function CustomerCompanyInfo({
  companyName,
  phone,
  email,
  address,
  contractParties,
}: CustomerCompanyInfoProps) {
  const { dict } = useTranslation();
  const notUpdated = dict.contract?.detail?.not_updated || "Chưa cập nhật";

  const pName = contractParties?.company_name || companyName || notUpdated;
  const pRep = contractParties?.representative_name || dict.contract?.detail?.default_rep || "Đại diện pháp luật";
  const pTax = contractParties?.business_license_no || notUpdated;
  const pPhone = contractParties?.company_phone || phone || notUpdated;
  const pEmail = contractParties?.company_email || email || notUpdated;
  const pAddr = contractParties?.company_address || address || notUpdated;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <ShieldCheck className="w-5 h-5 text-secondary" />
        <span>{dict.contract?.detail?.company_info_title || "Đơn vị cung cấp dịch vụ"}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract?.detail?.company_name_label || "Tên doanh nghiệp"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-outline-variant" />
            {pName}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract?.detail?.representative_label || "Người đại diện pháp luật"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-outline-variant" />
            {pRep}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract?.detail?.tax_label || "Mã số thuế / Giấy phép kinh doanh"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <FileBadge className="w-3.5 h-3.5 text-outline-variant" />
            {pTax}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract?.detail?.phone || "Số điện thoại"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-outline-variant" />
            {pPhone}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract?.detail?.company_address_label || "Địa chỉ trụ sở công ty"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-outline-variant mt-0.5 shrink-0" />
            <span>{pAddr}</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract?.detail?.email || "Email liên hệ"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-outline-variant" />
            {pEmail}
          </span>
        </div>
      </div>
    </div>
  );
}
