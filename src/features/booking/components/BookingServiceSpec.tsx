"use client";

import React from "react";
import { Briefcase, Users, Calendar, Clock, FileText } from "lucide-react";

interface BookingServiceSpecProps {
  serviceName: string;
  guardsCount: number;
  startDate: string;
  endDate: string;
  timeSlots?: string[];
  day_per_week?: string[];
  specialInstructions: string | string[] | null;
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
  timeSlots = [],
  day_per_week = [],
  specialInstructions,
}: BookingServiceSpecProps) {
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

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Briefcase className="w-5 h-5 text-secondary" />
        <span>Yêu cầu dịch vụ</span>
      </h3>

      <div className="space-y-4">
        {/* Service Name */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Loại dịch vụ
          </span>
          <span className="text-sm font-semibold text-on-surface text-primary">
            {serviceName}
          </span>
        </div>

        {/* Quantity of Guards */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Số lượng bảo vệ
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-outline-variant" />
            {guardsCount} nhân sự
          </span>
        </div>

        {/* Duration */}
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Thời hạn thực hiện
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-outline-variant" />
            <span>{durationText}</span>
          </span>
        </div>

        {/* Ngày làm việc trong tuần */}
        <div className="flex flex-col pt-1">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
            Ngày làm việc trong tuần
          </span>
          <div className="flex gap-1.5 bg-surface-container-low/40 p-1.5 border border-outline-variant/60 rounded-xl max-w-sm">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = day_per_week.includes(day.value);
              return (
                <div
                  key={day.value}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg select-none transition-all ${
                    isSelected
                      ? "bg-secondary text-white shadow-xs"
                      : "bg-surface-container-low text-on-surface-variant/40 border border-outline-variant/10"
                  }`}
                >
                  {day.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Khung giờ thực hiện */}
        {timeSlots && timeSlots.length > 0 && (
          <div className="flex flex-col pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              Khung giờ thực hiện
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
              Yêu cầu đặc biệt / Ghi chú
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
    </div>
  );
}
