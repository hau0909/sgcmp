"use client";

import React from "react";
import { CreditCard, Tag } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface ContractPaymentInfoProps {
  totalValue: string;
  unitPriceDetail?: string | null;
  quotationType?: string | null;
  totalHours?: number | string | null;
}

export function ContractPaymentInfo({
  totalValue,
  unitPriceDetail = null,
  quotationType = null,
  totalHours = null,
}: ContractPaymentInfoProps) {
  const { dict } = useTranslation();

  const getTagBadge = () => {
    switch (quotationType) {
      case "hourly":
        return {
          label: "Theo Giờ",
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800",
        };
      case "monthly":
        return {
          label: "Theo Tháng",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
      case "package":
        return {
          label: "Theo Gói",
          className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800",
        };
      default:
        return {
          label: "Theo Tháng",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
        };
    }
  };

  const badge = getTagBadge();

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex-1 bg-gradient-to-br from-surface-container-lowest to-surface-bright/40">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center justify-between border-b border-outline-variant/30 pb-2 font-headline">
        <span className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-secondary" />
          <span>{dict.contract_detail?.info_value || "Thông tin giá trị"}</span>
        </span>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${badge.className}`}>
          <Tag className="w-3 h-3" />
          {badge.label}
        </span>
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            GIÁ THUÊ HỢP ĐỒNG
          </span>
          <span className="text-2xl font-black text-primary font-mono tracking-tight flex items-center gap-1">
            {totalValue}
          </span>
        </div>

        {unitPriceDetail && (
          <div className="flex flex-col pt-2 border-t border-outline-variant/30">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              CHI TIẾT ĐƠN GIÁ
            </span>
            <span className="text-sm font-semibold text-on-surface">
              {unitPriceDetail}
            </span>
          </div>
        )}

        {totalHours && quotationType === "hourly" && (
          <div className="flex flex-col pt-2 border-t border-outline-variant/30">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              TỔNG SỐ GIỜ THUÊ
            </span>
            <span className="text-sm font-semibold text-on-surface">
              {totalHours} giờ
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

