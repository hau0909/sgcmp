"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContractStatus } from "@/types/Enum";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ContractDetailHeaderProps {
  contractCode: string;
  status: ContractStatus;
}

export function ContractDetailHeader({ contractCode, status }: ContractDetailHeaderProps) {
  // Map statuses to appropriate styles and labels
  const getStatusDisplay = (status: ContractStatus) => {
    switch (status) {
      case "pending_signatures":
        return {
          label: "Chờ chữ ký",
          className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
        };
      case "active":
        return {
          label: "Đang hoạt động",
          className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50",
        };
      case "completed":
        return {
          label: "Đã hoàn thành",
          className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          className: "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-950/20 dark:text-slate-400 dark:border-slate-900/50",
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
      <div className="flex items-center gap-3">
        <Badge
          variant="outline"
          className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.className}`}
        >
          {statusInfo.label}
        </Badge>
        <Button variant="default" className="cursor-pointer active:scale-95 transition-transform duration-100 font-semibold shadow-sm px-4">
          Hành động
        </Button>
      </div>
    </div>
  );
}
