"use client";

import React from "react";
import { Building2, Clock3, MapPin } from "lucide-react";

export type ShiftStatus = "assigned" | "completed" | "absent" | "late";

export type ShiftItem = {
  id: string;
  time: string;
  location: string;
  address: string;
  shift_name: string;
  status: ShiftStatus;
  is_replacement?: boolean;
};

type ShiftCardProps = {
  shift: ShiftItem;
};

const getStatusLabel = (status: ShiftStatus, isReplacement?: boolean) => {
  if (isReplacement) {
    return "CA THAY THẾ";
  }

  if (status === "assigned") {
    return "PHÂN CÔNG";
  }

  if (status === "completed") {
    return "ĐANG TRỰC";
  }

  if (status === "late") {
    return "ĐI TRỄ";
  }

  return "VẮNG MẶT";
};

const getStatusStyle = (status: ShiftStatus, isReplacement?: boolean) => {
  if (isReplacement) {
    return "bg-purple-100 text-purple-700";
  }

  if (status === "assigned") {
    return "bg-blue-100 text-blue-700";
  }

  if (status === "completed") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "late") {
    return "bg-amber-100 text-amber-700";
  }

  return "bg-red-100 text-red-700";
};

export function ShiftCard({ shift }: ShiftCardProps) {
  const isAbsent = shift.status === "absent" && !shift.is_replacement;

  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white p-3 shadow-sm ${
        isAbsent ? "opacity-70" : ""
      }`}
    >
      <div className="mb-3 flex justify-start">
        <span
          className={`rounded-full px-2.5 py-1 text-[9px] font-extrabold tracking-[0.1em] ${getStatusStyle(
            shift.status,
            shift.is_replacement,
          )}`}
        >
          {getStatusLabel(shift.status, shift.is_replacement)}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-start gap-2 text-slate-700">
          <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#0b4f9c]" />
          <span className="text-xs font-bold leading-5">{shift.time}</span>
        </div>

        <div className="flex items-start gap-2 text-slate-700">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0b4f9c]" />
          <span className="text-xs font-medium leading-5">
            {shift.shift_name}
          </span>
        </div>

        <div className="flex items-start gap-2 text-slate-700">
          <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0b4f9c]" />
          <span className="text-xs font-medium leading-5">
            {shift.location}
          </span>
        </div>
      </div>
    </div>
  );
}
