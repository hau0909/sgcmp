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
import { useTranslation } from "@/components/providers/LanguageProvider";

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

const getStatusStyle = (status: GuardShiftDetailItem["status"], checkInTime?: string | null) => {
  if (status === "assigned") return "bg-blue-100 text-blue-700";
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "late") return checkInTime ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
};

export default function GuardShiftCheckinPage() {
  const router = useRouter();
  const params = useParams();
  const { dict } = useTranslation();
  const t = dict.layout_guard.guard_checkin;

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
          ? t.camera_denied
          : t.camera_error;
      setCameraError(msg);
      setCameraActive(false);
    }
  }, [facingMode, t.camera_denied, t.camera_error]);

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
      return t.loading;
    }

    return getDurationFromTimeRange(shift.time);
  }, [shift, t.loading]);

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

  const getStatusLabel = (status: GuardShiftDetailItem["status"], checkInTime?: string | null) => {
    if (status === "assigned") return t.status_waiting;
    if (status === "completed") return t.status_done_on_time;
    if (status === "late") return checkInTime ? t.status_done_late : t.status_late_pending;
    return t.status_absent;
  };

  const checkinMessage = useMemo(() => {
    if (!shift || !checkinState) {
      return t.msg_no_shift;
    }

    if (shift.status === "completed") {
      return t.msg_done_on_time;
    }

    if (shift.status === "late" && shift.check_in_time !== null) {
      return t.msg_done_late;
    }

    if (shift.status === "absent" || checkinState.isExpired) {
      return t.msg_absent;
    }

    if (checkinState.isBeforeWindow) {
      return `${t.msg_can_from} ${formatCheckinTime(checkinState.startCheckinLimit)}.`;
    }

    if (shift.status === "late" && shift.check_in_time === null) {
      if (!checkinImageFile) {
        return t.msg_late_no_photo;
      }
      return t.msg_late_photo_ready;
    }

    if (!checkinImageFile) {
      return t.msg_no_photo;
    }

    return t.msg_photo_ready;
  }, [shift, checkinState, checkinImageFile, t]);

  const checkinButtonLabel = useMemo(() => {
    if (checkingIn) return t.btn_checking_in;
    if (shift?.status === "completed") return t.btn_done;
    if (shift?.status === "late" && shift?.check_in_time !== null) return t.btn_done_late;
    if (shift?.status === "absent" || checkinState?.isExpired) return t.btn_absent;
    return t.btn_checkin;
  }, [checkingIn, shift?.status, shift?.check_in_time, checkinState?.isExpired, t]);

  const fetchShiftDetail = useCallback(async () => {
    if (!shiftId) {
      setError(t.no_shift_id);
      setLoading(false);
      return;
    }

    try {
      const response = await requestGetGuardShiftDetail({ shiftId });
      const shiftDetail = response.data.shift;

      setShift({
        ...shiftDetail,
        guards: shiftDetail.guards ?? [],
      });
      setError("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.fetch_error;

      setError(message);
      setShift(null);
    } finally {
      setLoading(false);
    }
  }, [shiftId, t.no_shift_id, t.fetch_error]);

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

      const status = response.data.assignment.status;
      let popupMessage = response.message;
      if (status === "completed") {
        popupMessage = t.checkin_success;
      } else if (status === "late") {
        popupMessage = t.checkin_late_success || response.message;
      } else if (status === "absent") {
        popupMessage = t.checkin_expired_absent || response.message;
      }

      setCheckinPopup({
        type: status === "absent" ? "error" : "success",
        message: popupMessage,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t.checkin_failed;

      setCheckinPopup({
        type: "error",
        message: message || t.checkin_failed,
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
          {t.back}
        </button>

        <div className="rounded-2xl border border-red-100 bg-red-50 p-5 text-center">
          <p className="text-sm font-bold text-red-600">
            {error || t.not_found}
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
              title={t.close_camera_title}
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded-full bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
              {t.camera_overlay_label}
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
              title={t.flip_camera_title}
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
              title={t.capture_title}
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
            {t.back}
          </button>
        </div>

        <section className="rounded-2xl border border-slate-300 bg-white p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h1 className="text-[18px] font-extrabold text-slate-800">
              {t.upcoming_shift}
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
                <span className="text-xs font-bold">{t.location_label}</span>
              </div>

              <p className="text-[15px] font-extrabold text-slate-800">
                {shift.location}
              </p>
            </div>

            <div>
              <div className="mb-1 flex items-center gap-1.5 text-slate-500">
                <Clock3 className="h-4 w-4" />
                <span className="text-xs font-bold">{t.duration_label}</span>
              </div>

              <p className="text-[15px] font-extrabold text-slate-800">
                {shiftDuration}
              </p>
            </div>
          </div>

          <div className="mt-3 rounded-xl bg-slate-50 p-3">
            <p className="text-xs font-bold text-slate-500">{t.address_label}</p>
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
                {t.photo_section_title}
              </h2>
            </div>
            {checkinImagePreview && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                {t.photo_taken}
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
                  alt={t.checkin_img_alt}
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
                    {t.retake}
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
                    {t.open_camera_label}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t.open_camera_hint}
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
                ? t.popup_success_title
                : t.popup_error_title}
            </h3>

            <p className="mt-2 text-sm font-bold text-slate-600">
              {checkinPopup.message}
            </p>

            <button
              type="button"
              onClick={() => setCheckinPopup(null)}
              className="mt-5 w-full rounded-xl bg-[#0754a6] px-4 py-3 text-sm font-black text-white transition-all active:scale-[0.98]"
            >
              {t.popup_close}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
