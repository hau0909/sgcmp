"use client";

import React from "react";
import { Building2, Clock3, MapPin, Building } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export type ShiftStatus = "assigned" | "completed" | "checkout" | "absent" | "late";

export type ShiftItem = {
  id: string;
  time: string;
  location: string;
  address: string;
  shift_name: string;
  company_name?: string;
  status: ShiftStatus;
  check_in_time?: string | null;
  is_replacement?: boolean;
  is_overtime?: boolean;
  overtime_minutes?: number;
};

type ShiftCardProps = {
  shift: ShiftItem;
};

const getStatusStyle = (status: ShiftStatus, isReplacement?: boolean, checkInTime?: string | null) => {
  if (isReplacement) return "bg-purple-100 text-purple-700";
  if (status === "assigned") return "bg-blue-100 text-blue-700";
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "checkout") return "bg-slate-100 text-slate-700";
  if (status === "late") {
    if (checkInTime) return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    return "bg-amber-100 text-amber-800 border border-amber-300";
  }
  return "bg-red-100 text-red-700";
};

export function ShiftCard({ shift }: ShiftCardProps) {
  const { dict, locale } = useTranslation();
  const card = dict.layout_guard.shift_card;
  const isEn = locale === "en";
  const isAbsent = shift.status === "absent" && !shift.is_replacement;

  const getStatusLabel = () => {
    if (shift.is_replacement) return card.status_replacement;
    if (shift.status === "assigned") return card.status_assigned;
    if (shift.status === "completed") return card.guard_status_on_duty || card.status_completed || "Đang trực";
    if (shift.status === "checkout") return card.guard_status_checkout || card.status_checkout || "Hoàn thành";
    if (shift.status === "late") {
      if (shift.check_in_time) {
        return (dict?.shift_detail_modal?.checked_in_late || (isEn ? "LATE CHECK-IN" : "ĐIỂM DANH TRỄ")).toUpperCase();
      }
      return (dict?.shift_detail_modal?.late_not_checked_in || (isEn ? "LATE - NOT CHECKED IN" : "ĐI TRỄ CHƯA ĐIỂM DANH")).toUpperCase();
    }
    return card.status_absent;
  };

  return (
    <div
      className={`rounded-lg border p-3 shadow-sm transition-all ${
        shift.is_overtime
          ? "border-amber-300 bg-amber-50 text-amber-950 hover:bg-amber-100/80"
          : "border-slate-200 bg-white"
      } ${isAbsent ? "opacity-70" : ""}`}
    >
      <div className="mb-3 flex items-center justify-start gap-1.5 flex-wrap">
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-[0.1em] ${getStatusStyle(
            shift.status,
            shift.is_replacement,
            shift.check_in_time,
          )}`}
        >
          {getStatusLabel()}
        </span>
        {shift.is_overtime && (
          <span className="rounded-full border border-amber-300 bg-amber-100/90 px-2 py-1 text-[9px] font-extrabold tracking-[0.1em] text-amber-800">
            {String(dict?.common?.overtime || "TĂNG CA").toUpperCase()}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className={`flex items-start gap-1.5 ${shift.is_overtime ? "text-amber-950" : "text-slate-700"}`}>
          <Clock3 className={`mt-0.5 h-4 w-4 shrink-0 ${shift.is_overtime ? "text-amber-700" : "text-[#0b4f9c]"}`} />
          <span className={`text-xs font-semibold shrink-0 ${shift.is_overtime ? "text-amber-900/80" : "text-slate-500"}`}>{card.label_time || "Thời gian:"}</span>
          <span className="text-xs font-bold leading-5">{shift.time}</span>
        </div>

        {shift.company_name && (
          <div className={`flex items-start gap-1.5 ${shift.is_overtime ? "text-amber-950" : "text-slate-700"}`}>
            <Building2 className={`mt-0.5 h-4 w-4 shrink-0 ${shift.is_overtime ? "text-amber-700" : "text-[#0b4f9c]"}`} />
            <span className={`text-xs font-semibold shrink-0 ${shift.is_overtime ? "text-amber-900/80" : "text-slate-500"}`}>{card.label_company || "Công ty:"}</span>
            <span className="text-xs font-bold leading-5">
              {shift.company_name}
            </span>
          </div>
        )}

        <div className={`flex items-start gap-1.5 ${shift.is_overtime ? "text-amber-950" : "text-slate-700"}`}>
          <Building className={`mt-0.5 h-4 w-4 shrink-0 ${shift.is_overtime ? "text-amber-700" : "text-[#0b4f9c]"}`} />
          <span className={`text-xs font-semibold shrink-0 ${shift.is_overtime ? "text-amber-900/80" : "text-slate-500"}`}>{card.label_shift || "Ca trực:"}</span>
          <span className="text-xs font-medium leading-5">
            {shift.shift_name}
          </span>
        </div>

        <div className={`flex items-start gap-1.5 ${shift.is_overtime ? "text-amber-950" : "text-slate-700"}`}>
          <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${shift.is_overtime ? "text-amber-700" : "text-[#0b4f9c]"}`} />
          <span className={`text-xs font-semibold shrink-0 ${shift.is_overtime ? "text-amber-900/80" : "text-slate-500"}`}>{card.label_location || "Vị trí:"}</span>
          <span className="text-xs font-medium leading-5">
            {shift.location}
          </span>
        </div>
      </div>
    </div>
  );
}
