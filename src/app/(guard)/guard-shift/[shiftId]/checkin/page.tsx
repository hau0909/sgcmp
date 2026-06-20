"use client";

import React, { type ChangeEvent, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  IdCard,
  LocateFixed,
  MapPin,
  MapPinned,
  MoreHorizontal,
  UserCheck,
} from "lucide-react";

type GpsStatus = "idle" | "loading" | "success" | "error";

const getDurationFromTimeRange = (timeRange: string) => {
  const [start, end] = timeRange.split(" - ");

  if (!start || !end) {
    return timeRange;
  }

  const [startHour, startMinute] = start.split(":").map(Number);
  const [endHour, endMinute] = end.split(":").map(Number);

  if (
    Number.isNaN(startHour) ||
    Number.isNaN(startMinute) ||
    Number.isNaN(endHour) ||
    Number.isNaN(endMinute)
  ) {
    return timeRange;
  }

  const startTotal = startHour * 60 + startMinute;
  const endTotal = endHour * 60 + endMinute;
  const diffMinutes = endTotal - startTotal;

  if (diffMinutes <= 0) {
    return timeRange;
  }

  const hours = diffMinutes / 60;

  return `${timeRange} (${Number.isInteger(hours) ? hours : hours.toFixed(1)}h)`;
};

