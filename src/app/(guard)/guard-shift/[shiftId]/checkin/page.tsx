"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
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
  UserCheck,
} from "lucide-react";

import {
  requestCheckinGuardShift,
  requestGetGuardShiftDetail,
} from "@/features/shift/api/shift.api";
import type { GuardShiftDetailItem } from "@/features/shift/type";

const CHECKIN_BEFORE_MINUTES = 5;
const CHECKIN_AFTER_MINUTES = 5;

type CheckinPopup = {
  type: "success" | "error";
  message: string;
};

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

  let diffMinutes = endTotal - startTotal;

  if (diffMinutes <= 0) {
    diffMinutes += 24 * 60;
  }

  const hours = diffMinutes / 60;

  return `${timeRange} (${Number.isInteger(hours) ? hours : hours.toFixed(1)}h)`;
};

const formatCheckinTime = (date: Date) => {
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
};

const getStatusLabel = (status: GuardShiftDetailItem["status"]) => {
  if (status === "assigned") {
    return "Chờ xác nhận";
  }

  if (status === "completed") {
    return "Hoàn thành";
  }

  return "Vắng mặt";
};

const getStatusStyle = (status: GuardShiftDetailItem["status"]) => {
  if (status === "assigned") {
    return "bg-[#0754a6] text-white";
  }

  if (status === "completed") {
    return "bg-emerald-600 text-white";
  }

  return "bg-red-600 text-white";
};

