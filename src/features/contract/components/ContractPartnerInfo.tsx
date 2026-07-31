"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin, Briefcase, UserCheck, User } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface ContractPartnerInfoProps {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deploymentAddress?: string;
  companyName?: string | null;
  companyScope?: string | null;
  companyPosition?: string | null;
}

export function ContractPartnerInfo({
  customerName,
  phone,
  email,
  address,
  deploymentAddress,
  companyName,
  companyScope,
  companyPosition,
}: ContractPartnerInfoProps) {
  const { dict } = useTranslation();

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Building2 className="w-5 h-5 text-secondary" />
        <span>{dict.contract_detail?.info_customer || "Thông tin khách hàng"}</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tên khách hàng */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_name || "Tên khách hàng / Công ty"}
          </span>
          <span className="text-sm font-semibold text-on-surface">
            {customerName}
          </span>
        </div>

        {/* Người liên hệ */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Người liên hệ
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-outline-variant" />
            {customerName}
          </span>
        </div>

        {/* Chức danh / Vị trí */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Chức danh / Vị trí
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-outline-variant" />
            {companyPosition || "Chưa cập nhật"}
          </span>
        </div>

        {/* Tên công ty / Cơ sở */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Tên công ty / Cơ sở
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-outline-variant" />
            {companyName || "Chưa cập nhật"}
          </span>
        </div>

        {/* Số điện thoại */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_phone || "Số điện thoại"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-outline-variant" />
            {phone}
          </span>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_customer_email || "Email"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-outline-variant" />
            {email}
          </span>
        </div>

        {/* Lĩnh vực hoạt động */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Lĩnh vực hoạt động
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-outline-variant" />
            {companyScope || "Chưa cập nhật"}
          </span>
        </div>

        {/* Địa chỉ triển khai */}
        <div className="flex flex-col md:col-span-2">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Địa chỉ triển khai
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-outline-variant mt-0.5" />
            <span>{deploymentAddress || address}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
