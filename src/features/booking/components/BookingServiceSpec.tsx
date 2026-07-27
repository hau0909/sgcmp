"use client";

import React, { useState } from "react";
import { Briefcase, Users, Calendar, Clock, FileText, MapPin, Pencil, AlertTriangle, X } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { BookingStatus } from "../types";

interface BookingServiceSpecProps {
  serviceName: string;
  guardsCount: number;
  startDate: string;
  endDate: string;
  address?: string;
  timeSlots?: string[];
  day_per_week?: string[];
  specialInstructions: string | string[] | null;
  status?: BookingStatus;
  isCustomer?: boolean;
  onEdit?: () => void;
}

const DAYS_OF_WEEK = [
  { value: "Monday", label: "T2" },
  { value: "Tuesday", label: "T3" },
  { value: "Wednesday", label: "T4" },
  { value: "Thursday", label: "T5" },
  { value: "Friday", label: "T6" },
  { value: "Saturday", label: "T7" },
  { value: "Sunday", label: "CN" },
];

export function BookingServiceSpec({
  serviceName,
  guardsCount,
  startDate,
  endDate,
  address,
  timeSlots = [],
  day_per_week = [],
  specialInstructions,
  status,
  isCustomer = false,
  onEdit,
}: BookingServiceSpecProps) {
  const { dict } = useTranslation();
  const [showQuotedWarningModal, setShowQuotedWarningModal] = useState(false);
  
  const isEditableStatus = status === "pending" || status === "rejected";
  const isQuoted = status === "quoted";
  const canEdit = isCustomer && isEditableStatus;
  const isButtonEnabled = isCustomer && (isEditableStatus || isQuoted);

  const handleEditClick = () => {
    if (isQuoted) {
      setShowQuotedWarningModal(true);
      return;
    }
    if (canEdit && onEdit) {
      onEdit();
    }
  };

  // Format start and end date labels
  const durationText = React.useMemo(() => {
    try {
      const start = new Date(startDate).toLocaleDateString("vi-VN");
      const end = new Date(endDate).toLocaleDateString("vi-VN");
      return `${start} - ${end}`;
    } catch {
      return `${startDate} - ${endDate}`;
    }
  }, [startDate, endDate]);

  // Convert special instructions description text into lines if it is a string
  const instructionsList = React.useMemo(() => {
    if (!specialInstructions) return [];
    if (Array.isArray(specialInstructions)) return specialInstructions;

    return specialInstructions
      .split(/\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => line.replace(/^-\s*/, ""));
  }, [specialInstructions]);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.03)] duration-300 animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none"></div>

      <div className="flex items-center justify-between border-b border-outline-variant/30 pb-2 mb-4">
        <h3 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline">
          <Briefcase className="w-5 h-5 text-secondary" />
          <span>{dict.booking.detail.spec.service_requirements || "Yêu cầu dịch vụ"}</span>
        </h3>

        {isCustomer && (
          <button
            type="button"
            onClick={handleEditClick}
            disabled={!isButtonEnabled}
            title={
              canEdit
                ? dict.booking.detail.spec.edit_title || "Chỉnh sửa Yêu cầu dịch vụ"
                : isQuoted
                ? dict.booking.detail.spec.quoted_warning_tooltip || "Vui lòng từ chối báo giá trước khi chỉnh sửa yêu cầu"
                : dict.booking.detail.spec.cannot_edit || "Không thể chỉnh sửa ở trạng thái này"
            }
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
              isButtonEnabled
                ? "text-secondary hover:bg-secondary/10 cursor-pointer"
                : "text-outline-variant/40 cursor-not-allowed opacity-50"
            }`}
          >
            <Pencil className="w-4 h-4" />
            <span>{dict.booking.detail.spec.edit_btn || "Sửa"}</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Service Name */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.booking.detail.spec.service_type || "Loại dịch vụ"}
          </span>
          <span className="text-sm font-semibold text-on-surface text-primary">
            {serviceName}
          </span>
        </div>

        {/* Quantity of Guards */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.booking.detail.spec.quantity_guards || "Số lượng bảo vệ"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-outline-variant" />
            {guardsCount} {dict.booking.detail.spec.personnel || "nhân sự"}
          </span>
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.booking.detail.spec.implementation_duration || "Thời hạn thực hiện"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-outline-variant" />
            <span>{durationText}</span>
          </span>
        </div>

        {/* Implementation Location */}
        {address && (
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.booking.detail.info.implementation_location || "Địa chỉ triển khai"}
            </span>
            <span className="text-sm font-semibold text-on-surface flex items-start gap-1.5">
              <MapPin className="w-4 h-4 text-outline-variant mt-0.5 shrink-0" />
              <span>{address}</span>
            </span>
          </div>
        )}

        {/* Ngày làm việc trong tuần */}
        <div className="flex flex-col pt-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            {dict.booking.detail.spec.working_days || "Ngày làm việc trong tuần"}
          </span>
          <div className="flex gap-1.5 bg-surface-container-low/40 p-1.5 border border-outline-variant/60 rounded-xl max-w-sm">
            {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((dayValue) => {
              const isSelected = day_per_week.includes(dayValue);
              return (
                <div
                  key={dayValue}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg select-none transition-all ${
                    isSelected
                      ? "bg-secondary text-white shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant/40 border border-outline-variant/10"
                  }`}
                >
                  {dict.booking.form.days_short[dayValue as keyof typeof dict.booking.form.days_short]}
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung giờ thực hiện */}
        {timeSlots && timeSlots.length > 0 && (
          <div className="flex flex-col pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              {dict.booking.detail.spec.time_slots || "Khung giờ thực hiện"}
            </span>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface-container-low border border-outline-variant/60 rounded-md text-xs font-semibold text-secondary font-mono"
                >
                  <Clock className="w-3 h-3 text-outline-variant" />
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions / Notes */}
        {instructionsList.length > 0 && (
          <div className="flex flex-col pt-2 border-t border-outline-variant/30">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              {dict.booking.detail.spec.special_instructions || "Yêu cầu đặc biệt / Ghi chú"}
            </span>
            <div className="text-xs text-on-surface-variant bg-surface-container-low/50 border border-outline-variant/30 rounded-lg p-3 leading-relaxed flex gap-2">
              <FileText className="w-4 h-4 text-outline-variant mt-0.5 shrink-0" />
              <ul className="space-y-1 pl-1 list-none flex-1">
                {instructionsList.map((instruction, index) => (
                  <li key={index} className="flex items-start gap-1.5">
                    <span className="text-secondary select-none font-bold mt-0.5">•</span>
                    <span>{instruction}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Quoted Status Warning Modal (Compact) */}
      {showQuotedWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl max-w-xs w-full p-4 shadow-xl relative animate-in zoom-in-95 duration-150 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-2.5 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <h4 className="text-sm font-bold text-on-surface mb-1 font-headline">
              {dict.booking.detail.spec.quoted_warning_title || "Yêu cầu đã có báo giá"}
            </h4>

            <p className="text-xs text-on-surface-variant leading-relaxed mb-4">
              {dict.booking.detail.spec.quoted_warning_desc || "Vui lòng từ chối báo giá hiện tại trước khi chỉnh sửa thông tin yêu cầu."}
            </p>

            <button
              type="button"
              onClick={() => setShowQuotedWarningModal(false)}
              className="w-full py-1.5 px-4 bg-primary text-white rounded-lg font-bold text-xs shadow-xs hover:bg-primary/90 transition-all cursor-pointer"
            >
              {dict.booking.detail.spec.understand_btn || "Đã hiểu"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
