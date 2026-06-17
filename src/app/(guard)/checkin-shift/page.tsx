"use client";

import React, { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { MapPin, Clock3, CalendarDays, Building2 } from "lucide-react";
import type { ShiftItem } from "@/features/guards/components/ShiftCard";
import {
  createGuardMockShifts,
  formatGuardShiftDateKey,
} from "@/features/guards/data/shift-mock";

const startOfWeekMonday = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

const parseDateKey = (dateKey: string | null) => {
  if (!dateKey) {
    return new Date();
  }

  const parsedDate = new Date(`${dateKey}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return new Date();
  }

  return parsedDate;
};

const formatDateTitle = (date: Date) => {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusLabel = (status: ShiftItem["status"]) => {
  if (status === "assigned") {
    return "PHÂN CÔNG";
  }

  if (status === "completed") {
    return "HOÀN THÀNH";
  }

  return "VẮNG MẶT";
};

const getStatusStyle = (status: ShiftItem["status"]) => {
  if (status === "assigned") {
    return "bg-[#0754a6] text-white";
  }

  if (status === "completed") {
    return "bg-green-600 text-white";
  }

  return "bg-red-600 text-white";
};

export default function GuardShiftPage() {
  const searchParams = useSearchParams();

  const selectedDate = useMemo(() => {
    return parseDateKey(searchParams.get("date"));
  }, [searchParams]);

  const weekStart = useMemo(() => {
    return startOfWeekMonday(selectedDate);
  }, [selectedDate]);

  const shifts = useMemo(() => {
    const dateKey = formatGuardShiftDateKey(selectedDate);
    const mockShifts = createGuardMockShifts(weekStart);

    return mockShifts[dateKey] ?? [];
  }, [selectedDate, weekStart]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Ca trực trong ngày
        </h1>

        <div className="mt-2 flex items-center gap-2 text-sm font-bold capitalize text-slate-600">
          <CalendarDays className="h-4 w-4 text-[#0754a6]" />
          <span>{formatDateTitle(selectedDate)}</span>
        </div>
      </section>

      {/* Shift List */}
      <section className="space-y-3">
        {shifts.length > 0 ? (
          shifts.map((shift) => {
            return (
              <article
                key={shift.id}
                className="w-full rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-800">
                      Ca trực
                    </h2>

                    <p className="mt-1 text-xs font-bold text-slate-500">
                      Thông tin ca trực được phân công
                    </p>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1.5 text-[10px] font-extrabold ${getStatusStyle(
                      shift.status,
                    )}`}
                  >
                    {getStatusLabel(shift.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-slate-700">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />
                    <span className="text-sm font-extrabold">{shift.time}</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-700">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />
                    <span className="text-sm font-bold">{shift.location}</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-700">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />
                    <span className="text-sm font-bold">{shift.company}</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            <p className="text-sm font-bold text-slate-500">
              Không có ca trực trong ngày này.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