export default function GuardShiftCheckinPage() {
  const router = useRouter();
  const params = useParams();

  const shiftId = Array.isArray(params.shiftId)
    ? params.shiftId[0]
    : params.shiftId;

  const [shift, setShift] = useState<GuardShiftDetailItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [checkingIn, setCheckingIn] = useState(false);
  const [autoUpdatingAbsent, setAutoUpdatingAbsent] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkinPopup, setCheckinPopup] = useState<CheckinPopup | null>(null);

  const hasAutoMarkedAbsentRef = useRef(false);

  const shiftDuration = useMemo(() => {
    if (!shift) {
      return "Đang tải...";
    }

    return getDurationFromTimeRange(shift.time);
  }, [shift]);

  const checkinState = useMemo(() => {
    if (!shift) {
      return null;
    }

    const startTime = new Date(shift.start_time);

    if (Number.isNaN(startTime.getTime())) {
      return null;
    }

    const canCheckinFrom = new Date(
      startTime.getTime() - CHECKIN_BEFORE_MINUTES * 60 * 1000,
    );

    const absentAfter = new Date(
      startTime.getTime() + CHECKIN_AFTER_MINUTES * 60 * 1000,
    );

    const isBeforeWindow = currentTime < canCheckinFrom;
    const isExpired = currentTime >= absentAfter;

    return {
      startTime,
      canCheckinFrom,
      absentAfter,
      isBeforeWindow,
      isExpired,
      canCheckinByTime:
        shift.status === "assigned" &&
        currentTime >= canCheckinFrom &&
        currentTime < absentAfter,
    };
  }, [shift, currentTime]);

  const canCheckin =
    Boolean(checkinState?.canCheckinByTime) &&
    !checkingIn &&
    !autoUpdatingAbsent;

  const checkinMessage = useMemo(() => {
    if (!shift || !checkinState) {
      return "Không tìm thấy thông tin ca trực.";
    }

    if (shift.status === "completed") {
      return "Ca trực này đã được điểm danh.";
    }

    if (shift.status === "absent" || checkinState.isExpired) {
      return "Đã quá thời gian điểm danh. Ca trực được đánh dấu vắng mặt.";
    }

    if (checkinState.isBeforeWindow) {
      return `Có thể điểm danh từ ${formatCheckinTime(
        checkinState.canCheckinFrom,
      )}.`;
    }

    return "Đã đến thời gian điểm danh. Bạn có thể xác nhận ca làm việc.";
  }, [shift, checkinState]);

  const checkinButtonLabel = useMemo(() => {
    if (checkingIn) {
      return "Đang điểm danh...";
    }

    if (shift?.status === "completed") {
      return "Đã điểm danh";
    }

    if (shift?.status === "absent" || checkinState?.isExpired) {
      return "Đã vắng mặt";
    }

    if (autoUpdatingAbsent) {
      return "Đang cập nhật...";
    }

    return "Điểm danh";
  }, [checkingIn, autoUpdatingAbsent, shift?.status, checkinState?.isExpired]);

  useEffect(() => {
    const fetchShiftDetail = async () => {
      if (!shiftId) {
        setError("Không tìm thấy mã ca trực.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await requestGetGuardShiftDetail({
          shiftId,
        });

        const shiftDetail = response.data.shift;

        setShift({
          ...shiftDetail,
          guards: shiftDetail.guards ?? [],
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Không thể lấy thông tin ca trực.";

        setError(message);
        setShift(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetail();
  }, [shiftId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    const markAbsentIfExpired = async () => {
      if (!shift || !checkinState) {
        return;
      }

      if (hasAutoMarkedAbsentRef.current) {
        return;
      }

      if (shift.status !== "assigned" || !checkinState.isExpired) {
        return;
      }

      try {
        hasAutoMarkedAbsentRef.current = true;
        setAutoUpdatingAbsent(true);

        const response = await requestCheckinGuardShift({
          shiftId: shift.id,
        });

        setShift((currentShift) => {
          if (!currentShift) {
            return currentShift;
          }

          return {
            ...currentShift,
            status: response.data.assignment.status,
          };
        });
      } catch {
        hasAutoMarkedAbsentRef.current = false;
      } finally {
        setAutoUpdatingAbsent(false);
      }
    };

    markAbsentIfExpired();
  }, [shift, checkinState]);

  const handleBack = () => {
    router.back();
  };

  const handleCheckin = async () => {
    if (!canCheckin || !shift) {
      return;
    }

    try {
      setCheckingIn(true);
      setCheckinPopup(null);

      const response = await requestCheckinGuardShift({
        shiftId: shift.id,
      });

      setShift((currentShift) => {
        if (!currentShift) {
          return currentShift;
        }

        return {
          ...currentShift,
          status: response.data.assignment.status,
        };
      });

      setCheckinPopup({
        type: "success",
        message: response.message,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Điểm danh ca trực thất bại.";

      setCheckinPopup({
        type: "error",
        message,
      });
    } finally {
      setCheckingIn(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[430px] bg-[#f3f3f5] p-3">
        <div className="space-y-3">
          <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
          <div className="h-32 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-[330px] animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-[300px] animate-pulse rounded-2xl bg-slate-200" />
        </div>
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="mx-auto w-full max-w-[430px] bg-[#f3f3f5] p-3">
        <button
          type="button"
          onClick={handleBack}
          className="mb-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-slate-700 shadow-sm transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="text-sm font-bold text-red-600">
            {error || "Không tìm thấy ca trực."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[430px] bg-[#f3f3f5]">
      <main className="space-y-3 px-3 pb-3 pt-3">
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

        <section className="rounded-2xl border border-slate-300 bg-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h1 className="text-[18px] font-extrabold text-slate-800">
              Ca trực sắp tới
            </h1>

            <span
              className={`rounded-sm px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide ${getStatusStyle(
                shift.status,
              )}`}
            >
              {getStatusLabel(shift.status)}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4" />
                <span className="text-xs font-bold">Vị trí</span>
              </div>

              <p className="text-[15px] font-extrabold text-slate-800">
                {shift.location}
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

          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">Địa chỉ</p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {shift.address}
            </p>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300 bg-[#f8f8fa] px-3 py-3">
            <div className="flex items-center gap-2">
              <LocateFixed className="h-5 w-5 text-[#0754a6]" />

              <h2 className="text-sm font-extrabold text-slate-800">
                Xác thực GPS
              </h2>
            </div>

            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="relative h-[280px] overflow-hidden bg-[#b8b8bb]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#c7c7ca] via-[#b7b7bb] to-[#a9aaae]" />
            <div className="absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_center,white_1px,transparent_1px)] [background-size:28px_28px]" />
            <div className="absolute left-1/2 top-1/2 h-24 w-36 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white/15 blur-sm" />
            <div className="absolute inset-0 backdrop-blur-[1px]" />

            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0754a6] text-white shadow-md">
                <MapPinned className="h-8 w-8" />
              </div>

              <p className="mt-4 text-sm font-extrabold text-white">
                Giao diện xác thực GPS
              </p>

              <p className="mt-1 max-w-[260px] text-xs font-bold text-white/70">
                Phần này chỉ hiển thị UI, không lấy vị trí thực tế.
              </p>
            </div>

            <div className="absolute bottom-3 left-3 right-3 rounded bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-700">
              <p>GPS đã sẵn sàng</p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300 bg-[#f8f8fa] px-3 py-3">
            <div className="flex items-center gap-2">
              <IdCard className="h-5 w-5 text-[#0754a6]" />

              <h2 className="text-sm font-extrabold text-slate-800">
                Xác thực ID
              </h2>
            </div>

            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>

          <div className="relative h-[250px] overflow-hidden bg-[#25292e]">
            <div className="absolute inset-0 bg-black/20" />

            <div className="relative flex h-full flex-col items-center justify-center px-4 text-center">
              <Camera className="h-20 w-20 text-white/45" />

              <p className="mt-3 text-sm font-bold text-white/55">
                Giao diện xác thực ID
              </p>

              <div className="mt-6 rounded bg-white px-5 py-3 text-sm font-extrabold text-slate-800 shadow-sm">
                Ảnh ID
              </div>
            </div>

            <div className="absolute bottom-3 left-3 right-3 rounded bg-emerald-50 px-3 py-2 text-center text-[11px] font-bold text-emerald-700">
              <p>ID đã sẵn sàng</p>
            </div>
          </div>
        </section>
      </main>

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
          {checkinButtonLabel}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold text-slate-500">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-slate-500" />
          {checkinMessage}
        </p>
      </footer>

      {checkinPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-[340px] rounded-2xl bg-white p-5 text-center shadow-xl">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${
                checkinPopup.type === "success"
                  ? "bg-emerald-50 text-emerald-600"
                  : "bg-red-50 text-red-600"
              }`}
            >
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3
              className={`mt-4 text-base font-black ${
                checkinPopup.type === "success"
                  ? "text-emerald-700"
                  : "text-red-600"
              }`}
            >
              {checkinPopup.type === "success"
                ? "Điểm danh thành công"
                : "Điểm danh thất bại"}
            </h3>

            <p className="mt-2 text-sm font-bold text-slate-600">
              {checkinPopup.message}
            </p>

            <button
              type="button"
              onClick={() => setCheckinPopup(null)}
              className="mt-5 w-full rounded-xl bg-[#0754a6] px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98]"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
