"use client";

import React from "react";
import { X, GitCompareArrows } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCompareStore } from "@/store/compare.store";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { MarketplaceCompany } from "../types";

interface CompareFloatingBarProps {
  companies: MarketplaceCompany[];
}

export default function CompareFloatingBar({ companies }: CompareFloatingBarProps) {
  const router = useRouter();
  const { selectedIds, clearAll } = useCompareStore();
  const { dict } = useTranslation();
  const t = dict.customer?.compare || ({} as any);

  if (selectedIds.length === 0) return null;

  // Get initials from selected companies
  const selectedCompanies = selectedIds
    .map((id) => companies.find((c) => c.id === id))
    .filter(Boolean) as MarketplaceCompany[];

  const handleCompareNow = () => {
    if (selectedIds.length < 2) return;
    router.push(`/companies/compare?ids=${selectedIds.join(",")}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-surface-container-lowest border border-outline-variant/60 rounded-2xl px-5 py-3 shadow-xl">
        {/* Avatars Stack */}
        <div className="flex items-center -space-x-2">
          {selectedCompanies.slice(0, 3).map((company, idx) => (
            <div
              key={company.id}
              className="w-9 h-9 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold shadow-sm overflow-hidden bg-surface-container-high shrink-0"
              style={{
                zIndex: 10 - idx,
              }}
              title={company.name}
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span
                  className="w-full h-full flex items-center justify-center text-white font-bold"
                  style={{
                    background: `hsl(${(idx * 90 + 200) % 360}, 45%, 40%)`,
                  }}
                >
                  {company.initials}
                </span>
              )}
            </div>
          ))}
          {selectedCompanies.length > 3 && (
            <div
              className="w-9 h-9 rounded-full border-2 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-[10px] font-bold text-on-surface-variant shadow-sm shrink-0"
              style={{ zIndex: 7 }}
            >
              +{selectedCompanies.length - 3}
            </div>
          )}
        </div>

        {/* Text */}
        <p className="text-sm font-semibold text-on-surface whitespace-nowrap">
          {(t.floating_selecting || "Đang chọn {count}/4 công ty").replace(
            "{count}",
            String(selectedIds.length)
          )}
        </p>

        {/* Deselect button */}
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-outline-variant text-on-surface-variant bg-surface-container-low hover:bg-surface-container hover:border-error hover:text-error transition-all cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
          <span>{t.floating_deselect || "Bỏ chọn"}</span>
        </button>

        {/* Compare Now button */}
        <button
          onClick={handleCompareNow}
          disabled={selectedIds.length < 2}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedIds.length < 2
              ? "bg-surface-container-high text-on-surface-variant/50 cursor-not-allowed"
              : "bg-primary text-on-primary hover:bg-primary/90 shadow-md active:scale-[0.97]"
          }`}
        >
          <GitCompareArrows className="w-3.5 h-3.5" />
          <span>{t.floating_compare_now || "So sánh ngay"}</span>
        </button>
      </div>
    </div>
  );
}
