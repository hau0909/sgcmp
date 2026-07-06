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
    <Link
      href={`/companies/${company.id}`}
      className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 flex flex-col gap-2.5 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
    >
      {/* Company name + Rating */}
      <div className="flex justify-between items-start gap-1">
        <h3
          className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-snug flex-1"
          title={company.name}
        >
          {company.name}
        </h3>
        <div className="flex items-center gap-0.5 flex-shrink-0 mt-0.5">
          {isNew ? (
            <span className="text-[10px] font-semibold text-outline bg-surface-container px-1.5 py-0.5 rounded">
              Mới
            </span>
          ) : (
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span className="text-[11px] font-bold">{company.rating?.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Location */}
      <p className="text-[11px] text-on-surface-variant flex items-center gap-1 font-medium">
        <MapPin className="w-3 h-3 text-primary shrink-0" />
        <span className="truncate">{company.location}</span>
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-1">
        {company.tags.slice(0, 3).map((tag, idx) => (
          <span
            key={idx}
            className="bg-primary/8 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full"
          >
            {tag}
          </span>
        ))}
        {company.tags.length > 3 && (
          <span className="bg-surface-container text-on-surface-variant text-[10px] font-semibold px-2 py-0.5 rounded-full">
            +{company.tags.length - 3}
          </span>
        )}
      </div>

      {/* Footer / Price & Details button */}
      <div className="flex justify-between items-center mt-auto pt-2.5 border-t border-outline-variant/40">
        <div>
          <p className="text-[9px] font-bold text-outline uppercase tracking-wider">Giá dịch vụ</p>
          <p className="text-xs font-extrabold text-primary mt-0.5">
            {company.pricePerHour === 0 ? (
              <span className="text-on-surface-variant font-semibold">Liên hệ</span>
            ) : company.serviceCount && company.serviceCount > 1 && company.maxPrice && company.maxPrice > company.pricePerHour ? (
              <>
                {company.pricePerHour.toLocaleString("vi-VN")} -{" "}
                {company.maxPrice.toLocaleString("vi-VN")}{" "}
                <span className="text-[9px] font-normal text-on-surface-variant">/vnđ</span>
              </>
            ) : (
              <>
                {company.pricePerHour.toLocaleString("vi-VN")}{" "}
                <span className="text-[9px] font-normal text-on-surface-variant">/vnđ</span>
              </>
            )}
          </p>
        </div>
        <span className="h-7 px-3 bg-primary/8 text-primary text-[11px] font-bold rounded-lg group-hover:bg-primary group-hover:text-white transition-all duration-150 flex items-center justify-center">
          Xem hồ sơ
        </span>
      </div>
    </Link>
  );
}
