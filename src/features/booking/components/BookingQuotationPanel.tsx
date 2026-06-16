"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, Send, XCircle } from "lucide-react";
import { BookingStatus } from "../types";

interface BookingQuotationPanelProps {
  initialPrice: number | null;
  guardsCount: number;
  status: BookingStatus;
  onQuote: (price: number, notes: string) => void;
  onReject: () => void;
}

export function BookingQuotationPanel({
  initialPrice,
  guardsCount,
  status,
  onQuote,
  onReject,
}: BookingQuotationPanelProps) {
  // Calculate default price based on: guardsCount * 3,000,000 VND
  const defaultEstimate = React.useMemo(() => {
    return guardsCount * 3000000;
  }, [guardsCount]);

  const [priceStr, setPriceStr] = useState("");
  const [notes, setNotes] = useState("");

  // Helper to format string into numbers with commas: e.g. 45000000 -> 45,000,000
  const formatNumber = (val: string) => {
    const cleanNum = val.replace(/\D/g, "");
    if (!cleanNum) return "";
    return Number(cleanNum).toLocaleString("vi-VN");
  };

  // Synchronize initial value
  useEffect(() => {
    const val = initialPrice !== null ? initialPrice : defaultEstimate;
    setPriceStr(val.toLocaleString("vi-VN"));
  }, [initialPrice, defaultEstimate]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanVal = e.target.value.replace(/\D/g, "");
    setPriceStr(formatNumber(cleanVal));
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = priceStr.replace(/\D/g, "");
    const numericPrice = cleanNum ? Number(cleanNum) : defaultEstimate;
    onQuote(numericPrice, notes);
  };

  const isReadOnly = status === "accepted" || status === "rejected";

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm relative overflow-hidden h-fit sticky top-20 transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] duration-300 animate-in fade-in slide-in-from-right-3 duration-300">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      {/* Header section matching contract template style */}
      <h3 className="text-base font-bold text-on-surface mb-5 flex items-center gap-2 border-b border-outline-variant/30 pb-2.5 font-headline">
        <DollarSign className="w-5 h-5 text-secondary" />
        <div className="flex flex-col">
          <span>Cập nhật báo giá</span>
          <span className="text-[10px] font-normal text-on-surface-variant/80 tracking-normal normal-case mt-0.5">
            Phản hồi yêu cầu cho khách hàng
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
            Đề xuất giá (VND)
          </label>
          <div className="relative">
            <input
              type="text"
              id="proposed-price"
              value={priceStr}
              onChange={handlePriceChange}
              disabled={isReadOnly}
              className="w-full pl-3 pr-12 py-2.5 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm font-semibold font-mono text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            />
            <span className="absolute right-3.5 top-1/2 transform -translate-y-1/2 text-xs font-semibold text-outline">
              VND
            </span>
          </div>
          <p className="text-[10px] font-medium text-outline mt-1.5 leading-normal">
            Dựa trên ước tính: 3,000,000 VND / nhân sự / sự kiện
          </p>
        </div>

        {/* Notes Textarea */}
        <div>
          <label
            htmlFor="quotation-notes"
            className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5"
          >
            Ghi chú báo giá
          </label>
          <textarea
            id="quotation-notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={isReadOnly}
            placeholder={
              isReadOnly
                ? "Đã đóng cập nhật ghi chú."
                : "Nhập ghi chú hoặc điều khoản đặc biệt gửi cho khách hàng..."
            }
            className="w-full p-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-xs font-medium font-body text-on-surface placeholder:text-on-surface-variant/45 focus:outline-none focus:ring-2 focus:ring-secondary/60 focus:border-secondary shadow-sm resize-none transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-outline-variant/30 space-y-3">
          {isReadOnly ? (
            <div className="p-3 text-center rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface-variant/75">
              Yêu cầu này đã {status === "accepted" ? "được phê duyệt" : "bị từ chối"}. Không thể chỉnh sửa báo giá.
            </div>
          ) : (
            <>
              {/* Button: Send/Update */}
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>Cập nhật & Gửi khách hàng</span>
              </button>

              {/* Button: Reject */}
              <button
                type="button"
                onClick={onReject}
                className="w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>Từ chối yêu cầu</span>
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
