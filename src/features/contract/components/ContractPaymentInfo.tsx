"use client";

import React from "react";
import { CreditCard, Tag, Clock } from "lucide-react";
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

  const quotationTypeLabel =
    quotationType === "hourly"
      ? "Theo Giờ"
      : quotationType === "monthly"
      ? "Theo Tháng"
      : quotationType === "package"
      ? "Trọn Gói"
      : null;

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex-1 bg-gradient-to-br from-surface-container-lowest to-surface-bright/40">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <CreditCard className="w-5 h-5 text-secondary" />
        <span>{dict.contract_detail?.info_value || "Thông tin giá trị"}</span>
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.total_value || "TỔNG GIÁ TRỊ"}
          </span>
          <span className="text-2xl font-black text-primary font-mono tracking-tight flex items-center gap-0.5">
            {totalValue}
          </span>
        </div>

        {unitPriceDetail && (
          <div className="flex flex-col pt-2 border-t border-outline-variant/30">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              ĐƠN GIÁ ÁP DỤNG
            </span>
            <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 font-mono">
              <Tag className="w-3.5 h-3.5 text-secondary" />
              {unitPriceDetail}
            </span>
          </div>
        )}

        {quotationTypeLabel && (
          <div className="text-[11px] font-semibold text-on-surface-variant/80 bg-surface-container-low/60 border border-outline-variant/40 rounded-lg p-2 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              Báo giá {quotationTypeLabel} {unitPriceDetail ? `(${unitPriceDetail})` : ""}
              {totalHours ? ` • Tổng số giờ: ${totalHours}h` : ""}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
