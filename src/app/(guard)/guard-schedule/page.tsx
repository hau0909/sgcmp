"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  ShiftCard,
  type ShiftItem,
} from "@/features/guards/components/ShiftCard";
import {
  createGuardMockShifts,
  formatGuardShiftDateKey,
} from "@/features/guards/data/shift-mock";

type DaySchedule = {
  date: Date;
  shifts: ShiftItem[];
};

const weekDayLabels = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

const addDays = (date: Date, days: number) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const startOfWeekMonday = (date: Date) => {
  const result = new Date(date);
  const day = result.getDay();
  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);
  result.setHours(0, 0, 0, 0);

  return result;
};

const formatMonthYear = (weekDays: Date[]) => {
  const firstDay = weekDays[0];
  const lastDay = weekDays[6];

  const firstMonth = firstDay.toLocaleDateString("vi-VN", {
    month: "long",
  });

  const lastMonth = lastDay.toLocaleDateString("vi-VN", {
    month: "long",
  });

  const firstYear = firstDay.getFullYear();
  const lastYear = lastDay.getFullYear();

  if (firstMonth === lastMonth && firstYear === lastYear) {
    return `${firstMonth} ${firstYear}`;
  }

  if (firstYear === lastYear) {
    return `${firstMonth} - ${lastMonth} ${firstYear}`;
  }

  return `${firstMonth} ${firstYear} - ${lastMonth} ${lastYear}`;
};

const isSameDate = (first: Date, second: Date) => {
  return (
    first.getDate() === second.getDate() &&
    first.getMonth() === second.getMonth() &&
    first.getFullYear() === second.getFullYear()
  );
};

export default function GuardSchedulePage() {
  const today = useMemo(() => new Date(), []);
  const [weekStart, setWeekStart] = useState(() => startOfWeekMonday(today));
  const [selectedDate, setSelectedDate] = useState(today);
  const router = useRouter();

  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  }, [weekStart]);

  const mockShifts = useMemo(() => {
    return createGuardMockShifts(weekStart);
  }, [weekStart]);

  const weekSchedules: DaySchedule[] = useMemo(() => {
    return weekDays.map((date) => {
      const dateKey = formatGuardShiftDateKey(date);

      return {
        date,
        shifts: mockShifts[dateKey] ?? [],
      };
    });
  }, [weekDays, mockShifts]);

  const formatDayMonth = (date: Date) => {
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const formatWeekdayText = (date: Date) => {
    const day = date.getDay();

    if (day === 0) {
      return "Chủ nhật";
    }

    return `Thứ ${day + 1}`;
  };

  const handleOpenCheckinByDate = (date: Date) => {
    const dateKey = formatGuardShiftDateKey(date);

    setSelectedDate(date);
    router.push(`/checkin-shift?date=${dateKey}`);
  };

  const handlePreviousWeek = () => {
    const newWeekStart = addDays(weekStart, -7);

    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  const handleCurrentWeek = () => {
    const currentWeekStart = startOfWeekMonday(today);

    setWeekStart(currentWeekStart);
    setSelectedDate(today);
  };

  const handleNextWeek = () => {
    const newWeekStart = addDays(weekStart, 7);

    setWeekStart(newWeekStart);
    setSelectedDate(newWeekStart);
  };

  return (
    <div className="-mx-4 -my-4 min-h-full bg-[#f7f8fb]">
      {/* Page Header */}
      <section className="px-4 pb-5 pt-8">
        <h1 className="text-4xl font-black leading-tight text-slate-950">
          Lịch trực
        </h1>
        <p className="mt-3 text-lg font-bold text-slate-600">
          Xem lịch ca trực theo tuần.
        </p>
      </section>

      {/* Calendar Full Screen */}
      <section className="w-full bg-white">
        {/* Calendar Top */}
        <div className="flex items-center justify-between border-y border-slate-200 px-6 py-5">
          <button
            type="button"
            onClick={handlePreviousWeek}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all hover:bg-blue-100 hover:text-[#0b4f9c]"
          >
            <ChevronLeft size={30} />
          </button>

          <button
            type="button"
            onClick={handleCurrentWeek}
            className="rounded-xl px-4 py-2 text-center transition-all hover:bg-blue-50"
          >
            <h2 className="text-lg font-black capitalize text-[#0b4f9c]">
              {formatMonthYear(weekDays)}
            </h2>
          </button>

          <button
            type="button"
            onClick={handleNextWeek}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 transition-all hover:bg-blue-100 hover:text-[#0b4f9c]"
          >
            <ChevronRight size={30} />
          </button>
        </div>

        {/* 7 Days Bar */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-white px-3 py-4">
          {weekDays.map((date) => {
            const dateKey = formatGuardShiftDateKey(date);
            const isToday = isSameDate(date, today);
            const hasShift = !!mockShifts[dateKey]?.length;

            return (
              <button
                key={dateKey}
                type="button"
                onClick={() => handleOpenCheckinByDate(date)}
                className={`relative mx-1 flex min-h-[74px] flex-col items-center justify-center rounded-2xl transition-all ${
                  isToday
                    ? "bg-blue-200 text-[#0b4f9c]"
                    : "bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-[#0b4f9c]"
                }`}
              >
                <span
                  className={`text-sm ${
                    isToday
                      ? "font-black text-[#0b4f9c]"
                      : "font-bold text-slate-500"
                  }`}
                >
                  {weekDayLabels[date.getDay()]}
                </span>

                <span
                  className={`mt-1 text-sm ${
                    isToday
                      ? "font-black text-[#0b4f9c]"
                      : "font-extrabold text-slate-700"
                  }`}
                >
                  {date.getDate()}
                </span>

                {hasShift && (
                  <span className="absolute bottom-2 h-2 w-2 rounded-full bg-[#0b4f9c]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Vertical Calendar List */}
        <div className="divide-y divide-slate-200">
          {weekSchedules.map((day) => {
            const dateKey = formatGuardShiftDateKey(day.date);
            const isToday = isSameDate(day.date, today);
            const active = isSameDate(day.date, selectedDate);
            const hasShift = day.shifts.length > 0;

            return (
              <div
                key={dateKey}
                className={`grid w-full grid-cols-[92px_1fr] transition-all ${
                  active ? "bg-blue-50/70" : "bg-white"
                }`}
              >
                {/* Date Cell */}
                <button
                  type="button"
                  onClick={() => handleOpenCheckinByDate(day.date)}
                  className={`flex min-h-[160px] flex-col items-center justify-center border-r border-slate-200 px-2 py-6 ${
                    isToday ? "bg-blue-50" : "bg-slate-50"
                  }`}
                >
                  <span
                    className={`text-2xl ${
                      isToday
                        ? "font-black text-[#0b4f9c]"
                        : "font-black text-slate-950"
                    }`}
                  >
                    {formatDayMonth(day.date)}
                  </span>

                  <span
                    className={`mt-2 text-sm ${
                      isToday
                        ? "font-black text-[#0b4f9c]"
                        : "font-bold text-slate-500"
                    }`}
                  >
                    {formatWeekdayText(day.date)}
                  </span>
                </button>

                {/* Shift Cell */}
                <div
                  className="min-h-[160px] cursor-pointer p-4"
                  onClick={() => handleOpenCheckinByDate(day.date)}
                >
                  {hasShift ? (
                    <div className="space-y-4">
                      {day.shifts.map((shift) => (
                        <ShiftCard key={shift.id} shift={shift} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-full min-h-[128px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
                      <p className="text-sm font-bold text-slate-400">
                        Trống lịch
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
