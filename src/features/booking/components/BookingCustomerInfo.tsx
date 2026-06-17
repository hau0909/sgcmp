"use client";

import React from "react";
import { Building2, Phone, Mail, MapPin, User } from "lucide-react";

interface BookingCustomerInfoProps {
  customerName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
}

export function BookingCustomerInfo({
  customerName,
  contactPerson,
  phone,
  email,
  address,
}: BookingCustomerInfoProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] duration-300 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Building2 className="w-5 h-5 text-secondary" />
        <span>Thông tin khách hàng</span>
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer / Company Name */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Tên khách hàng / Công ty
          </span>
          <span className="text-sm font-semibold text-on-surface">
            {customerName}
          </span>
        </div>

        {/* Contact Representative */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Người liên hệ
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-outline-variant" />
            {contactPerson}
          </span>
        </div>

        {/* Telephone Number */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Số điện thoại
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-outline-variant" />
            {phone}
          </span>
        </div>

        {/* Email */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Email
          </span>
          <a
            href={`mailto:${email}`}
            className="text-sm font-semibold text-secondary flex items-center gap-1.5 hover:underline cursor-pointer"
          >
            <Mail className="w-3.5 h-3.5 text-outline-variant" />
            {email}
          </a>
        </div>

        {/* Implementation Location */}
        <div className="flex flex-col md:col-span-2">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Địa chỉ triển khai
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
