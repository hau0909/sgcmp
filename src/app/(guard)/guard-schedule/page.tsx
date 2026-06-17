"use client";

import React from "react";
import { Clock3, MapPin, Building2, ChevronRight } from "lucide-react";

type ShiftStatus = "confirmed" | "pending" | "backup";

type ScheduleItem = {
  id: string;
  dateLabel: string;
  time: string;
  location: string;
  company: string;
  status: ShiftStatus;
};

const schedules: ScheduleItem[] = [
  {
    id: "1",
    dateLabel: "Thứ 2, 16 Th10",
    time: "08:00 - 16:00 (8h)",
    location: "Trung tâm Thương mại Sector B",
    company: "Quản lý Bất động sản Toàn Cầu",
    status: "confirmed",
  },
  {
    id: "2",
    dateLabel: "Thứ 3, 17 Th10",
    time: "16:00 - 00:00 (8h)",
    location: "Khu Công nghiệp phía Bắc",
    company: "Stark Logistics",
    status: "pending",
  },
  {
    id: "3",
    dateLabel: "Thứ 5, 19 Th10",
    time: "08:00 - 16:00 (8h)",
    location: "City Hall Perimeter",
    company: "Municipal Operations",
    status: "backup",
  },
];

const getStatusLabel = (status: ShiftStatus) => {
  if (status === "confirmed") return "ĐÃ XÁC NHẬN";
  if (status === "pending") return "CHỜ DUYỆT";
  return "DỰ PHÒNG";
};

const getStatusStyle = (status: ShiftStatus) => {
  if (status === "confirmed") {
    return "bg-[#2f62b3] text-white";
  }

  if (status === "pending") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-slate-100 text-slate-500";
};

export default function GuardSchedulePage() {
  return (
    <div className="space-y-4">
      {/* Header */}
      <section>
        <h1 className="text-2xl font-extrabold leading-tight text-slate-950">
          Lịch trực sắp tới
        </h1>
        <p className="mt-1 text-base font-medium text-slate-600">
          Lịch trình của bạn trong 7 ngày tới.
        </p>
      </section>

      {/* Schedule Cards */}
      <section className="space-y-4">
        {schedules.map((item) => {
          const isBackup = item.status === "backup";

          return (
            <article
              key={item.id}
              className={`overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm ${
                isBackup ? "opacity-65" : ""
              }`}
            >
              <div className="p-4">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <h2 className="text-lg font-extrabold text-slate-950">
                    {item.dateLabel}
                  </h2>

                  <span
                    className={`rounded-full px-3 py-1 text-[11px] font-extrabold tracking-[0.12em] ${getStatusStyle(
                      item.status,
                    )}`}
                  >
                    {getStatusLabel(item.status)}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Clock3 className="h-5 w-5 shrink-0 text-[#0b4f9c]" />
                    <span className="text-base font-medium">{item.time}</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin className="h-5 w-5 shrink-0 text-[#0b4f9c]" />
                    <span className="text-base font-medium">
                      {item.location}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <Building2 className="h-5 w-5 shrink-0 text-[#0b4f9c]" />
                    <span className="text-base font-medium">
                      {item.company}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-3">
                <button
                  type="button"
                  className="mx-auto flex items-center gap-2 text-sm font-extrabold tracking-[0.15em] text-[#0b4f9c] hover:text-[#063f7e]"
                >
                  Xem chi tiết
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
