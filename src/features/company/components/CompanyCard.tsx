"use client";

import React from "react";
import Link from "next/link";
import { MapPin, Star, StarHalf } from "lucide-react";
import { MarketplaceCompany } from "../types";

interface CompanyCardProps {
  company: MarketplaceCompany;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  const isNew = company.rating === null;

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded p-4 flex flex-col gap-3 hover:border-primary/40 hover:shadow-md hover:scale-[1.01] transition-all duration-200 group">
      {/* Header Info */}
      <div className="flex gap-3">
        {/* Logo or Initials */}
        <div className="w-14 h-14 rounded bg-surface-container-high border border-outline-variant flex-shrink-0 overflow-hidden flex items-center justify-center select-none">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={`${company.name} logo`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <span className="text-base font-bold text-on-surface-variant tracking-wider uppercase">
              {company.initials}
            </span>
          )}
        </div>

        {/* Company Title and Rating */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-1">
            <h3 className="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors" title={company.name}>
              {company.name}
            </h3>

            {/* Rating Badge */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {isNew ? (
                <div className="flex items-center gap-0.5 text-on-surface-variant">
                  <StarHalf className="w-3.5 h-3.5 text-outline" />
                  <span className="text-xs font-semibold">Mới</span>
                </div>
              ) : (
                <div className="flex items-center gap-0.5 text-tertiary-container">
                  <Star className="w-3.5 h-3.5 fill-tertiary-container text-tertiary-container" />
                  <span className="text-xs font-bold text-on-tertiary-container">
                    {company.rating?.toFixed(1)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <p className="text-xs text-on-surface-variant truncate flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-outline" />
            {company.location}
          </p>
        </div>
      </div>

      {/* Services/Tags Badges */}
      <div className="flex flex-wrap gap-1 mt-1">
        {company.tags.map((tag, idx) => (
          <span
            key={idx}
            className="bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2 py-0.5 rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Footer / Price & Details button */}
      <div className="flex justify-between items-end mt-auto pt-3 border-t border-outline-variant/50">
        <div>
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
            Bắt đầu từ
          </p>
          <p className="text-sm font-extrabold text-on-surface mt-0.5">
            {company.pricePerHour === 0 ? (
              "Liên hệ"
            ) : company.pricePerHour > 1000 ? (
              <>
                {company.pricePerHour.toLocaleString("vi-VN")} <span className="text-xs font-normal text-on-surface-variant">đ/giờ</span>
              </>
            ) : (
              <>
                ${company.pricePerHour} <span className="text-xs font-normal text-on-surface-variant">/ giờ</span>
              </>
            )}
          </p>
        </div>

        <Link
          href={`/companies/${company.id}`}
          className="h-8 px-4 border border-outline-variant rounded bg-surface-container-lowest text-primary text-xs font-bold hover:bg-primary/5 hover:border-primary/30 transition-all duration-150 cursor-pointer shadow-sm active:scale-[0.98] inline-flex items-center justify-center"
        >
          Xem hồ sơ
        </Link>
      </div>
    </div>
  );
}