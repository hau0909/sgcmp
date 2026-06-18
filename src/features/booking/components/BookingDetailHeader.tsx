"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { BookingStatus } from "../types";

interface BookingDetailHeaderProps {
  bookingId: string;
  status: BookingStatus;
  createdAt: string;
  backUrl?: string;
}

export function BookingDetailHeader({
  bookingId,
  status,
  createdAt,
  backUrl = "/requests",
}: BookingDetailHeaderProps) {
  // Format receipt time
  const formattedDate = React.useMemo(() => {
    try {
      const date = new Date(createdAt);
      return `Đã nhận: ${date.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} ${date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })}`;
    } catch {
      return "Đã nhận: Chưa rõ";
    }
  }, [createdAt]);

  const displayCode = `#REQ-${bookingId.slice(0, 5).toUpperCase()}`;

  // Helper to render the status badge according to design specifications
  const renderStatusBadge = () => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-surface-container-high text-on-surface border border-outline-variant transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-secondary mr-2 animate-pulse"></span>
            Mới
          </span>
        );
      case "quoted":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-55/10 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40 transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-amber-500 mr-2"></span>
            Đã báo giá
          </span>
        );
      case "accepted":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-emerald-55/10 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40 transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-red-55/10 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-900/40 transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
            Từ chối
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Breadcrumbs Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-medium text-on-surface-variant mb-2">
        <Link
          href={backUrl}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Yêu cầu
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/60 shrink-0" />
        <span className="text-on-surface font-semibold">
          Chi tiết {displayCode}
        </span>
      </nav>

      {/* Main Title & Code Badge Container */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex flex-wrap items-center gap-3">
            <span>Chi tiết yêu cầu</span>
            <span className="font-mono text-primary bg-primary-fixed px-2.5 py-0.5 rounded-md text-xs font-semibold tracking-tight border border-primary-fixed-dim shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
              {displayCode}
            </span>
          </h2>
          <p className="text-xs text-on-surface-variant/80 mt-1.5 font-medium">
            {formattedDate}
          </p>
        </div>
        <div className="flex shrink-0 items-center">
          {renderStatusBadge()}
        </div>
      </div>
    </div>
  );
}
