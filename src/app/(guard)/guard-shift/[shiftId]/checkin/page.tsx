"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  Clock3,
  MapPin,
  UserCheck,
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

  const [checkinImageFile, setCheckinImageFile] = useState<File | null>(null);
  const [checkinImagePreview, setCheckinImagePreview] = useState<string | null>(null);
  const checkinImageInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const acceptedTypes = ["image/jpeg", "image/png"];
    if (!acceptedTypes.includes(file.type)) {
      setError("Ảnh check-in chỉ hỗ trợ định dạng JPG hoặc PNG.");
      event.target.value = "";
      return;
    }

    if (checkinImagePreview) {
      URL.revokeObjectURL(checkinImagePreview);
    }

    setCheckinImageFile(file);
    setCheckinImagePreview(URL.createObjectURL(file));
    setError("");
  };

  const handleRemoveImage = () => {
    if (checkinImagePreview) {
      URL.revokeObjectURL(checkinImagePreview);
    }
    setCheckinImageFile(null);
    setCheckinImagePreview(null);
    if (checkinImageInputRef.current) {
      checkinImageInputRef.current.value = "";
    }
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
    Boolean(checkinImageFile) &&
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

    if (!checkinImageFile) {
      return "Vui lòng chụp/tải ảnh check-in để hoàn tất điểm danh.";
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

      let imageUrl: string | undefined;
      let imagePath: string | undefined;

      if (checkinImageFile) {
        const id = shift.assignment_id;
        const uploadPath = `shifts/${id}/check-in/img.png`;
        
        const supabase = createClient();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("shifts")
          .upload(uploadPath, checkinImageFile, {
            contentType: checkinImageFile.type,
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) {
          throw new Error(`Tải ảnh check-in lên storage thất bại: ${uploadError.message}`);
        }

        imagePath = uploadData.path;
        const { data: publicUrlData } = supabase.storage
          .from("shifts")
          .getPublicUrl(uploadData.path);
        
        imageUrl = publicUrlData.publicUrl;
      }

      const response = await requestCheckinGuardShift({
        shiftId: shift.id,
        imageUrl,
        imagePath,
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
              <Camera className="h-5 w-5 text-[#0754a6]" />
              <h2 className="text-sm font-extrabold text-slate-800">
                Ảnh chụp Check-in
              </h2>
            </div>
            {checkinImagePreview && (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Đã chọn ảnh
              </span>
            )}
          </div>

          <div className="p-4">
            <input
              ref={checkinImageInputRef}
              type="file"
              accept="image/jpeg,image/png"
              onChange={handleImageChange}
              className="hidden"
              disabled={checkingIn || autoUpdatingAbsent || !checkinState?.canCheckinByTime}
            />

            <div
              onClick={() => {
                if (checkinState?.canCheckinByTime && !checkingIn && !autoUpdatingAbsent) {
                  checkinImageInputRef.current?.click();
                }
              }}
              className={`relative aspect-video w-full flex flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition ${checkinImagePreview ? "border-slate-300" : "border-blue-700 bg-blue-50/10"
                } ${checkinState?.canCheckinByTime && !checkingIn && !autoUpdatingAbsent
                  ? "cursor-pointer hover:border-blue-800 hover:bg-blue-50/20"
                  : "cursor-not-allowed opacity-60 bg-slate-50"
                }`}
            >
              {checkinImagePreview ? (
                <>
                  <img
                    src={checkinImagePreview}
                    alt="Ảnh Check-in"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    disabled={checkingIn || autoUpdatingAbsent}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 transition disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-slate-500">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                    <Camera className="h-6 w-6" />
                  </div>
                  <span className="mt-3 text-sm font-bold text-slate-700">
                    Chụp hoặc tải ảnh check-in
                  </span>
                  <span className="mt-1 text-xs text-slate-500">
                    Chỉ nhận định dạng JPG, PNG
                  </span>
                </div>
              )}
            </div>
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
