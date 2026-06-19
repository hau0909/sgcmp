"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin, Clock3, CalendarDays, Building2 } from "lucide-react";
import { type ShiftItem } from "@/features/shift/components/ShiftCardGuard";
import { requestGetGuardShiftsByDay } from "@/features/shift/api/shift.api";
import type { GuardShiftItem } from "@/features/shift/type";

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

const formatGuardShiftDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
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

const mapGuardShiftToShiftItem = (shift: GuardShiftItem): ShiftItem => {
  return {
    id: shift.id,
    time: shift.time,
    location: shift.location,
    address: shift.address,
    status: shift.status,
  };
};

const ShiftDetailSkeleton = () => {
  return (
    <article className="w-full animate-pulse rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-5 w-24 rounded bg-slate-200" />
          <div className="h-3 w-44 rounded bg-slate-200" />
        </div>

        <div className="h-7 w-24 rounded-full bg-slate-200" />
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>

        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-200" />
          <div className="h-4 w-56 rounded bg-slate-200" />
        </div>

        <div className="flex items-start gap-2">
          <div className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-slate-200" />
          <div className="h-4 w-44 rounded bg-slate-200" />
        </div>
      </div>
    </article>
  );
};

export default function GuardShiftPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedDate = useMemo(() => {
    return parseDateKey(searchParams.get("date"));
  }, [searchParams]);

  const selectedDateKey = useMemo(() => {
    return formatGuardShiftDateKey(selectedDate);
  }, [selectedDate]);

  const [shifts, setShifts] = useState<ShiftItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchGuardShiftsByDay = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await requestGetGuardShiftsByDay({
          date: selectedDateKey,
        });

        setShifts(response.data.shifts.map(mapGuardShiftToShiftItem));
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Không thể lấy ca trực trong ngày.";

        setError(message);
        setShifts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGuardShiftsByDay();
  }, [selectedDateKey]);

  const handleOpenShiftDetail = (shiftId: string) => {
    router.push(`/guard-shift/${shiftId}?date=${selectedDateKey}`);
  };

  return (
    <div className="space-y-4">
      <section>
        <h1 className="text-2xl font-extrabold text-slate-950">
          Ca trực trong ngày
        </h1>

        <div className="mt-2 flex items-center gap-2 text-sm font-bold capitalize text-slate-600">
          <CalendarDays className="h-4 w-4 text-[#0754a6]" />
          <span>{formatDateTitle(selectedDate)}</span>
        </div>
      </section>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-center">
          <p className="text-sm font-bold text-red-600">{error}</p>
        </div>
      )}

      <section className="space-y-3">
        {loading ? (
          <>
            <ShiftDetailSkeleton />
            <ShiftDetailSkeleton />
          </>
        ) : shifts.length > 0 ? (
          shifts.map((shift) => {
            return (
              <article
                key={shift.id}
                onClick={() => handleOpenShiftDetail(shift.id)}
                className="w-full cursor-pointer rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all active:scale-[0.98]"
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
                    <span className="text-sm font-bold">{shift.address}</span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-700">
                    <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />
                    <span className="text-sm font-bold">{shift.location}</span>
                  </div>
                </div>
              </article>
            );
          })
        ) : !error ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center">
            <CalendarDays className="mx-auto mb-3 h-10 w-10 text-slate-300" />

            <p className="text-sm font-bold text-slate-500">
              Không có ca trực trong ngày này.
            </p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
