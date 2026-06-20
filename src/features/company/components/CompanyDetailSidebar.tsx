"use client";

import React from "react";
import { MapPin, Phone, Mail, Shield } from "lucide-react";

interface CompanyDetailSidebarProps {
  location: string;
  phone: string;
  email: string;
}

export default function CompanyDetailSidebar({
  location,
  phone,
  email,
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
        </ul>
      </div>
    </div>
  );
}
