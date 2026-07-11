"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Check } from "lucide-react";
import { ContractStatus } from "@/types/Enum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContractDetailHeaderProps {
  contractCode: string;
  status: ContractStatus;
  customerAgreed: boolean;
  companyAgreed: boolean;
  hasContractFile: boolean;
  hasGuards: boolean;
  onSignCompany?: () => void;
}

export function ContractDetailHeader({
  contractCode,
  status,
  customerAgreed,
  companyAgreed,
  hasContractFile,
  hasGuards,
  onSignCompany,
}: ContractDetailHeaderProps) {
  // Map statuses to appropriate styles and labels
  const getStatusDisplay = (status: ContractStatus) => {
    switch (status) {
      case "pending_signatures":
        return {
          label: "Chờ chữ ký",
          className: "bg-amber-50/50 text-amber-700 border-amber-400 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800",
        };
      case "active":
        return {
          label: "Đang hoạt động",
          className: "bg-blue-50/50 text-blue-700 border-blue-400 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-800",
        };
      case "completed":
        return {
          label: "Đã hoàn thành",
          className: "bg-emerald-50/50 text-emerald-700 border-emerald-400 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-800",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          className: "bg-slate-100/50 text-slate-700 border-slate-400 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-800",
        };
      default:
        return {
          label: "Không xác định",
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const statusInfo = getStatusDisplay(status);

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-outline-variant/60">
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Link
          href="/contracts"
          className="flex items-center gap-1.5 text-secondary hover:text-primary transition-colors text-sm font-semibold w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại</span>
        </Link>
        <h2 className="text-xl md:text-2xl font-bold text-on-background flex flex-wrap items-center gap-2 font-headline">
          Chi tiết Hợp đồng{" "}
          <span className="font-mono text-primary font-bold">#{contractCode}</span>
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {/* Customer signature status */}
        <div className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs transition-colors duration-200 ${
          customerAgreed 
            ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900/50" 
            : "bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/50"
        }`}>
          <span className="text-on-surface-variant font-medium">Khách hàng:</span>
          <span className={`font-bold flex items-center gap-1 ${customerAgreed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {customerAgreed ? (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Đã ký
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Chờ ký
              </span>
            )}
          </span>
        </div>

        {/* Company signature status */}
        <div className={`flex items-center gap-1.5 border rounded-lg px-2.5 py-1 text-xs transition-colors duration-200 ${
          companyAgreed 
            ? "bg-emerald-50 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900/50" 
            : "bg-amber-50 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900/50"
        }`}>
          <span className="text-on-surface-variant font-medium">Công ty:</span>
          <span className={`font-bold flex items-center gap-1 ${companyAgreed ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
            {companyAgreed ? (
              <span className="flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Đã ký
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                Chờ ký
              </span>
            )}
          </span>
        </div>

        {status !== "pending_signatures" && (
          <Badge
            variant="outline"
            className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.className}`}
          >
            {statusInfo.label}
          </Badge>
        )}
        
        {status === "pending_signatures" && !companyAgreed && (
          <div className="relative group/tooltip flex items-center">
            <Button
              onClick={onSignCompany}
              disabled={!hasContractFile || !hasGuards}
              className={`font-bold shadow-md px-4 py-2 rounded-lg text-sm transition-all duration-100 flex items-center gap-1.5 ${
                (!hasContractFile || !hasGuards)
                  ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed hover:bg-slate-200"
                  : "cursor-pointer bg-primary hover:bg-primary/90 text-on-primary active:scale-95"
              }`}
            >
              <span>Ký duyệt (Công ty)</span>
            </Button>
            
            {(!hasContractFile || !hasGuards) && (
              <div className="absolute top-full mt-2 right-0 pointer-events-none opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded shadow-lg whitespace-nowrap z-50">
                {!hasContractFile && !hasGuards
                  ? "Vui lòng tải lên tệp hợp đồng PDF và phân công bảo vệ trước khi ký duyệt"
                  : !hasContractFile
                  ? "Vui lòng tải lên tệp hợp đồng PDF trước khi ký duyệt"
                  : "Vui lòng phân công bảo vệ trước khi ký duyệt"}
                <div className="absolute bottom-full right-16 border-4 border-transparent border-b-slate-900" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