export default function GuardShiftCheckinPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Array.isArray(params.shiftId)
    ? params.shiftId[0]
    : params.shiftId;

  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");
  const [gpsMessage, setGpsMessage] = useState("");
  const [currentPosition, setCurrentPosition] = useState("");

  const [idVerified, setIdVerified] = useState(false);
  const [idImageName, setIdImageName] = useState("");
  const [idImagePreview, setIdImagePreview] = useState("");

  // Mock UI data - thay bằng data thật sau nếu cần
  const shiftLocation = "Tech Campus HQ";
  const shiftTime = "08:00 - 16:00";

  const shiftDuration = useMemo(() => {
    return getDurationFromTimeRange(shiftTime);
  }, [shiftTime]);

  const gpsVerified = gpsStatus === "success";
  const canCheckin = gpsVerified && idVerified;

  useEffect(() => {
    return () => {
      if (idImagePreview) {
        URL.revokeObjectURL(idImagePreview);
      }
    };
  }, [idImagePreview]);

  const handleBack = () => {
    router.back();
  };

  const handleGetLocation = () => {
    setGpsStatus("loading");
    setGpsMessage("");
    setCurrentPosition("");

    if (!navigator.geolocation) {
      setGpsStatus("error");
      setGpsMessage("Trình duyệt không hỗ trợ lấy vị trí GPS.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude.toFixed(5);
        const longitude = position.coords.longitude.toFixed(5);

        setGpsStatus("success");
        setCurrentPosition(`${latitude}, ${longitude}`);
        setGpsMessage("Đã lấy vị trí thành công.");
      },
      () => {
        setGpsStatus("error");
        setGpsMessage("Không thể lấy vị trí. Vui lòng bật GPS và thử lại.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handleIdImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (idImagePreview) {
      URL.revokeObjectURL(idImagePreview);
    }

    const previewUrl = URL.createObjectURL(file);

    setIdVerified(true);
    setIdImageName(file.name);
    setIdImagePreview(previewUrl);
  };

  const handleCheckin = () => {
    if (!canCheckin) {
      return;
    }

    alert(`Điểm danh thành công.${shiftId ? ` Mã ca: ${shiftId}` : ""}`);
  };

  return (
    <div className="mx-auto w-full max-w-[430px] bg-[#f3f3f5]">
      <main className="space-y-3 px-3 pb-3 pt-3">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition-all active:scale-[0.98]"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
          </button>
        </div>

        {/* Shift Summary */}
        <section className="rounded-2xl border border-slate-300 bg-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h1 className="text-[18px] font-extrabold text-slate-800">
              Ca trực sắp tới
            </h1>

            <span className="rounded-sm bg-[#0754a6] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide text-white">
              Chờ duyệt
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold">Vị trí</span>
              </div>

              <p className="text-[15px] font-extrabold text-slate-800">
                {shiftLocation}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs font-bold">Thời lượng</span>
              </div>

              <p className="text-[15px] font-extrabold text-slate-800">
                {shiftDuration}
              </p>
            </div>
          </div>
        </section>

        {/* GPS */}
        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300 bg-[#f8f8fa] px-3 py-3">
            <div className="flex items-center gap-2">
              <LocateFixed className="h-5 w-5 text-[#0754a6]" />

              <h2 className="text-sm font-extrabold text-slate-800">
                Xác thực GPS
              </h2>
            </div>

            {gpsVerified ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                <MoreHorizontal className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="relative h-[280px] overflow-hidden bg-[#b8b8bb]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c7c7ca] via-[#b7b7bb] to-[#a9aaae]" />
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute left-1/2 top-1/2 h-24 w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/15 blur-sm" />
            <div className="absolute inset-0 backdrop-blur-[1px]" />

            <div className="relative flex h-full items-center justify-center">
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gpsStatus === "loading"}
                className="flex items-center gap-2 rounded bg-[#0754a6] px-5 py-3 text-sm font-extrabold text-white shadow-md transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <MapPinned className="h-5 w-5" />
                {gpsStatus === "loading" ? "Đang lấy..." : "Lấy vị trí"}
              </button>
            </div>

            {gpsMessage && (
              <div
                className={`absolute bottom-3 left-3 right-3 rounded px-3 py-2 text-center text-[11px] font-bold ${
                  gpsVerified
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                <p>{gpsMessage}</p>

                {currentPosition && (
                  <p className="mt-1 truncate opacity-80">{currentPosition}</p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* ID */}
        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300 bg-[#f8f8fa] px-3 py-3">
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-[#0754a6]" />

              <h2 className="text-sm font-extrabold text-slate-800">
                Xác thực ID
              </h2>
            </div>

            {idVerified ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 text-red-500">
                <MoreHorizontal className="h-5 w-5" />
              </div>
            )}
          </div>

          <div className="relative h-[250px] overflow-hidden bg-[#25292e]">
            {idImagePreview ? (
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${idImagePreview})` }}
              />
            ) : null}

            <div className="absolute inset-0 bg-black/20" />

            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
              {!idImagePreview && (
                <>
                  <Camera className="h-20 w-20 text-white/45" />

                  <p className="mt-3 text-sm font-bold text-white/55">
                    Chụp ảnh ID để xác thực
                  </p>
                </>
              )}

              <input
                id="guard-id-photo"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleIdImageChange}
                className="hidden"
              />

              <label
                htmlFor="guard-id-photo"
                className="mt-6 cursor-pointer rounded bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm transition-all active:scale-[0.98]"
              >
                {idVerified ? "Chụp lại ID" : "Chụp ảnh ID"}
              </label>
            </div>

            {idImageName && (
              <div className="absolute bottom-3 left-3 right-3 rounded bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-700">
                <p>Đã xác thực ảnh ID</p>
                <p className="mt-1 truncate opacity-80">{idImageName}</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bottom-0 z-20 rounded-2xl border-t border-slate-200 bg-[#f3f3f5] px-3 pb-4 pt-3">
        <button
          type="button"
          onClick={handleCheckin}
          disabled={!canCheckin}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-4 text-[15px] font-extrabold uppercase transition-all active:scale-[0.98] ${
            canCheckin
              ? "bg-[#0754a6] text-white shadow-md"
              : "cursor-not-allowed bg-[#e5e5e7] text-slate-500"
          }`}
        >
          <UserCheck className="h-5 w-5" />
          Điểm danh
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500" />
          {canCheckin
            ? "Đã hoàn tất xác thực. Có thể tiếp tục"
            : "Hoàn tất các bước xác thực để tiếp tục"}
        </p>
      </footer>
    </div>
  );
}
