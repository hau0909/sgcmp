"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  UserCheck,
  VideoOff,
  X,
} from "lucide-react";

import {
  requestCheckinGuardShift,
  requestGetGuardShiftDetail,
} from "@/features/shift/api/shift.api";
import type { GuardShiftDetailItem } from "@/features/shift/type";
import { createClient } from "@/lib/supabase/client";

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

const getStatusLabel = (status: GuardShiftDetailItem["status"], checkInTime?: string | null) => {
  if (status === "assigned") {
    return "Chờ điểm danh";
  }

  if (status === "completed") {
    return "Đã điểm danh đúng giờ";
  }

  if (status === "late") {
    return checkInTime ? "Đã điểm danh trễ" : "Đi trễ - vẫn có thể điểm danh";
  }

  return "Vắng mặt";
};

const getStatusStyle = (status: GuardShiftDetailItem["status"], checkInTime?: string | null) => {
  if (status === "assigned") {
    return "bg-[#0754a6] text-white";
  }

  if (status === "completed") {
    return "bg-emerald-600 text-white";
  }

  if (status === "late") {
    return checkInTime ? "bg-amber-600 text-white" : "bg-amber-500 text-white";
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkinPopup, setCheckinPopup] = useState<CheckinPopup | null>(null);

  // Camera states
  const [checkinImageFile, setCheckinImageFile] = useState<File | null>(null);
  const [checkinImagePreview, setCheckinImagePreview] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setCameraActive(true);
    } catch (err) {
      const msg =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Quyền truy cập camera bị từ chối. Vui lòng cấp quyền trong cài đặt trình duyệt."
          : "Không thể mở camera. Vui lòng kiểm tra thiết bị.";
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [facingMode]);

  // Restart camera when facingMode changes (only if camera is already active)
  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  const handleOpenCamera = () => {
    setCheckinImageFile(null);
    setCheckinImagePreview(null);
    startCamera();
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], "checkin.jpg", { type: "image/jpeg" });
        const previewUrl = URL.createObjectURL(blob);

        setCheckinImageFile(file);
        setCheckinImagePreview(previewUrl);
        stopCamera();
      },
      "image/jpeg",
      0.92,
    );
  };

  const handleRetakePhoto = () => {
    if (checkinImagePreview) {
      URL.revokeObjectURL(checkinImagePreview);
    }
    setCheckinImageFile(null);
    setCheckinImagePreview(null);
    startCamera();
  };

  const handleRemoveImage = () => {
    if (checkinImagePreview) {
      URL.revokeObjectURL(checkinImagePreview);
    }
    setCheckinImageFile(null);
    setCheckinImagePreview(null);
    stopCamera();
  };

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

    const startCheckinLimit = startTime;
    const lateCheckinLimit = new Date(startTime.getTime() + 5 * 60 * 1000);
    const absentLimit = new Date(startTime.getTime() + 35 * 60 * 1000);

    const isBeforeWindow = currentTime < startCheckinLimit;
    const isExpired = currentTime >= absentLimit;
    const isLate = currentTime > lateCheckinLimit && currentTime < absentLimit;

    // Can check-in if the status is assigned or (status is late and they have not checked in yet)
    const isPendingCheckin = 
      shift.status === "assigned" || 
      (shift.status === "late" && shift.check_in_time === null);

    const canCheckinByTime =
      isPendingCheckin &&
      currentTime >= startCheckinLimit &&
      currentTime < absentLimit;

    return {
      startTime,
      startCheckinLimit,
      lateCheckinLimit,
      absentLimit,
      isBeforeWindow,
      isExpired,
      isLate,
      canCheckinByTime,
    };
  }, [shift, currentTime]);

  const canCheckin =
    Boolean(checkinState?.canCheckinByTime) &&
    Boolean(checkinImageFile) &&
    !checkingIn;

  const checkinMessage = useMemo(() => {
    if (!shift || !checkinState) {
      return "Không tìm thấy thông tin ca trực.";
    }

    if (shift.status === "completed") {
      return "Đã điểm danh đúng giờ.";
    }

    if (shift.status === "late" && shift.check_in_time !== null) {
      return "Đã điểm danh trễ.";
    }

    if (shift.status === "absent" || checkinState.isExpired) {
      return "Đã quá thời gian điểm danh. Bạn được ghi nhận vắng mặt.";
    }

    if (checkinState.isBeforeWindow) {
      return `Có thể điểm danh từ ${formatCheckinTime(
        checkinState.startCheckinLimit,
      )}.`;
    }

    if (shift.status === "late" && shift.check_in_time === null) {
      if (!checkinImageFile) {
        return "Bạn đang đi trễ. Vui lòng chụp ảnh check-in để hoàn tất điểm danh.";
      }
      return "Ảnh check-in trễ đã sẵn sàng. Bạn có thể xác nhận ca làm việc.";
    }

    if (!checkinImageFile) {
      return "Vui lòng chụp ảnh check-in để hoàn tất điểm danh.";
    }

    return "Ảnh check-in đã sẵn sàng. Bạn có thể xác nhận ca làm việc.";
  }, [shift, checkinState, checkinImageFile]);

  const checkinButtonLabel = useMemo(() => {
    if (checkingIn) {
      return "Đang điểm danh...";
    }

    if (shift?.status === "completed") {
      return "Đã điểm danh";
    }

    if (shift?.status === "late" && shift?.check_in_time !== null) {
      return "Đã điểm danh trễ";
    }

    if (shift?.status === "absent" || checkinState?.isExpired) {
      return "Đã vắng mặt";
    }

    return "Điểm danh";
  }, [checkingIn, shift?.status, shift?.check_in_time, checkinState?.isExpired]);

  const fetchShiftDetail = useCallback(async () => {
    if (!shiftId) {
      setError("Không tìm thấy mã ca trực.");
      setLoading(false);
      return;
    }

    try {
      const response = await requestGetGuardShiftDetail({
        shiftId,
      });

      const shiftDetail = response.data.shift;

      setShift({
        ...shiftDetail,
        guards: shiftDetail.guards ?? [],
      });
      setError("");
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
  }, [shiftId]);

  // Initial fetch
  useEffect(() => {
    setLoading(true);
    fetchShiftDetail();
  }, [fetchShiftDetail]);

  // Regular clock updates
  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // Polling and visibility change refetch
  useEffect(() => {
    if (!shift) return;

    // Stop polling if already completed, absent, or late (and checked in)
    const isFinalState =
      shift.status === "completed" ||
      shift.status === "absent" ||
      (shift.status === "late" && shift.check_in_time !== null);

    if (isFinalState) return;

    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchShiftDetail();
    }, 30000);

    // Refetch when document becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchShiftDetail();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [shift, fetchShiftDetail]);

  const handleBack = () => {
    stopCamera();
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
        imageFile: checkinImageFile || undefined,
      });

      setShift((currentShift) => {
        if (!currentShift) {
          return currentShift;
        }

        return {
          ...currentShift,
          status: response.data.assignment.status,
          check_in_time: response.data.assignment.check_in_time,
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

  const canUseCamera = checkinState?.canCheckinByTime && !checkingIn;

  return (
    <div className="mx-auto w-full max-w-[430px] bg-[#f3f3f5]">
      {/* Hidden canvas for capturing photo */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Fullscreen camera overlay */}
      {cameraActive && !checkinImagePreview && (
        <div className="fixed inset-0 z-50 flex flex-col bg-black">
          {/* Video */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />

          {/* Top controls */}
          <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 pt-10 pb-4">
            {/* Close */}
            <button
              type="button"
              onClick={() => stopCamera()}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition active:scale-95"
              title="Đóng camera"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              Chụp ảnh điểm danh
            </span>

            {/* Flip camera */}
            <button
              type="button"
              onClick={() =>
                setFacingMode((prev) =>
                  prev === "environment" ? "user" : "environment",
                )
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition active:scale-95"
              title="Đổi camera"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
          </div>

          {/* Bottom — shutter button */}
          <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-12 pt-4">
            <button
              type="button"
              onClick={handleCapturePhoto}
              className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20 backdrop-blur-sm transition active:scale-90"
              title="Chụp ảnh"
            >
              <div className="h-14 w-14 rounded-full bg-white" />
            </button>
          </div>
        </div>
      )}

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
              className={"rounded-sm px-3 py-1 text-[10px] font-extrabold uppercase tracking-wide " + getStatusStyle(
                shift.status,
                shift.check_in_time,
              )}
            >
              {getStatusLabel(shift.status, shift.check_in_time)}
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

        {/* Camera / Photo section */}
        <section className="overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-300 bg-[#f8f8fa] px-3 py-3">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#0754a6]" />
              <h2 className="text-sm font-extrabold text-slate-800">
                Ảnh chụp điểm danh
              </h2>
            </div>
            {checkinImagePreview && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Đã chụp ảnh
              </span>
            )}

          </div>

          <div className="p-4 space-y-3">
            {/* Camera error */}
            {cameraError && (
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-center">
                <VideoOff className="mx-auto mb-1 h-5 w-5 text-red-500" />
                <p className="text-xs font-bold text-red-600">{cameraError}</p>
              </div>
            )}



            {/* Captured photo preview */}
            {checkinImagePreview && !cameraActive && (
              <div className="relative overflow-hidden rounded-xl aspect-video w-full">
                <img
                  src={checkinImagePreview}
                  alt="Ảnh Check-in"
                  className="h-full w-full object-cover"
                />
                <div className="absolute bottom-2 right-2 flex gap-2">
                  <button
                    type="button"
                    disabled={checkingIn}
                    onClick={handleRetakePhoto}
                    className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Chụp lại
                  </button>
                  <button
                    type="button"
                    disabled={checkingIn}
                    onClick={handleRemoveImage}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Open camera button (no photo taken yet, camera not active) */}
            {!cameraActive && !checkinImagePreview && (
              <button
                type="button"
                disabled={!canUseCamera}
                onClick={handleOpenCamera}
                className={`flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition ${
                  canUseCamera
                    ? "cursor-pointer border-blue-700 bg-blue-50/10 hover:border-blue-800 hover:bg-blue-50/20"
                    : "cursor-not-allowed border-slate-300 bg-slate-50 opacity-60"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                  <Camera className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <span className="block text-sm font-bold text-slate-700">
                    Mở camera để chụp ảnh
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    Nhấn để truy cập camera
                  </span>
                </div>
              </button>
            )}
          </div>
        </section>
      </main>

      <footer className="bottom-0 z-20 rounded-2xl border-t border-slate-200 bg-[#f3f3f5] px-3 pb-4 pt-3">
        <button
          type="button"
          onClick={handleCheckin}
          disabled={!canCheckin}
          className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-4 text-[15px] font-extrabold uppercase transition-all active:scale-[0.98] ${canCheckin
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
              className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${checkinPopup.type === "success"
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
                }`}
            >
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <h3
              className={`mt-4 text-base font-black ${checkinPopup.type === "success"
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
