"use client";

import React from "react";
import { CreditCard } from "lucide-react";

interface CustomerPaymentInfoProps {
  totalValue: string;
}

export function CustomerPaymentInfo({
  totalValue,
}: CustomerPaymentInfoProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex-1 bg-gradient-to-br from-surface-container-lowest to-surface-bright/40">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <CreditCard className="w-5 h-5 text-secondary" />
        <span>Giá trị hợp đồng</span>
      </h3>

      <div className="space-y-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Tổng giá trị
          </span>
          <span className="text-2xl font-black text-primary font-mono tracking-tight">
            {totalValue}
          </span>
        </div>
      </div>
    </div>
  );
}
