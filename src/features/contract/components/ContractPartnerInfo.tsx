"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface ContractPartnerInfoProps {
  customerName: string;
  phone: string;
  email: string;
  address: string;
}

export function ContractPartnerInfo({
  customerName,
  phone,
  email,
  address,
}: ContractPartnerInfoProps) {
  const { dict } = useTranslation();
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Building2 className="w-5 h-5 text-secondary" />
        <span>{dict.contract_detail?.info_customer || "Thông tin đối tác"}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_name || "Tên khách hàng"}
          </span>
          <span className="text-sm font-semibold text-on-surface">
            {customerName}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_phone || "Số điện thoại"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-outline-variant" />
            {phone}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_email || "Email"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-outline-variant" />
            {email}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_address || "Địa chỉ"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-outline-variant mt-0.5" />
            <span>{address}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
