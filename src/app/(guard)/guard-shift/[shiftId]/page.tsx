"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  UserRound,
  UserCheck,
  Camera,
} from "lucide-react";
import { requestGetGuardShiftDetail } from "@/features/shift/api/shift.api";
import type { GuardShiftDetailItem } from "@/features/shift/type";

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

const getStatusLabel = (status: GuardShiftDetailItem["status"]) => {
  if (status === "assigned") {
    return "PHÂN CÔNG";
  }

  if (status === "completed") {
    return "HOÀN THÀNH";
  }

  return "VẮNG MẶT";
};

const getGuardStatusLabel = (status: GuardShiftDetailItem["status"]) => {
  if (status === "assigned") {
    return "Đang trực";
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
    return "bg-green-600 text-white";
  }

  return "bg-red-600 text-white";
};

const getGuardStatusStyle = (status: GuardShiftDetailItem["status"]) => {
  if (status === "assigned") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "completed") {
    return "bg-green-50 text-green-700";
  }

  return "bg-red-50 text-red-700";
};

export default function GuardShiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const shiftId = Array.isArray(params.shiftId)
    ? params.shiftId[0]
    : params.shiftId;

  const selectedDate = useMemo(() => {
    return parseDateKey(searchParams.get("date"));
  }, [searchParams]);

  const selectedDateKey = useMemo(() => {
    return formatGuardShiftDateKey(selectedDate);
  }, [selectedDate]);

  const [shift, setShift] = useState<GuardShiftDetailItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOpenCheckinPage = () => {
    if (!shift) {
      return;
    }

    router.push(`/guard-shift/${shift.id}/checkin?date=${selectedDateKey}`);
  };

  useEffect(() => {
    const fetchShiftDetail = async () => {
      if (!shiftId) {
        setError("Không tìm thấy mã ca trực.");
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
            : "Không thể lấy chi tiết ca trực.";

        setError(message);
        setShift(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetail();
  }, [shiftId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-28 animate-pulse rounded-full bg-slate-200" />
        <div className="h-40 animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-80 animate-pulse rounded-2xl bg-slate-200" />
      </div>
    );
  }

  if (error || !shift) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-black text-slate-700 shadow-sm"
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

  const guards = shift.guards ?? [];

  return (
    <div className="space-y-4 pb-6">
      <section className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <ShieldCheck className="h-6 w-6 shrink-0 text-[#0754a6]" />

          <h1 className="truncate text-base font-black text-[#0754a6]">
            Chi tiết ca trực
          </h1>
        </div>

        <div className="h-10 w-10" />
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-950">
              {shift.shift_name}
            </h2>

            <p className="mt-1 text-xs font-bold text-slate-500">
              Thông tin chi tiết ca trực trong ngày
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-black ${getStatusStyle(
              shift.status,
            )}`}
          >
            {getStatusLabel(shift.status)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>Vị trí</span>
            </div>

            <p className="text-sm font-black text-slate-900">
              {shift.location}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              <span>Thời lượng</span>
            </div>

            <p className="text-sm font-black text-slate-900">{shift.time}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />

            <div>
              <p className="text-xs font-bold text-slate-500">Địa chỉ</p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {shift.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
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

              <p className="mt-1 text-sm font-black capitalize text-slate-900">
                {formatDateTitle(selectedDate)}
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
                {shift.time}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
              <MapPin className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">Khu vực trực</p>

              <p className="mt-1 text-sm font-black text-slate-900">
                {shift.location}
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
                {shift.assigned_by?.full_name || "Điều phối viên SGCMP"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
              <Camera className="h-4 w-4" />
            </div>

            <div className="w-full">
              <p className="text-xs font-bold text-slate-500">Ảnh điểm danh</p>

              {shift.checkin_image ? (
                <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={shift.checkin_image.image_url}
                    alt="Ảnh Check-in ca trực"
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-2 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera className="h-8 w-8 text-slate-300" />
                  <span className="mt-2 text-xs font-bold text-slate-500">Chưa có ảnh điểm danh</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900">
              Danh sách bảo vệ trực
            </h4>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#0754a6]">
              {guards.length} bảo vệ
            </span>
          </div>

          <div className="space-y-2">
            {guards.length > 0 ? (
              guards.map((guard) => {
                const guardName = guard.full_name || "Chưa có tên";

                return (
                  <div
                    key={guard.guard_id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0754a6] text-sm font-black text-white">
                        {guard.avatar_url ? (
                          <img
                            src={guard.avatar_url}
                            alt={guardName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          guardName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-black text-slate-900">
                          {guardName}
                        </p>

                        <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                          {guard.phone_number || "Chưa có SĐT"}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-bold text-slate-500">
                  Chưa có danh sách bảo vệ trong ca này.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bottom-3 z-20 rounded-2xl bg-[#f7f8fb]/90 pt-2 backdrop-blur">
          <button
            type="button"
            onClick={handleOpenCheckinPage}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0754a6] px-4 py-4 text-sm font-black uppercase text-white shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
          >
            <UserCheck className="h-5 w-5" />
            Xác nhận ca làm việc
          </button>
        </div>
      </section>
    </div>
  );
}
