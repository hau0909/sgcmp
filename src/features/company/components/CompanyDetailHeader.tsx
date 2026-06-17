"use client";

import React from "react";
import { ShieldCheck, Mail, Calendar } from "lucide-react";

interface CompanyDetailHeaderProps {
  name: string;
  logoUrl: string;
}

export default function CompanyDetailHeader({
  name,
  logoUrl,
}: CompanyDetailHeaderProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
      {/* cover banner - subtle, premium gradient with overlay */}
      <div className="relative h-24 sm:h-32 w-full bg-linear-to-r from-primary via-primary/90 to-secondary/80 overflow-hidden">
        {/* Abstract pattern lines overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
      </div>

      {/* profile row */}
      <div className="px-5 pb-5 relative flex flex-col md:flex-row md:items-end md:justify-between gap-4 -mt-8 sm:-mt-10 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3.5">
          <img
            alt={`${name} Logo`}
            className="w-18 h-18 sm:w-22 sm:h-22 rounded-xl border-4 border-surface-container-lowest object-cover shadow-sm bg-surface-bright shrink-0"
            src={logoUrl}
          />
          <div className="pb-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[22px] sm:text-[24px] font-bold text-on-surface tracking-tight leading-none">
                {name}
              </h1>
              <span className="bg-surface-dim text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Đã xác minh
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            className="flex-1 md:flex-none px-3.5 py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-surface-container transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Mail className="w-4 h-4" /> Liên hệ
          </button>
          <button
            className="flex-1 md:flex-none px-3.5 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-xs text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" /> Đặt dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}
