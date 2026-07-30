"use client";

import React from "react";
import {
  Briefcase,
  Calendar,
  Users,
  MapPin,
  Clock,
  FileText,
} from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export const DAYS_OF_WEEK_SHORT = [
  { value: "Monday", label: "T2" },
  { value: "Tuesday", label: "T3" },
  { value: "Wednesday", label: "T4" },
  { value: "Thursday", label: "T5" },
  { value: "Friday", label: "T6" },
  { value: "Saturday", label: "T7" },
  { value: "Sunday", label: "CN" },
];

export function isDayActive(activeDays: string[], dayValue: string, dayLabel: string): boolean {
  if (!activeDays || activeDays.length === 0) return false;
  const lowerActive = activeDays.map((d) => String(d).toLowerCase().trim());
  const valLower = dayValue.toLowerCase();
  const labelLower = dayLabel.toLowerCase();

  return lowerActive.some((a) => {
    if (a === valLower || a === labelLower) return true;
    if (valLower === "monday" && (a === "t2" || a === "2" || a.includes("thứ 2") || a.includes("thu 2"))) return true;
    if (valLower === "tuesday" && (a === "t3" || a === "3" || a.includes("thứ 3") || a.includes("thu 3"))) return true;
    if (valLower === "wednesday" && (a === "t4" || a === "4" || a.includes("thứ 4") || a.includes("thu 4"))) return true;
    if (valLower === "thursday" && (a === "t5" || a === "5" || a.includes("thứ 5") || a.includes("thu 5"))) return true;
    if (valLower === "friday" && (a === "t6" || a === "6" || a.includes("thứ 6") || a.includes("thu 6"))) return true;
    if (valLower === "saturday" && (a === "t7" || a === "7" || a.includes("thứ 7") || a.includes("thu 7"))) return true;
    if (valLower === "sunday" && (a === "cn" || a === "8" || a.includes("chủ nhật") || a.includes("chu nhat"))) return true;
    return false;
  });
}

interface ContractServiceInfoProps {
  serviceName: string;
  quantity: number;
  duration: string;
  location: string;
  timeSlots?: string[];
  workingDays?: string[];
  description?: string | null;
}

export function ContractServiceInfo({
  serviceName,
  quantity,
  duration,
  location,
  timeSlots = [],
  workingDays = [],
  description = null,
}: ContractServiceInfoProps) {
  const { dict } = useTranslation();

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden flex-1">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none"></div>

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Briefcase className="w-5 h-5 text-secondary" />
        <span>{dict.contract_detail?.info_service || "Thông tin dịch vụ"}</span>
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_service_name || "GÓI DỊCH VỤ"}
          </span>
          <span className="text-sm font-bold text-on-surface">
            {serviceName}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_service_guard || "SỐ LƯỢNG BẢO VỆ"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-outline-variant" />
            {quantity} {dict.contract_detail?.guards_count || "nhân sự"}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_service_duration || "THỜI HẠN THUÊ"}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-outline-variant" />
            <span>{duration}</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract_detail?.info_service_location || "ĐỊA ĐIỂM THỰC HIỆN NHIỆM VỤ"}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-outline-variant shrink-0" />
            <span>{location}</span>
          </span>
        </div>

        {/* Days of Week Badge Container (Matching Screenshot 1 & 3) */}
        <div className="flex flex-col pt-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            LỊCH LÀM VIỆC TRONG TUẦN
          </span>
          <div className="flex gap-1.5 bg-surface-container-low/40 p-1.5 border border-outline-variant/60 rounded-xl max-w-sm">
            {DAYS_OF_WEEK_SHORT.map((dayObj) => {
              const active = isDayActive(workingDays, dayObj.value, dayObj.label);
              return (
                <div
                  key={dayObj.value}
                  className={`flex-1 text-center py-1.5 text-xs font-bold rounded-lg select-none transition-all ${
                    active
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant/30 font-medium"
                  }`}
                >
                  {dayObj.label}
                </div>
              );
            })}
          </div>
        </div>

        {timeSlots && timeSlots.length > 0 && (
          <div className="flex flex-col pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              {dict.contract_detail?.info_service_timeslots || "KHUNG GIỜ YÊU CẦU BẢO VỆ"}
            </span>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low border border-outline-variant/60 rounded-md text-xs font-semibold text-secondary font-mono"
                >
                  <Clock className="w-3 h-3 text-outline-variant" />
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}

        {description && (
          <div className="flex flex-col pt-2 border-t border-outline-variant/30">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              {dict.contract_detail?.info_service_notes || "LƯU Ý / MÔ TẢ YÊU CẦU CHI TIẾT"}
            </span>
            <div className="text-xs text-on-surface-variant bg-surface-container-low/50 border border-outline-variant/30 rounded-lg p-3 leading-relaxed flex gap-2">
              <FileText className="w-4 h-4 text-outline-variant mt-0.5 shrink-0" />
              <span>{description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
