"use client";

import React from "react";
import {
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

type GuardShiftCheckinPopupProps = {
  open: boolean;
  onClose: () => void;
};

const guardOnDutyList = [
  {
    id: "BV001",
    name: "Nguyễn Văn A",
    phone: "0944408532",
    status: "Hoàn thành",
  },
  {
    id: "BV002",
    name: "Thanh Lam",
    phone: "0368543865",
    status: "Hoàn thành",
  },
  {
    id: "BV003",
    name: "Trần Minh Khang",
    phone: "0909123456",
    status: "Hoàn thành",
  },
];

export function GuardShiftCheckinPopup({
  open,
  onClose,
}: GuardShiftCheckinPopupProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45">
      <div className="flex h-[92vh] w-full max-w-[430px] flex-col overflow-hidden rounded-t-[28px] bg-[#f7f8fb] shadow-2xl">
        {/* Popup Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-all active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-[#0754a6]" />
            <h2 className="text-base font-black text-[#0754a6]">
              Chi tiết ca trực
            </h2>
          </div>

          <div className="h-10 w-10" />
        </div>

        {/* Scroll Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-8 pt-3">
          {/* Shift Summary */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Ca trực sắp tới
                </h3>

                <p className="mt-1 text-xs font-bold text-slate-500">
                  Thông tin chi tiết ca trực được phân công
                </p>
              </div>

              <span className="rounded bg-[#0754a6] px-2.5 py-1 text-[10px] font-black text-white">
                PHÂN CÔNG
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>Vị trí</span>
                </div>

                <p className="text-sm font-black text-slate-900">
                  Tòa nhà Alpha
                </p>
              </div>

              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500">
                  <Clock3 className="h-3.5 w-3.5" />
                  <span>Thời lượng</span>
                </div>

                <p className="text-sm font-black text-slate-900">
                  08:00 - 16:00
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-3">
              <div className="flex items-start gap-2">
                <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />

                <div>
                  <p className="text-xs font-bold text-slate-500">Địa chỉ</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    Tòa nhà Alpha, Cần Thơ
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Detail Info */}
          <section className="mt-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-4 text-base font-black text-slate-900">
              Thông tin ca trực
            </h3>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
                  <CalendarDays className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">Ngày trực</p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    Thứ 4, 17/06/2026
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
                  <Clock3 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">Khung giờ</p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    08:00 - 16:00
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
                  <MapPin className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">
                    Khu vực trực
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    Sảnh chính - Tòa nhà Alpha
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
                  <UserRound className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-500">
                    Người phân công
                  </p>

                  <p className="mt-1 text-sm font-black text-slate-900">
                    Điều phối viên SGCMP
                  </p>
                </div>
              </div>
            </div>

            {/* Guard List */}
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">
                  Danh sách bảo vệ trực
                </h4>

                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#0754a6]">
                  {guardOnDutyList.length} bảo vệ
                </span>
              </div>

              <div className="space-y-2">
                {guardOnDutyList.map((guard) => (
                  <div
                    key={guard.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0754a6] text-sm font-black text-white">
                        {guard.name.charAt(0)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {guard.name}
                        </p>

                        <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                          {guard.id} • {guard.phone}
                        </p>
                      </div>
                    </div>

                    <span className="shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-700">
                      {guard.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom Safe Space */}
          <div className="h-6" />
        </div>
      </div>
    </div>
  );
}
