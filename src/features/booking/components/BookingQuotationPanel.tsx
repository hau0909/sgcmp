"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  DollarSign,
  Send,
  XCircle,
  FileText,
  Clock,
  Calendar,
  PackageCheck,
  Calculator,
  RotateCcw,
  Users,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";
import { BookingStatus } from "../types";
import { QuotationType } from "@/types/Booking";
import { VerificationStatus } from "@/features/verification/types";
import { formatPrice } from "@/utils/formatPrice";
import { useTranslation } from "@/components/providers/LanguageProvider";
import {
  calculateQuotationSuggestions,
  formatHours,
  formatDetailedDuration,
} from "@/utils/calcQuotation";

interface BookingQuotationPanelProps {
  serviceName?: string;
  initialPrice?: number | null;
  initialQuotationType?: QuotationType | null;
  initialHourlyRate?: number | null;
  initialMonthlyRate?: number | null;
  guardsCount?: number;
  timeSlots?: string[];
  daysPerWeek?: string[];
  startDate?: string;
  endDate?: string;
  basePricePerHour?: number | null;
  status: BookingStatus;
  onQuote: (params: {
    quoted_price: number;
    quotation_type: QuotationType;
    hourly_rate?: number;
    monthly_rate?: number;
  }) => void;
  onReject: () => void;
  viewMode?: "company" | "customer";
  onAccept?: () => void;
  contractId?: string | null;
  verificationStatus?: VerificationStatus | null;
  onCancelBooking?: () => void;
}

