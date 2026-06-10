"use client";

import React from "react";
import { CreditCard, DollarSign } from "lucide-react";

interface ContractPaymentInfoProps {
  totalValue: string;
  paymentMethod: string;
}

export function ContractPaymentInfo({
  totalValue,
  paymentMethod,
}: ContractPaymentInfoProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm flex-1 bg-gradient-to-br from-surface-container-lowest to-surface-bright/40">
      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <CreditCard className="w-5 h-5 text-secondary" />
        <span>Thông tin giá trị</span>
      </h3>

      <div className="space-y-6">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Tổng giá trị
          </span>
          <span className="text-2xl font-black text-primary font-mono tracking-tight flex items-center gap-0.5">
            <DollarSign className="w-6 h-6 self-center text-primary/80" />
            {totalValue}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Phương thức thanh toán
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-outline-variant" />
            {paymentMethod}
          </span>
        </div>
      </div>
    </div>
  );
}
