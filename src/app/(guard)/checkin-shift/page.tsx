"use client";

import React, { useState } from "react";
import {
  MapPin,
  Clock3,
  Crosshair,
  MoreHorizontal,
  Camera,
  UserCheck,
  Info,
  CheckCircle2,
  Loader2,
} from "lucide-react";

export default function GuardShiftPage() {
  const [gpsVerified, setGpsVerified] = useState(false);
  const [idVerified, setIdVerified] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const canCheckIn = gpsVerified && idVerified;

  const handleGetLocation = () => {
    setGpsLoading(true);

    setTimeout(() => {
      setGpsVerified(true);
      setGpsLoading(false);
    }, 800);
  };

  const handleVerifyId = () => {
    setIdVerified(true);
  };

  return (
    <div className="space-y-4">
      {/* Upcoming Shift Card */}
      <section className="rounded-md border border-slate-300 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 className="text-[22px] font-extrabold text-slate-800">
            Ca trực sắp tới
          </h2>

          <span className="rounded-sm bg-[#0754a6] px-3 py-1.5 text-xs font-extrabold tracking-wide text-white">
            CHỜ DUYỆT
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <MapPin className="h-4 w-4" />
              <span>Vị trí</span>
            </div>
            <p className="text-base font-extrabold text-slate-800">
              Tech Campus HQ
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1.5 text-sm font-bold text-slate-500">
              <Clock3 className="h-4 w-4" />
              <span>Thời lượng</span>
            </div>
            <p className="text-base font-extrabold text-slate-800">
              08:00 - 16:00 (8h)
            </p>
          </div>
        </div>
      </section>

      {/* GPS Verification */}
      <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="flex h-12 items-center justify-between border-b border-slate-300 bg-[#f8f9fc] px-4">
          <div className="flex items-center gap-2">
            {gpsVerified ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Crosshair className="h-5 w-5 text-[#0754a6]" />
            )}

            <span className="text-sm font-extrabold tracking-wide text-slate-800">
              Xác thực GPS
            </span>
          </div>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-500 text-red-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <div className="relative h-[365px] overflow-hidden bg-slate-400">
          {/* Fake map background */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#d9d9d9_0%,#9d9d9d_35%,#888_70%)]" />

          <div className="absolute inset-0 bg-slate-500/35 backdrop-blur-[1.5px]" />

          <div className="absolute inset-0 opacity-20">
            <div className="absolute left-[-40px] top-[70px] h-[1px] w-[520px] rotate-12 bg-white" />
            <div className="absolute left-[-30px] top-[180px] h-[1px] w-[520px] -rotate-12 bg-white" />
            <div className="absolute left-[60px] top-[-20px] h-[520px] w-[1px] rotate-12 bg-white" />
            <div className="absolute left-[230px] top-[-20px] h-[520px] w-[1px] -rotate-12 bg-white" />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              onClick={handleGetLocation}
              disabled={gpsLoading || gpsVerified}
              className={`flex items-center gap-2 rounded-md px-5 py-3 text-sm font-extrabold text-white shadow-md transition-all ${
                gpsVerified ? "bg-green-600" : "bg-[#0754a6] hover:bg-[#06498f]"
              }`}
            >
              {gpsLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Đang lấy...
                </>
              ) : gpsVerified ? (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Đã xác thực
                </>
              ) : (
                <>
                  <Crosshair className="h-5 w-5" />
                  Lấy vị trí
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* ID Verification */}
      <section className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
        <div className="flex h-12 items-center justify-between border-b border-slate-300 bg-[#f8f9fc] px-4">
          <div className="flex items-center gap-2">
            {idVerified ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <UserCheck className="h-5 w-5 text-[#0754a6]" />
            )}

            <span className="text-sm font-extrabold tracking-wide text-slate-800">
              Xác thực ID
            </span>
          </div>

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-red-500 text-red-500"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleVerifyId}
          className={`flex h-[92px] w-full items-center justify-center transition-all ${
            idVerified
              ? "bg-green-50 text-green-600"
              : "bg-[#24282b] text-slate-400 hover:bg-[#1f2326]"
          }`}
        >
          {idVerified ? (
            <div className="flex items-center gap-2 font-extrabold">
              <CheckCircle2 className="h-9 w-9" />
              <span>Đã xác thực ID</span>
            </div>
          ) : (
            <Camera className="h-11 w-11" />
          )}
        </button>
      </section>

      {/* Check In Button */}
      <section className="space-y-3">
        <button
          type="button"
          disabled={!canCheckIn}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-lg text-xl font-extrabold tracking-wide transition-all ${
            canCheckIn
              ? "bg-[#0754a6] text-white hover:bg-[#06498f]"
              : "bg-slate-200 text-slate-400"
          }`}
        >
          <UserCheck className="h-6 w-6" />
          ĐIỂM DANH
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-500">
          <Info className="h-4 w-4" />
          <span>Hoàn tất các bước xác thực để tiếp tục</span>
        </div>
      </section>
    </div>
  );
}
