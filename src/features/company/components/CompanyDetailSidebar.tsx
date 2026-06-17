"use client";

import React from "react";
import { MapPin, Phone, Mail, Globe, Shield } from "lucide-react";

interface CompanyDetailSidebarProps {
  location: string;
  phone: string;
  email: string;
  website: string;
  guardCount: number;
  provinceCount: number;
}

export default function CompanyDetailSidebar({
  location,
  phone,
  email,
  website,
  guardCount,
  provinceCount,
}: CompanyDetailSidebarProps) {
  return (
    <div className="w-full lg:w-1/3 space-y-6">
      {/* Basic Info */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
        <h3 className="text-[12px] font-semibold text-on-surface uppercase tracking-wider mb-4">
          Thông tin cơ bản
        </h3>
        <ul className="space-y-4 text-body-sm">
          <li className="flex items-start gap-3">
            <MapPin className="text-outline mt-0.5 w-[18px] h-[18px] shrink-0" />
            <span className="text-on-surface-variant text-justify">
              {location}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Phone className="text-outline w-[18px] h-[18px] shrink-0" />
            <span className="text-on-surface-variant font-mono">
              {phone}
            </span>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="text-outline w-[18px] h-[18px] shrink-0" />
            <a
              className="text-secondary hover:underline break-all"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Globe className="text-outline w-[18px] h-[18px] shrink-0" />
            <a
              className="text-secondary hover:underline break-all"
              href={`https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {website}
            </a>
          </li>
        </ul>
      </div>

      {/* Operational Stats */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
        <h3 className="text-[12px] font-semibold text-on-surface uppercase tracking-wider mb-4">
          Năng lực hoạt động
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-bright rounded-lg p-3.5 border border-outline-variant text-center shadow-2xs">
            <div className="text-[24px] font-bold text-primary mb-1">
              {guardCount}+
            </div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Nhân sự an ninh
            </div>
          </div>
          <div className="bg-surface-bright rounded-lg p-3.5 border border-outline-variant text-center shadow-2xs">
            <div className="text-[24px] font-bold text-primary mb-1">
              {provinceCount}+
            </div>
            <div className="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">
              Tỉnh thành
            </div>
          </div>
          <div className="bg-surface-bright rounded-lg p-3.5 border border-outline-variant text-center col-span-2 flex items-center justify-center gap-3.5 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Shield className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <div className="text-[20px] font-bold text-primary leading-none">
                100%
              </div>
              <div className="text-[10px] text-on-surface-variant uppercase tracking-wider mt-1 font-semibold">
                Tuân thủ tiêu chuẩn
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
