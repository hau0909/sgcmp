"use client";

import React from "react";
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  UserCheck,
  User,
  ShieldCheck,
  FileBadge,
} from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { ContractParties } from "@/types/ContractParties";

interface ContractPartnerInfoProps {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  deploymentAddress?: string;
  companyName?: string | null;
  companyScope?: string | null;
  companyPosition?: string | null;
  contractParties?: ContractParties | null;
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
  contractParties,
}: ContractPartnerInfoProps) {
  const { dict } = useTranslation();

  const notUpdated = dict.contract_detail?.not_updated || "Chưa cập nhật";

  const cName = contractParties?.customer_name || customerName;
  const cShop =
    contractParties?.customer_company_name || companyName || notUpdated;
  const cPhone = contractParties?.customer_phone || phone;
  const cEmail = contractParties?.customer_email || email;
  const cAddr = contractParties?.customer_address || address;
  const cPos =
    contractParties?.customer_position || companyPosition || notUpdated;
  const cScope =
    contractParties?.customer_company_scope || companyScope || notUpdated;

  const pName = contractParties?.company_name || notUpdated;
  const pRep = contractParties?.representative_name || dict.contract_detail?.default_rep || "Đại diện pháp luật";
  const pTax = contractParties?.business_license_no || notUpdated;
  const pPhone = contractParties?.company_phone || notUpdated;
  const pEmail = contractParties?.company_email || notUpdated;
  const pAddr = contractParties?.company_address || notUpdated;

  return (
    <div className="space-y-6">
      {/* Khối Thông tin Doanh nghiệp Bảo vệ (Bên B) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

        <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <span>{dict.contract_detail?.provider_title || "Đơn vị cung cấp dịch vụ"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.company_name_label || "Tên doanh nghiệp"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-outline-variant" />
              {pName}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.representative_label || "Người đại diện pháp luật"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-outline-variant" />
              {pRep}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.tax_label || "Mã số thuế / Giấy phép kinh doanh"}
            </span>
            <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
              <FileBadge className="w-3.5 h-3.5 text-outline-variant" />
              {pTax}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.phone_label || "Số điện thoại"}
            </span>
            <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-outline-variant" />
              {pPhone}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.company_address_label || "Địa chỉ trụ sở công ty"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-outline-variant mt-0.5 shrink-0" />
              <span>{pAddr}</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.email_label || "Email liên hệ"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-outline-variant" />
              {pEmail}
            </span>
          </div>
        </div>
      </div>

      {/* Khối Thông tin Khách hàng (Bên A) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-bl-full pointer-events-none"></div>

        <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
          <Building2 className="w-5 h-5 text-secondary" />
          <span>
            {dict.contract_detail?.info_customer ||
              "Bên A: Thông tin khách hàng (Đơn vị thuê)"}
          </span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tên khách hàng */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.info_customer_name ||
                "Tên khách hàng / Người đại diện"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-outline-variant" />
              {cName}
            </span>
          </div>

          {/* Địa điểm làm (Shop ABC) */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.customer_org_label || "Công ty / Cơ sở / Cửa hàng"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-outline-variant" />
              {cShop}
            </span>
          </div>

          {/* Chức danh / Vị trí */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.customer_position_label || "Chức danh / Vị trí"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-outline-variant" />
              {cPos}
            </span>
          </div>

          {/* Lĩnh vực hoạt động */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.customer_scope_label || "Lĩnh vực hoạt động"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-outline-variant" />
              {cScope}
            </span>
          </div>

          {/* Số điện thoại */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.info_customer_phone || "Số điện thoại"}
            </span>
            <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-outline-variant" />
              {cPhone}
            </span>
          </div>

          {/* Email */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.info_customer_email || "Email"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-outline-variant" />
              {cEmail}
            </span>
          </div>

          {/* Địa chỉ khách hàng */}
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.contact_address_label || "Địa chỉ liên hệ"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-outline-variant mt-0.5 shrink-0" />
              <span>{cAddr}</span>
            </span>
          </div>

          {/* Địa chỉ triển khai */}
        </div>
      </div>
    </div>
  );
}
