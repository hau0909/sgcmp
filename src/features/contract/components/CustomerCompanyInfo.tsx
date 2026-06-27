"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin, ShieldCheck } from "lucide-react";

interface CustomerCompanyInfoProps {
  companyName: string;
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
  phone = "Chưa cập nhật",
  email = "Chưa cập nhật",
  address = "Chưa cập nhật",
}: CustomerCompanyInfoProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none" />

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <ShieldCheck className="w-5 h-5 text-secondary" />
        <span>Thông tin công ty cung cấp dịch vụ</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 mt-2">
        <InfoRow
          label="Tên công ty"
          value={companyName}
          icon={<Building2 className="w-3.5 h-3.5" />}
        />
        <InfoRow
          label="Số điện thoại"
          value={phone}
          icon={<Phone className="w-3.5 h-3.5" />}
        />
        <InfoRow
          label="Email"
          value={email}
          icon={<Mail className="w-3.5 h-3.5" />}
        />
        <InfoRow
          label="Địa chỉ"
          value={address}
          icon={<MapPin className="w-3.5 h-3.5" />}
        />
      </div>
    </div>
  );
}