export function BookingQuotationPanel({
  serviceName,
  initialPrice,
  initialQuotationType = "package",
  initialHourlyRate,
  initialMonthlyRate,
  guardsCount = 1,
  timeSlots = [],
  daysPerWeek = [],
  startDate = "",
  endDate = "",
  basePricePerHour = null,
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
  const qp = dict.booking.detail.quotation_panel || {};

  const [quotationType, setQuotationType] = useState<QuotationType>(
    initialQuotationType || "package"
  );
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState<boolean>(false);
  const [isConfirmSubmitQuoteOpen, setIsConfirmSubmitQuoteOpen] = useState<boolean>(false);
  const [isConfirmAcceptQuoteOpen, setIsConfirmAcceptQuoteOpen] = useState<boolean>(false);

  const [hourlyRateStr, setHourlyRateStr] = useState<string>("");
  const [monthlyRateStr, setMonthlyRateStr] = useState<string>("");
  const [packagePriceStr, setPackagePriceStr] = useState<string>("");

  const calcSuggestions = useMemo(() => {
    return calculateQuotationSuggestions({
      basePricePerHour: basePricePerHour || null,
      guardsPerSlot: guardsCount,
      timeSlots,
      daysPerWeek,
      startDate,
      endDate,
    });
  }, [basePricePerHour, guardsCount, timeSlots, daysPerWeek, startDate, endDate]);

  const formatNumber = (val: string | number) => {
    const cleanNum = String(val).replace(/\D/g, "");
    if (!cleanNum) return "";
    return Number(cleanNum).toLocaleString("vi-VN");
  };

  const parseCleanNumber = (val: string): number => {
    const cleanNum = val.replace(/\D/g, "");
    return cleanNum ? Number(cleanNum) : 0;
  };

  useEffect(() => {
    if (initialQuotationType) {
      setQuotationType(initialQuotationType);
    }

    const hRate = initialHourlyRate || calcSuggestions.suggestedHourlyRate;
    setHourlyRateStr(formatNumber(hRate));

    const mRate = initialMonthlyRate || calcSuggestions.suggestedMonthlyRate;
    setMonthlyRateStr(formatNumber(mRate));

    const pPrice =
      initialPrice !== null && initialPrice !== undefined
        ? initialPrice
        : calcSuggestions.packageTotalPrice;
    setPackagePriceStr(formatNumber(pPrice));
  }, [
    initialPrice,
    initialQuotationType,
    initialHourlyRate,
    initialMonthlyRate,
    calcSuggestions,
  ]);

  const calculatedTotalPrice = useMemo(() => {
    if (quotationType === "hourly") {
      const hRate = parseCleanNumber(hourlyRateStr);
      return Math.round(hRate * calcSuggestions.totalGuardHours);
    }
    if (quotationType === "monthly") {
      const mRate = parseCleanNumber(monthlyRateStr);
      return Math.round(mRate * guardsCount * calcSuggestions.totalMonths);
    }
    return parseCleanNumber(packagePriceStr);
  }, [
    quotationType,
    hourlyRateStr,
    monthlyRateStr,
    packagePriceStr,
    guardsCount,
    calcSuggestions.totalGuardHours,
    calcSuggestions.totalMonths,
  ]);

  // Calculate equivalent hourly rate for Reference in Monthly & Package options
  const equivalentHourlyRate = useMemo(() => {
    if (calcSuggestions.totalGuardHours <= 0) return 0;
    if (quotationType === "hourly") {
      return parseCleanNumber(hourlyRateStr);
    }
    return Math.round(calculatedTotalPrice / calcSuggestions.totalGuardHours);
  }, [quotationType, hourlyRateStr, calculatedTotalPrice, calcSuggestions.totalGuardHours]);

  // Reset current option input to system calculated suggestion
  const handleResetToSuggestion = () => {
    if (quotationType === "hourly") {
      setHourlyRateStr(formatNumber(calcSuggestions.suggestedHourlyRate));
    } else if (quotationType === "monthly") {
      setMonthlyRateStr(formatNumber(calcSuggestions.suggestedMonthlyRate));
    } else if (quotationType === "package") {
      setPackagePriceStr(formatNumber(calcSuggestions.packageTotalPrice));
    }
  };

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setIsConfirmSubmitQuoteOpen(true);
  };

  const handleConfirmSubmitQuote = () => {
    setIsConfirmSubmitQuoteOpen(false);
    const hRate = parseCleanNumber(hourlyRateStr);
    const mRate = parseCleanNumber(monthlyRateStr);

    onQuote({
      quoted_price: calculatedTotalPrice,
      quotation_type: quotationType,
      hourly_rate: quotationType === "hourly" ? hRate : equivalentHourlyRate,
      monthly_rate: quotationType === "monthly" ? mRate : undefined,
    });
  };

  const handleConfirmAcceptQuote = () => {
    setIsConfirmAcceptQuoteOpen(false);
    if (onAccept) {
      onAccept();
    }
  };

  const isReadOnly =
    viewMode === "customer" ? status !== "quoted" : (status !== "pending" && status !== "rejected");

  const isInputsDisabled =
    isReadOnly ||
    viewMode === "customer" ||
    (viewMode === "company" && verificationStatus !== "approved");

  const isRejected = status === "rejected";

  const hasQuote = initialPrice !== null && initialPrice !== undefined && initialPrice > 0;
  const showQuoteDetails = (viewMode === "company" && !isReadOnly) || hasQuote;

  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-6 shadow-sm relative overflow-hidden h-fit transition-all duration-300 ${
        isRejected
          ? "border-2 border-red-500 ring-2 ring-red-500/20"
          : "border border-outline-variant"
      }`}
    >
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full pointer-events-none"></div>

      {/* Header section */}
      <h3 className="text-base font-bold text-on-surface mb-3 flex items-center justify-between border-b border-outline-variant/30 pb-2.5 font-headline">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-secondary" />
          <div className="flex flex-col">
            <span>
              {viewMode === "customer"
                ? (qp.title_customer || "Báo giá từ Doanh nghiệp")
                : (qp.title_company || "Cập nhật báo giá")}
            </span>
            <span className="text-[10px] font-normal text-on-surface-variant/80 tracking-normal normal-case mt-0.5">
              {viewMode === "customer"
                ? (qp.subtitle_customer || "Chi tiết tùy chọn báo giá cho dịch vụ")
                : (qp.subtitle_company || "Lựa chọn hình thức và thương lượng giá")}
            </span>
          </div>
        </div>

        {/* Rejected Alert Badge */}
        {isRejected && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-100 text-red-700 border border-red-300 shrink-0">
            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
            {qp.reject_quote || "Từ chối báo giá"}
          </span>
        )}
      </h3>

      {/* Service Name & Company Public Base Price Box (No Icon) */}
      <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30 text-xs space-y-1.5 mb-4 font-sans">
        <div className="flex justify-between items-center">
          <span className="text-on-surface-variant font-medium">{qp.selected_service || "Dịch vụ đã chọn:"}</span>
          <span className="font-bold text-on-surface text-right">
            {serviceName || "Dịch vụ bảo vệ"}
          </span>
        </div>
        <div className="flex justify-between items-center border-t border-dashed border-outline-variant/30 pt-1.5">
          <span className="text-on-surface-variant font-medium">{qp.listed_price || "Giá niêm yết công ty:"}</span>
          {basePricePerHour ? (
            <span className="font-bold font-mono text-primary">
              {formatPrice(basePricePerHour)} {qp.per_hour_suffix || "đ/giờ"}
            </span>
          ) : (
            <span className="font-medium italic text-on-surface-variant/70">
              {qp.no_fixed_price || "Chưa có giá cố định"}
            </span>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmitQuote} className="space-y-4">
        {/* 3 Quotation Options Tab Selector */}
        {!isInputsDisabled && viewMode === "company" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                {qp.quotation_method || "Phương thức báo giá"}
              </label>
              {isRejected && (
                <span className="text-[10.5px] font-semibold text-red-600 italic">
                  {qp.prev_quote_rejected || "* Báo giá trước đó đã bị từ chối"}
                </span>
              )}
            </div>
            <div
              className={`grid grid-cols-3 gap-1.5 p-1 rounded-lg border ${
                isRejected
                  ? "bg-red-50/40 border-red-300"
                  : "bg-surface-container border-outline-variant/40"
              }`}
            >
              <button
                type="button"
                onClick={() => setQuotationType("hourly")}
                className={`py-2 px-1 text-center rounded-md text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  quotationType === "hourly"
                    ? isRejected
                      ? "bg-white text-red-700 font-bold border-2 border-red-500 shadow-sm"
                      : "bg-white text-primary shadow-sm font-bold border border-primary/20"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>{qp.type_hourly || "Theo Giờ"}</span>
              </button>

              <button
                type="button"
                onClick={() => setQuotationType("monthly")}
                className={`py-2 px-1 text-center rounded-md text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  quotationType === "monthly"
                    ? isRejected
                      ? "bg-white text-red-700 font-bold border-2 border-red-500 shadow-sm"
                      : "bg-white text-primary shadow-sm font-bold border border-primary/20"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{qp.type_monthly || "Theo Tháng"}</span>
              </button>

              <button
                type="button"
                onClick={() => setQuotationType("package")}
                className={`py-2 px-1 text-center rounded-md text-xs font-semibold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                  quotationType === "package"
                    ? isRejected
                      ? "bg-white text-red-700 font-bold border-2 border-red-500 shadow-sm"
                      : "bg-white text-primary shadow-sm font-bold border border-primary/20"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>{qp.type_package || "Trọn Gói"}</span>
              </button>
            </div>
          </div>
        )}

        {/* Selected Option Badge in Customer / ReadOnly Mode */}
        {isInputsDisabled && showQuoteDetails && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between ${
              isRejected
                ? "bg-red-50 border-red-300 text-red-700"
                : "bg-primary/5 border-primary/20"
            }`}
          >
            <span
              className={`text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                isRejected ? "text-red-700" : "text-primary"
              }`}
            >
              {quotationType === "hourly" && <Clock className="w-4 h-4" />}
              {quotationType === "monthly" && <Calendar className="w-4 h-4" />}
              {quotationType === "package" && <PackageCheck className="w-4 h-4" />}
              {quotationType === "hourly"
                ? `${qp.type_hourly || "Theo Giờ"}`
                : quotationType === "monthly"
                ? `${qp.type_monthly || "Theo Tháng"}`
                : `${qp.type_package || "Trọn Gói"}`}
              {isRejected && ` (${qp.reject_quote || "Từ chối báo giá"})`}
            </span>
            <span className="text-[11px] font-semibold text-on-surface-variant flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-primary" />
              {guardsCount} {qp.guards_suffix || "bảo vệ"}
            </span>
          </div>
        )}

        {/* Option 1: Hourly Inputs */}
        {showQuoteDetails && quotationType === "hourly" && (
          <div className="space-y-3 p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-semibold text-on-surface">
                  {qp.hourly_unit_negotiated || "Đơn giá thương lượng (VND / Giờ / Nhân sự)"}
                </label>
                {!isInputsDisabled && (
                  <button
                    type="button"
                    onClick={handleResetToSuggestion}
                    className="text-[10.5px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
                    title={qp.reset_suggestion || "Khôi phục lại giá tự động gợi ý"}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{qp.reset_suggestion || "Dùng giá gợi ý"}</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={hourlyRateStr}
                  onChange={(e) => setHourlyRateStr(formatNumber(e.target.value))}
                  disabled={isInputsDisabled}
                  className={`w-full pl-3 pr-16 py-2 border rounded-md bg-surface-container-lowest text-sm font-semibold font-mono text-on-surface focus:ring-2 focus:ring-secondary/60 disabled:opacity-75 ${
                    isRejected ? "border-red-400 focus:ring-red-500" : "border-outline-variant"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline font-semibold">
                  {qp.per_hour_suffix || "đ/giờ"}
                </span>
              </div>
            </div>

            {/* Clear Specs Summary Box */}
            <div className="text-[11.5px] text-on-surface-variant space-y-1.5 bg-white p-3 rounded-lg border border-outline-variant/20 font-sans">
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.guards_count_label || "Số lượng nhân sự:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {guardsCount} {qp.guards_suffix || "bảo vệ"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.hours_per_day_label || "Số giờ trực / ngày:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {formatHours(calcSuggestions.hoursPerDay)}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.working_days_label || "Số ngày làm việc:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {calcSuggestions.totalWorkingDays} {qp.days_suffix || "ngày"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Option 2: Monthly Inputs */}
        {showQuoteDetails && quotationType === "monthly" && (
          <div className="space-y-3 p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-semibold text-on-surface">
                  {qp.monthly_unit_negotiated || "Đơn giá thương lượng (VND / Tháng / Vị trí)"}
                </label>
                {!isInputsDisabled && (
                  <button
                    type="button"
                    onClick={handleResetToSuggestion}
                    className="text-[10.5px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
                    title={qp.reset_suggestion || "Khôi phục lại giá tự động gợi ý"}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{qp.reset_suggestion || "Dùng giá gợi ý"}</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={monthlyRateStr}
                  onChange={(e) => setMonthlyRateStr(formatNumber(e.target.value))}
                  disabled={isInputsDisabled}
                  className={`w-full pl-3 pr-18 py-2 border rounded-md bg-surface-container-lowest text-sm font-semibold font-mono text-on-surface focus:ring-2 focus:ring-secondary/60 disabled:opacity-75 ${
                    isRejected ? "border-red-400 focus:ring-red-500" : "border-outline-variant"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline font-semibold">
                  {qp.per_month_suffix || "đ/tháng"}
                </span>
              </div>
            </div>

            {/* Clear Specs Summary Box */}
            <div className="text-[11.5px] text-on-surface-variant space-y-1.5 bg-white p-3 rounded-lg border border-outline-variant/20 font-sans">
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.guards_count_label || "Số lượng nhân sự:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {guardsCount} {qp.guards_suffix || "bảo vệ"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.contract_duration_label || "Thời hạn hợp đồng:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {calcSuggestions.totalMonths} {qp.months_suffix || "tháng"} ({calcSuggestions.totalWorkingDays} {qp.days_suffix || "ngày"})
                </span>
              </div>
            </div>

            {/* Hourly Rate Equivalent Reference Callout */}
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 flex justify-between items-center font-medium">
              <span>{qp.equivalent_hourly_rate || "Đơn giá giờ tương đương:"}</span>
              <strong className="font-mono text-xs text-amber-950 font-bold">
                {formatPrice(equivalentHourlyRate)} {qp.per_hour_guard_suffix || "đ/giờ/nhân sự"}
              </strong>
            </div>
          </div>
        )}

        {/* Option 3: Package Total Inputs */}
        {showQuoteDetails && quotationType === "package" && (
          <div className="space-y-3 p-3.5 bg-surface-container-low rounded-lg border border-outline-variant/30">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[11px] font-semibold text-on-surface">
                  {qp.package_unit_negotiated || "Tổng giá trị thương lượng trọn gói (VND)"}
                </label>
                {!isInputsDisabled && (
                  <button
                    type="button"
                    onClick={handleResetToSuggestion}
                    className="text-[10.5px] font-semibold text-primary hover:text-primary/80 flex items-center gap-1 cursor-pointer transition-colors"
                    title={qp.reset_suggestion || "Khôi phục lại giá tự động gợi ý"}
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{qp.reset_suggestion || "Dùng giá gợi ý"}</span>
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={packagePriceStr}
                  onChange={(e) => setPackagePriceStr(formatNumber(e.target.value))}
                  disabled={isInputsDisabled}
                  className={`w-full pl-3 pr-12 py-2 border rounded-md bg-surface-container-lowest text-sm font-semibold font-mono text-on-surface focus:ring-2 focus:ring-secondary/60 disabled:opacity-75 ${
                    isRejected ? "border-red-400 focus:ring-red-500" : "border-outline-variant"
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-outline font-semibold">
                  {qp.currency_symbol || "VND"}
                </span>
              </div>
            </div>

            {/* Clear Specs Summary Box */}
            <div className="text-[11.5px] text-on-surface-variant space-y-1.5 bg-white p-3 rounded-lg border border-outline-variant/20 font-sans">
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.guards_count_label || "Số lượng nhân sự:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {guardsCount} {qp.guards_suffix || "bảo vệ"}
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span>{qp.service_duration_label || "Thời hạn dịch vụ:"}</span>
                <span className="font-bold text-on-surface font-mono">
                  {calcSuggestions.totalWorkingDays} {qp.days_suffix || "ngày"}
                </span>
              </div>
            </div>

            {/* Hourly Rate Equivalent Reference Callout */}
            <div className="p-2.5 bg-amber-50/80 border border-amber-200/60 rounded-lg text-[11px] text-amber-900 flex justify-between items-center font-medium">
              <span>{qp.equivalent_hourly_rate || "Đơn giá giờ tương đương:"}</span>
              <strong className="font-mono text-xs text-amber-950 font-bold">
                {formatPrice(equivalentHourlyRate)} {qp.per_hour_guard_suffix || "đ/giờ/nhân sự"}
              </strong>
            </div>
          </div>
        )}

        {/* Vertical Math Breakdown & Calculated Total Price Display Block */}
        {showQuoteDetails && (
          <div
            className={`p-3.5 rounded-xl space-y-2 shadow-xs border ${
              isRejected
                ? "bg-red-50/80 border-red-300"
                : "bg-primary/10 border-primary/20"
            }`}
          >
            {/* Minh họa phép tính dọc cực kỳ gọn gàng */}
            <div className="space-y-1 text-xs text-on-surface-variant font-sans">
              {quotationType === "hourly" && (
                <>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.negotiated_rate_label || "Đơn giá thương lượng:"}</span>
                    <span className="font-mono font-bold text-on-surface">
                      {formatPrice(parseCleanNumber(hourlyRateStr))} {qp.per_hour_guard_suffix || "đ/giờ/nhân sự"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.total_guard_hours_label || "Tổng số giờ bảo vệ"} ({guardsCount} {qp.guards_suffix || "bảo vệ"}):</span>
                    <span className="font-mono font-bold text-on-surface">
                      {formatHours(calcSuggestions.totalGuardHours)}
                    </span>
                  </div>
                </>
              )}

              {quotationType === "monthly" && (
                <>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.monthly_rate_label || "Đơn giá vị trí / tháng:"}</span>
                    <span className="font-mono font-bold text-on-surface">
                      {formatPrice(parseCleanNumber(monthlyRateStr))} {qp.per_month_suffix || "đ/tháng"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.guards_count_label || "Số lượng nhân sự:"}</span>
                    <span className="font-mono font-bold text-on-surface">
                      {guardsCount} {qp.guards_suffix || "bảo vệ"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.contract_duration_label || "Thời hạn hợp đồng:"}</span>
                    <span className="font-mono font-bold text-on-surface">
                      {calcSuggestions.totalMonths} {qp.months_suffix || "tháng"} ({calcSuggestions.totalWorkingDays} {qp.days_suffix || "ngày"})
                    </span>
                  </div>
                </>
              )}

              {quotationType === "package" && (
                <>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.equivalent_hourly_rate_short || "Đơn giá giờ quy đổi:"}</span>
                    <span className="font-mono font-bold text-on-surface">
                      ~{formatPrice(equivalentHourlyRate)} {qp.per_hour_suffix || "đ/giờ"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-0.5">
                    <span className="font-medium text-on-surface-variant">{qp.total_guard_hours_label || "Tổng số giờ bảo vệ"} ({guardsCount} {qp.guards_suffix || "bảo vệ"}):</span>
                    <span className="font-mono font-bold text-on-surface">
                      {formatHours(calcSuggestions.totalGuardHours)}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Đường gạch ngang phép tính dọc */}
            <div className="border-t-2 border-primary/25 pt-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className={`w-5 h-5 ${isRejected ? "text-red-600" : "text-primary"}`} />
                <span className="text-xs font-bold text-on-surface">{qp.total_quoted_price || "Tổng tiền báo giá:"}</span>
              </div>
              <span
                className={`text-lg font-black font-mono ${
                  isRejected ? "text-red-700" : "text-primary"
                }`}
              >
                {formatPrice(calculatedTotalPrice)} {qp.currency_symbol || "đ"}
              </span>
            </div>

            <div
              className={`text-[10.5px] font-semibold text-right italic ${
                isRejected ? "text-red-600/90" : "text-primary/80"
              }`}
            >
              {quotationType === "hourly" && (qp.note_hourly?.replace("{price}", formatPrice(parseCleanNumber(hourlyRateStr))) || `* Báo giá theo Giờ (${formatPrice(parseCleanNumber(hourlyRateStr))} đ/giờ/nhân sự)`)}
              {quotationType === "monthly" && (qp.note_monthly?.replace("{price}", formatPrice(parseCleanNumber(monthlyRateStr))) || `* Báo giá theo Tháng (${formatPrice(parseCleanNumber(monthlyRateStr))} đ/tháng/vị trí)`)}
              {quotationType === "package" && (qp.note_package || `* Báo giá Trọn gói dịch vụ`)}
              {isRejected && ` (${qp.reject_quote || "Từ chối báo giá"})`}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-3 border-t border-outline-variant/30 space-y-3">
          {isReadOnly ? (
            <div className="p-3 text-center rounded-lg bg-surface-container border border-outline-variant/30 text-xs font-semibold text-on-surface-variant/75 flex flex-col items-center">
              <div>
                {viewMode === "customer" ? (
                  <>
                    {status === "pending" && (qp.customer_msg_pending || "Yêu cầu đang chờ doanh nghiệp gửi báo giá.")}
                    {status === "accepted" && (qp.customer_msg_accepted || "Yêu cầu này đã được phê duyệt.")}
                    {status === "rejected" && (qp.customer_msg_rejected || "Từ chối báo giá")}
                    {status === "canceled" && (qp.customer_msg_canceled || "Yêu cầu đã bị hủy")}
                  </>
                ) : (
                  <>
                    {status === "quoted" && (qp.company_msg_quoted || "Yêu cầu này đã được báo giá. Không thể chỉnh sửa.")}
                    {status === "accepted" && (qp.company_msg_accepted || "Yêu cầu này đã được phê duyệt. Không thể chỉnh sửa.")}
                    {status === "rejected" && (qp.company_msg_rejected || "Từ chối báo giá")}
                    {status === "canceled" && (qp.company_msg_canceled || "Yêu cầu đã bị hủy")}
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
                  <span>{qp.go_to_contract || "Đi tới Hợp đồng chi tiết"}</span>
                </Link>
              )}
            </div>
          ) : viewMode === "customer" ? (
            <>
              {/* Customer actions */}
              <button
                type="button"
                onClick={() => setIsConfirmAcceptQuoteOpen(true)}
                className="w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4 shrink-0" />
                <span>{qp.accept_quote || "Đồng ý báo giá"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(true)}
                className="w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{qp.reject_quote || "Từ chối báo giá"}</span>
              </button>
            </>
          ) : (
            <>
              {/* Button: Send/Update */}
              {viewMode === "company" && verificationStatus !== "approved" ? (
                <div className="p-3 mb-3 text-center rounded-lg bg-amber-50 text-amber-700 text-[11px] font-semibold border border-amber-200 leading-relaxed">
                  {qp.verification_required || "Cần hoàn tất và duyệt \"Khảo sát yêu cầu\" trước khi báo giá."}
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-on-primary text-xs font-bold py-2.5 rounded-lg shadow-md transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>
                    {status === "rejected"
                      ? (qp.update_resend_quote || "Cập nhật & Gửi báo giá lại")
                      : (qp.update_send_quote || "Cập nhật & Gửi khách hàng")}
                  </span>
                </button>
              )}

              {/* Button: Reject */}
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(true)}
                className="w-full bg-transparent hover:bg-red-50/50 border border-error text-error text-xs font-bold py-2.5 rounded-lg shadow-sm transition-all duration-100 active:scale-95 flex justify-center items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{qp.reject_request || "Từ chối yêu cầu"}</span>
              </button>
            </>
          )}
        </div>
      </form>

      {/* Reject / Cancel Confirmation Dialog */}
      {isRejectDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-error/10 text-error mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
                {viewMode === "customer"
                  ? (qp.reject_quote_confirm_title || "Từ chối báo giá")
                  : (qp.reject_request_confirm_title || "Từ chối yêu cầu dịch vụ")}
              </h3>
              <p className="text-sm text-on-surface-variant/80 font-body">
                {viewMode === "customer"
                  ? (qp.reject_quote_confirm_desc || "Bạn có chắc chắn muốn từ chối báo giá này không? Hành động này không thể hoàn tác.")
                  : (qp.reject_request_confirm_desc || "Bạn có chắc chắn muốn từ chối yêu cầu dịch vụ này không? Hành động này không thể hoàn tác.")}
              </p>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsRejectDialogOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm cursor-pointer"
              >
                {qp.confirm_cancel || "Đóng"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRejectDialogOpen(false);
                  onReject();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-error hover:bg-error/90 text-white transition-all active:scale-95 text-sm cursor-pointer shadow-sm"
              >
                {qp.confirm_reject || "Xác nhận từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Quote Confirmation Dialog (Company) */}
      {isConfirmSubmitQuoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto mb-4">
                <Send className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
                {qp.confirm_submit_title || "Xác nhận gửi báo giá"}
              </h3>
              <p className="text-sm text-on-surface-variant/80 font-body mb-3">
                {qp.confirm_submit_desc || "Bạn có chắc chắn muốn gửi phương án báo giá này cho khách hàng không?"}
              </p>
              <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface flex justify-between items-center">
                <span>{qp.total_quoted_price || "Tổng tiền báo giá:"}</span>
                <span className="font-mono text-primary font-bold text-sm">
                  {formatPrice(calculatedTotalPrice)} đ
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsConfirmSubmitQuoteOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm cursor-pointer"
              >
                {qp.confirm_cancel || "Đóng"}
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmitQuote}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary transition-all active:scale-95 text-sm cursor-pointer shadow-sm"
              >
                {qp.confirm_send || "Xác nhận gửi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accept Quote Confirmation Dialog (Customer) */}
      {isConfirmAcceptQuoteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 mx-auto mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-on-surface mb-2 font-headline">
                {qp.confirm_accept_title || "Xác nhận đồng ý báo giá"}
              </h3>
              <p className="text-sm text-on-surface-variant/80 font-body mb-3">
                {qp.confirm_accept_desc || "Bạn có chắc chắn muốn chấp nhận báo giá này không? Hợp đồng sẽ được tự động khởi tạo."}
              </p>
              {initialPrice && (
                <div className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-xs font-semibold text-on-surface flex justify-between items-center">
                  <span>{qp.total_quoted_price || "Tổng tiền báo giá:"}</span>
                  <span className="font-mono text-primary font-bold text-sm">
                    {formatPrice(initialPrice)} đ
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 p-4 bg-surface-container-low/50 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => setIsConfirmAcceptQuoteOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors text-sm cursor-pointer"
              >
                {qp.confirm_cancel || "Đóng"}
              </button>
              <button
                type="button"
                onClick={handleConfirmAcceptQuote}
                className="flex-1 py-2.5 px-4 rounded-xl font-bold bg-primary hover:bg-primary/90 text-on-primary transition-all active:scale-95 text-sm cursor-pointer shadow-sm"
              >
                {qp.confirm_accept || "Xác nhận đồng ý"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
