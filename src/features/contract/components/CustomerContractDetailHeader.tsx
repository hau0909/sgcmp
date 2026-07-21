"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, CheckCircle2, PenLine, Star, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { exportContractDocx } from "../utils/exportDocx";
import { useTranslation } from "@/components/providers/LanguageProvider";

type ContractStatus = "pending_signatures" | "active" | "completed" | "cancelled";

interface CustomerContractDetailHeaderProps {
  contractCode: string;
  status: ContractStatus;
  customerAgreed: boolean;
  companyAgreed: boolean;
  contractFileUrl?: string | null;
  hasGuards: boolean;
  onSignCustomer?: () => void;
  onReviewCustomer?: () => void;
  hasReviewed?: boolean;
  canComplete?: boolean;
  onCompleteContract?: () => void;
  contract?: any;
}


const SignatureChip = ({
  label,
  agreed,
  dict,
}: {
  label: string;
  agreed: boolean;
  dict: any;
}) => (
  <div
    className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs transition-colors duration-200 ${
      agreed
        ? "bg-emerald-50 border-emerald-300"
        : "bg-amber-50 border-amber-300"
    }`}
  >
    <span className="text-on-surface-variant font-medium">{label}:</span>
    <span
      className={`font-bold flex items-center gap-1 ${
        agreed ? "text-emerald-600" : "text-amber-600"
      }`}
    >
      {agreed ? (
        <>
          <CheckCircle2 className="w-3.5 h-3.5" />
          {dict.contract.detail.signed}
        </>
      ) : (
        <>
          <Clock className="w-3.5 h-3.5" />
          {dict.contract.detail.pending_sign}
        </>
      )}
    </span>
  </div>
);

export function CustomerContractDetailHeader({
  contractCode,
  status,
  customerAgreed,
  companyAgreed,
  contractFileUrl,
  hasGuards,
  onSignCustomer,
  onReviewCustomer,
  hasReviewed = false,
  canComplete = false,
  onCompleteContract,
  contract,
}: CustomerContractDetailHeaderProps) {
  const { dict } = useTranslation();

  const STATUS_MAP: Record<ContractStatus, { label: string; className: string }> = {
    pending_signatures: {
      label: dict.contract.filters.status_pending_signatures,
      className: "bg-amber-50 text-amber-700 border-amber-300",
    },
    active: {
      label: dict.contract.filters.status_active,
      className: "bg-blue-50 text-blue-700 border-blue-300",
    },
    completed: {
      label: dict.contract.filters.status_completed,
      className: "bg-emerald-50 text-emerald-700 border-emerald-300",
    },
    cancelled: {
      label: dict.contract.filters.status_cancelled,
      className: "bg-slate-100 text-slate-600 border-slate-300",
    },
  };

  const statusInfo = STATUS_MAP[status] ?? {
    label: "Unknown",
    className: "bg-muted text-muted-foreground",
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-outline-variant/60">
      {/* Left: back + title */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link
          href="/my-contracts"
          className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{dict.contract.detail.back_btn}</span>
        </Link>
        <h2 className="text-xl md:text-2xl font-bold text-on-background flex flex-wrap items-center gap-2 font-headline">
          {dict.contract.detail.title}{" "}
          <span className="font-mono text-primary">#{contractCode}</span>
        </h2>
      </div>

      {/* Right: chips + cta */}
      <div className="flex flex-wrap items-center gap-3">
        <SignatureChip label={dict.contract.detail.you} agreed={customerAgreed} dict={dict} />
        <SignatureChip label={dict.contract.detail.company} agreed={companyAgreed} dict={dict} />

        {/* Tải file Word */}
        {contract && (
          <Button
            onClick={() => exportContractDocx(contract)}
            variant="outline"
            className="font-bold border-primary text-primary hover:bg-primary/5 px-4 py-2 rounded-lg text-sm transition-all duration-100 flex items-center gap-1.5 cursor-pointer shadow-sm active:scale-95"
          >
            <FileText className="w-4 h-4" />
            <span>{dict.contract.detail.download_docx}</span>
          </Button>
        )}

        {status !== "pending_signatures" && (
          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.className}`}
          >
            {statusInfo.label}
          </Badge>
        )}

        {/* Customer sign CTA */}
        {status === "pending_signatures" && !customerAgreed && (
          <div className="relative group/tip flex items-center">
            <Button
              onClick={onSignCustomer}
              disabled={!contractFileUrl || !hasGuards}
              className={`font-bold shadow-md px-4 py-2 rounded-lg text-sm transition-all duration-100 flex items-center gap-1.5 ${
                (!contractFileUrl || !hasGuards)
                  ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed hover:bg-slate-200"
                  : "cursor-pointer bg-primary hover:bg-primary/90 text-on-primary active:scale-95"
              }`}
            >
              <PenLine className="w-4 h-4" />
              {dict.contract.detail.sign_btn}
            </Button>
            {(!contractFileUrl || !hasGuards) && (
              <div className="absolute top-full mt-2 right-0 pointer-events-none opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                {!contractFileUrl && !hasGuards
                  ? "Công ty chưa tải lên tệp hợp đồng PDF và chưa phân công bảo vệ"
                  : !contractFileUrl
                  ? "Công ty chưa tải lên tệp hợp đồng PDF"
                  : "Công ty chưa phân công bảo vệ cho hợp đồng này"}
                <div className="absolute bottom-full right-10 border-4 border-transparent border-b-slate-900" />
              </div>
            )}
          </div>
        )}

        {/* Customer Review CTA */}
        {status === "completed" && (
          <Button
            onClick={onReviewCustomer}
            className={`cursor-pointer font-bold shadow-md px-4 py-2 rounded-lg text-sm transition-all duration-100 flex items-center gap-1.5 active:scale-95 ${
              hasReviewed
                ? "bg-transparent border border-primary text-primary hover:bg-primary/10"
                : "bg-primary hover:bg-primary/90 text-on-primary border border-primary/20"
            }`}
          >
            <Star className={`w-4 h-4 ${hasReviewed ? '' : 'fill-on-primary'}`} />
            {hasReviewed ? "Xem đánh giá" : dict.contract.detail.review_btn}
          </Button>
        )}

        {/* Customer Complete Contract CTA */}
        {status === "active" && canComplete && (
          <Button
            onClick={onCompleteContract}
            className="cursor-pointer font-bold shadow-md px-4 py-2 rounded-lg text-sm transition-all duration-100 flex items-center gap-1.5 active:scale-95 bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-600 hover:border-emerald-700"
          >
            <CheckCircle2 className="w-4 h-4" />
            {dict.contract.detail.complete_btn}
          </Button>
        )}
      </div>
    </div>
  );
}
