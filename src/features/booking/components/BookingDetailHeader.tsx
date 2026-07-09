"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ChevronRight, FileText, ClipboardCheck, Plus, XCircle, AlertTriangle } from "lucide-react";
import { BookingStatus } from "../types";
import { VerificationStatus } from "@/features/verification/types";

interface BookingDetailHeaderProps {
  bookingId: string;
  status: BookingStatus;
  createdAt: string;
  backUrl?: string;
  contractId?: string | null;
  isCustomer?: boolean;
  verificationStatus?: VerificationStatus | null;
  onCreateVerification?: () => void;
  onViewVerification?: () => void;
  isCreatingVerification?: boolean;
  onCancelBooking?: () => void;
}

export function BookingDetailHeader({
  bookingId,
  status,
  createdAt,
  backUrl = "/requests",
  contractId,
  isCustomer = false,
  verificationStatus,
  onCreateVerification,
  onViewVerification,
  isCreatingVerification = false,
  onCancelBooking,
}: BookingDetailHeaderProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

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
      case "canceled":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-slate-55/10 text-slate-700 dark:bg-slate-900/20 dark:text-slate-400 border border-slate-200 dark:border-slate-900/40 transition-all duration-300">
            <span className="w-2 h-2 rounded-full bg-slate-500 mr-2"></span>
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  const renderVerificationBadge = () => {
    if (!verificationStatus) return null;
    switch (verificationStatus) {
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-yellow-100 text-yellow-700 border border-yellow-200 whitespace-nowrap">
            Khảo sát: Chờ duyệt
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200 whitespace-nowrap">
            Khảo sát: Đã duyệt
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200 whitespace-nowrap">
            Khảo sát: Từ chối
          </span>
        );
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
        <div className="flex shrink-0 items-center gap-2 flex-wrap justify-end">
          {/* Customer Cancel action */}
          {isCustomer && status !== "accepted" && status !== "canceled" && onCancelBooking && (
            <button
              onClick={() => setIsCancelDialogOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-error/10 hover:bg-error/20 text-error font-semibold rounded-lg text-xs transition-all duration-100 active:scale-95 cursor-pointer"
            >
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Hủy yêu cầu</span>
            </button>
          )}
          
          {/* Verification action button — only shown for non-customers */}
          {!isCustomer && (
            verificationStatus ? (
              <button
                onClick={onViewVerification}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs transition-all duration-100 active:scale-95 shadow-sm cursor-pointer"
              >
                <ClipboardCheck className="w-4 h-4 shrink-0" />
                <span>Xem khảo sát</span>
              </button>
            ) : (
              <button
                onClick={onCreateVerification}
                disabled={isCreatingVerification}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-semibold rounded-lg text-xs transition-all duration-100 active:scale-95 border border-outline-variant cursor-pointer disabled:opacity-50"
              >
                {isCreatingVerification ? (
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 shrink-0" />
                )}
                <span>Tạo khảo sát</span>
              </button>
            )
          )}
          {renderStatusBadge()}
          {contractId && (
            <Link
              href={isCustomer ? `/my-contracts/${contractId}` : `/contracts/${contractId}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-primary hover:bg-primary/95 text-on-primary font-semibold rounded-lg text-xs transition-all duration-100 active:scale-95 shadow-sm cursor-pointer"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Xem hợp đồng</span>
            </Link>
          )}
        </div>
      </div>

      {/* Cancel Confirmation Dialog */}
      {isCancelDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-center text-on-surface mb-2">Hủy yêu cầu dịch vụ</h3>
              <p className="text-sm text-center text-on-surface-variant/80">
                Bạn có chắc chắn muốn hủy yêu cầu dịch vụ này không? Hành động này không thể hoàn tác.
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30">
              <button
                onClick={() => setIsCancelDialogOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setIsCancelDialogOpen(false);
                  if (onCancelBooking) onCancelBooking();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-error hover:bg-error/90 text-white transition-all active:scale-95 text-sm"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
