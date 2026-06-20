"use client";

import React from "react";
import { ShieldCheck, Mail, Calendar } from "lucide-react";

interface CompanyDetailHeaderProps {
  name: string;
  logoUrl?: string;
  bannerUrl?: string;
}

export default function CompanyDetailHeader({
  name,
  logoUrl,
  bannerUrl,
}: CompanyDetailHeaderProps) {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
      {/* cover banner - subtle, premium gradient with overlay */}
      <div className="relative h-48 sm:h-72 w-full bg-linear-to-r from-primary via-primary/90 to-secondary/80 overflow-hidden">
        {bannerUrl ? (
          <img
            alt={`${name} Banner`}
            className="w-full h-full object-cover animate-fade-in"
            src={bannerUrl}
          />
        ) : (
          <>
            {/* Abstract pattern lines overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent" />
          </>
        )}
      </div>

      {/* profile row */}
      <div className="px-5 pb-5 relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 z-10">
        <div className="flex flex-row items-end gap-3.5 min-w-0 flex-1">
          {logoUrl ? (
            <img
              alt={`${name} Logo`}
              className="-mt-10 sm:-mt-12 w-18 h-18 sm:w-22 sm:h-22 rounded-xl border-4 border-surface-container-lowest object-cover shadow-sm bg-surface-bright shrink-0"
              src={logoUrl}
            />
          ) : (
            <div className="-mt-10 sm:-mt-12 w-18 h-18 sm:w-22 sm:h-22 rounded-xl border-4 border-surface-container-lowest bg-primary text-on-primary flex items-center justify-center font-bold text-lg sm:text-2xl shadow-sm shrink-0 uppercase">
              {name.replace(/^(Công ty|TNHH|Cổ phần|Dịch vụ|Bảo vệ)\s+/gi, "").substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="pb-1 min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-[18px] sm:text-[24px] font-bold text-on-surface tracking-tight leading-tight break-words">
                {name}
              </h1>
              <span className="bg-surface-dim text-primary border border-primary/20 px-2 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider flex items-center gap-0.5 shrink-0">
                <ShieldCheck className="w-3 h-3" /> Đã xác minh
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto mt-3 sm:mt-0 shrink-0">
          <button
            className="flex-1 sm:flex-none px-2.5 py-1.5 sm:px-3.5 sm:py-2 border border-primary text-primary font-semibold rounded-lg hover:bg-surface-container transition-colors text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Mail className="w-4 h-4" /> Liên hệ
          </button>
          <button
            className="flex-1 sm:flex-none px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-primary text-on-primary font-semibold rounded-lg hover:bg-primary/90 transition-colors shadow-xs text-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
          >
            <Calendar className="w-4 h-4" /> Đặt dịch vụ
          </button>
        </div>
      </div>
    </div>
  );
}
