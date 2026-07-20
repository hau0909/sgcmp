"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { DollarSign, Send, XCircle, FileText } from "lucide-react";
import { BookingStatus } from "../types";
import { VerificationStatus } from "@/features/verification/types";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface BookingQuotationPanelProps {
  initialPrice: number | null;
  guardsCount: number;
  status: BookingStatus;
  onQuote: (price: number) => void;
  onReject: () => void;
  viewMode?: "company" | "customer";
  onAccept?: () => void;
  contractId?: string | null;
  verificationStatus?: VerificationStatus | null;
  onCancelBooking?: () => void;
}

export function BookingQuotationPanel({
  initialPrice,
  guardsCount,
  status,
  onQuote,
  onReject,
  viewMode = "company",
  onAccept,
  contractId,
  verificationStatus,
  onCancelBooking,
}: BookingQuotationPanelProps) {
  const { dict } = useTranslation();
  const [priceStr, setPriceStr] = useState("");

  // Helper to format string into numbers with commas: e.g. 45000000 -> 45,000,000
  const formatNumber = (val: string) => {
    const cleanNum = val.replace(/\D/g, "");
    if (!cleanNum) return "";
    return Number(cleanNum).toLocaleString("vi-VN");
  };

  // Synchronize initial value
  useEffect(() => {
    setPriceStr(initialPrice !== null && initialPrice !== undefined ? formatPrice(initialPrice) : "");
  }, [initialPrice]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/\D/g, "");
    setPriceStr(formatNumber(cleanVal));
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = priceStr.replace(/\D/g, "");
    const numericPrice = cleanNum ? Number(cleanNum) : 0;
    onQuote(numericPrice);
  };

  const isReadOnly =
    viewMode === "customer" ? status !== "quoted" : (status !== "pending" && status !== "rejected");

  const isInputsDisabled = isReadOnly || viewMode === "customer" || (viewMode === "company" && verificationStatus !== "approved");

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden h-fit sticky top-20 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] duration-300 animate-in fade-in slide-in-from-right-3 duration-300">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      {/* Header section matching contract template style */}
      <h3 className="text-base font-bold text-on-surface mb-5 flex items-center gap-2 border-b border-outline-variant/30 pb-2.5 font-headline">
        <DollarSign className="w-5 h-5 text-secondary" />
        <div className="flex flex-col">
          <span>{dict.booking.detail.quotation_panel.update_quote_title || "Cập nhật báo giá"}</span>
          <span className="text-[10px] font-normal text-on-surface-variant/80 tracking-normal normal-case mt-0.5">
            {dict.booking.detail.quotation_panel.update_quote_subtitle || "Phản hồi yêu cầu cho khách hàng"}
          </span>
        </div>
      </h3>

      <form onSubmit={handleSubmitQuote} className="space-y-5">
        {/* Input Proposed Price */}
        <div>
          <label
            htmlFor="proposed-price"
            className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
          >
            {dict.booking.detail.quotation_panel.proposed_price || "Đề xuất giá"} ({dict.booking.detail.quotation_panel.vnd || "VND"})
          </label>
          <div className="relative">
            <input
              type="text"
              id="proposed-price"
              value={priceStr}
              onChange={handlePriceChange}
              disabled={isInputsDisabled}
              className="w-full pl-3 pr-12 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm font-semibold font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-outline">
              {dict.booking.detail.quotation_panel.vnd || "VND"}
            </span>
          </div>
        </div>



        {/* Action Buttons */}
        <div className="pt-4 border-t border-outline-variant/30 space-y-3">
          {isReadOnly ? (
            <div className="p-3 text-center rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface-variant/75 flex flex-col items-center">
              <div>
                {viewMode === "customer" ? (
                  <>
                    {status === "pending" && (dict.booking.detail.quotation_panel.customer_msg_pending || "Yêu cầu đang chờ doanh nghiệp gửi báo giá.")}
                    {status === "accepted" && (dict.booking.detail.quotation_panel.customer_msg_accepted || "Yêu cầu này đã được phê duyệt.")}
                    {status === "rejected" && (dict.booking.detail.quotation_panel.customer_msg_rejected || "Yêu cầu này đã bị từ chối báo giá.")}
                    {status === "canceled" && (dict.booking.detail.quotation_panel.customer_msg_canceled || "Yêu cầu này đã bị hủy bỏ.")}
                  </>
                ) : (
                  <>
                    {status === "quoted" && (dict.booking.detail.quotation_panel.company_msg_quoted || "Yêu cầu này đã được báo giá. Không thể chỉnh sửa.")}
                    {status === "accepted" && (dict.booking.detail.quotation_panel.company_msg_accepted || "Yêu cầu này đã được phê duyệt. Không thể chỉnh sửa.")}
                    {status === "rejected" && (dict.booking.detail.quotation_panel.company_msg_rejected || "Yêu cầu này đã bị từ chối. Không thể chỉnh sửa.")}
                    {status === "canceled" && (dict.booking.detail.quotation_panel.company_msg_canceled || "Yêu cầu này đã bị hủy bỏ. Không thể chỉnh sửa.")}
                  </>
                )}
              </div>
              {status === "accepted" && contractId && (
                <Link
                  href={
                    viewMode === "customer"
                      ? `/my-contracts/${contractId}`
                      : `/contracts/${contractId}`
                  }
                  className="inline-flex w-full justify-center items-center gap-1.5 px-3 py-2.5 bg-primary hover:bg-primary/95 text-on-primary font-bold rounded-lg text-xs transition-all duration-100 active:scale-95 cursor-pointer mt-2.5 shadow-sm"
                >
                  <FileText className="w-4.5 h-4.5 shrink-0" />
                  <span>{dict.booking.detail.quotation_panel.go_to_contract || "Đi tới Hợp đồng chi tiết"}</span>
                </Link>
              )}
            </div>
          ) : viewMode === "customer" ? (
            <>
              {/* Customer actions */}
              <button
                type="button"
                onClick={onAccept}
                className="w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{dict.booking.detail.quotation_panel.accept_quote || "Đồng ý báo giá"}</span>
              </button>

              <button
                type="button"
                onClick={onReject}
                className="w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{dict.booking.detail.quotation_panel.reject_quote || "Từ chối báo giá"}</span>
              </button>
            </>
          ) : (
            <>
              {/* Button: Send/Update */}
              {viewMode === "company" && verificationStatus !== "approved" ? (
                <div className="p-3 mb-3 text-center rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200 leading-relaxed">
                  {dict.booking.detail.quotation_panel.verification_required || "Cần hoàn tất và duyệt \"Khảo sát yêu cầu\" trước khi báo giá."}
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>{status === "rejected" ? (dict.booking.detail.quotation_panel.update_resend_quote || "Cập nhật & Gửi báo giá lại") : (dict.booking.detail.quotation_panel.update_send_quote || "Cập nhật & Gửi khách hàng")}</span>
                </button>
              )}

              {/* Button: Reject */}
              <button
                type="button"
                onClick={onReject}
                className="w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{dict.booking.detail.quotation_panel.reject_request || "Từ chối yêu cầu"}</span>
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
