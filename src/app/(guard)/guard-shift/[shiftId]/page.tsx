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
import { useAuthStore } from "@/store/auth.store";
import type { GuardShiftDetailItem } from "@/features/shift/type";
import { useTranslation } from "@/components/providers/LanguageProvider";

import { formatDate } from "@/utils/dateTime";

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
  return formatDate(date, {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const getStatusStyle = (
  status: GuardShiftDetailItem["status"],
  checkInTime: string | null | undefined,
  startTime: string
) => {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "late") {
    return checkInTime ? "bg-orange-100 text-orange-700" : "bg-amber-100 text-amber-700";
  }
  if (status === "absent") return "bg-red-100 text-red-700";
  const isStarted = new Date().getTime() >= new Date(startTime).getTime();
  if (isStarted) return "bg-yellow-100 text-yellow-700";
  return "bg-blue-100 text-blue-700";
};

const getGuardStatusStyle = (
  status: GuardShiftDetailItem["status"],
  checkInTime: string | null | undefined,
  startTime: string
) => {
  if (status === "completed") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
  if (status === "late") {
    return checkInTime
      ? "bg-orange-50 text-orange-700 border border-orange-200"
      : "bg-amber-50 text-amber-700 border-amber-200";
  }
  if (status === "absent") return "bg-red-50 text-red-700 border border-red-200";
  const isStarted = new Date().getTime() >= new Date(startTime).getTime();
  if (isStarted) return "bg-yellow-50 text-yellow-700 border border-yellow-200";
  return "bg-blue-50 text-blue-700 border border-blue-200";
};

export default function GuardShiftDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const userId = useAuthStore((state) => state.user_id);
  const { dict } = useTranslation();
  const t = dict.layout_guard.guard_shift_detail;

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

  const currentGuardInfo = useMemo(() => {
    if (!shift || !userId) return null;
    return shift.guards.find((g) => g.user_id === userId);
  }, [shift, userId]);

  const isReplacement = (currentGuardInfo as any)?.is_replacement ?? false;

  const getStatusLabel = (
    status: GuardShiftDetailItem["status"],
    checkInTime: string | null | undefined,
    startTime: string
  ) => {
    if (status === "completed") return t.status_on_duty;
    if (status === "late") return checkInTime ? t.status_late_checked : t.status_late;
    if (status === "absent") return t.status_absent;
    const isStarted = new Date().getTime() >= new Date(startTime).getTime();
    if (isStarted) return t.status_not_checked;
    return t.status_assigned;
  };

  const getGuardStatusLabel = (
    status: GuardShiftDetailItem["status"],
    checkInTime: string | null | undefined,
    startTime: string
  ) => {
    if (status === "completed") return t.guard_status_on_duty;
    if (status === "late") return checkInTime ? t.guard_status_late_checked : t.guard_status_late;
    if (status === "absent") return t.guard_status_absent;
    const isStarted = new Date().getTime() >= new Date(startTime).getTime();
    if (isStarted) return t.guard_status_not_checked;
    return t.guard_status_assigned;
  };

  const handleOpenCheckinPage = () => {
    if (!shift) return;
    router.push(`/guard-shift/${shift.id}/checkin?date=${selectedDateKey}`);
  };

  useEffect(() => {
    const fetchShiftDetail = async () => {
      if (!shiftId) {
        setError(t.no_shift_id);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await requestGetGuardShiftDetail({ shiftId });
        const shiftDetail = response.data.shift;

        setShift({
          ...shiftDetail,
          guards: shiftDetail.guards ?? [],
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t.fetch_error;

        setError(message);
        setShift(null);
      } finally {
        setLoading(false);
      }
    };

    fetchShiftDetail();
  }, [shiftId, t.no_shift_id, t.fetch_error]);

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
            {t.page_title}
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
              {t.shift_detail_info}
            </p>
          </div>

          <span
            className={`rounded-full px-3 py-1.5 text-[10px] font-black ${
              isReplacement
                ? "bg-purple-100 text-purple-700"
                : getStatusStyle(shift.status, shift.check_in_time, shift.start_time)
            }`}
          >
            {isReplacement ? t.replacement : getStatusLabel(shift.status, shift.check_in_time, shift.start_time)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
              <span>{t.location_label}</span>
            </div>

            <p className="text-sm font-black text-slate-900">
              {shift.location}
            </p>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-500">
              <Clock3 className="h-3.5 w-3.5" />
              <span>{t.duration_label}</span>
            </div>

            <p className="text-sm font-black text-slate-900">{shift.time}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <div className="flex items-start gap-2">
            <Building2 className="mt-0.5 h-4 w-4 shrink-0 text-[#0754a6]" />

            <div>
              <p className="text-xs font-bold text-slate-500">{t.address_label}</p>

              <p className="mt-1 text-sm font-bold text-slate-800">
                {shift.address}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-base font-black text-slate-900">
          {t.shift_info_section}
        </h3>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
              <CalendarDays className="h-4 w-4" />
            </div>

            <div>
              <p className="text-xs font-bold text-slate-500">{t.date_label}</p>

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
              <p className="text-xs font-bold text-slate-500">{t.time_label}</p>

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
              <p className="text-xs font-bold text-slate-500">{t.area_label}</p>

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
                {t.assigned_by_label}
              </p>

              <p className="mt-1 text-sm font-black text-slate-900">
                {shift.assigned_by?.full_name || t.assigned_by_default}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#0754a6]">
              <Camera className="h-4 w-4" />
            </div>

            <div className="w-full">
              <p className="text-xs font-bold text-slate-500">{t.checkin_image_label}</p>

              {shift.checkin_image ? (
                <div className="mt-2 relative aspect-video w-full overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={shift.checkin_image.image_url}
                    alt={t.checkin_image_alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-2 flex aspect-video w-full flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400">
                  <Camera className="h-8 w-8 text-slate-300" />
                  <span className="mt-2 text-xs font-bold text-slate-500">{t.no_checkin_image}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-black text-slate-900">
              {t.guard_list_title}
            </h4>

            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-black text-[#0754a6]">
              {guards.length} {t.guard_count_suffix}
            </span>
          </div>

          <div className="space-y-2">
            {guards.length > 0 ? (
              guards.map((guard) => {
                const guardName = guard.full_name || t.no_name;
                const isRep = guard.is_replacement;

                return (
                  <div
                    key={guard.guard_id}
                    className={`flex items-center justify-between gap-3 rounded-xl border transition-all ${
                      isRep
                        ? "ml-5 border-l-4 border-l-purple-500 border-purple-200/80 bg-purple-50/40 p-2.5 shadow-xs"
                        : "border-slate-100 bg-slate-50 p-3"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full font-black text-white ${
                          isRep
                            ? "h-8 w-8 bg-purple-600 text-xs"
                            : "h-10 w-10 bg-[#0754a6] text-sm"
                        }`}
                      >
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
                        <p
                          className={`truncate font-black ${
                            isRep
                              ? "text-xs text-purple-950"
                              : "text-sm text-slate-900"
                          }`}
                        >
                          {guardName}
                        </p>

                        <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                          {guard.phone_number || t.no_phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {isRep ? (
                        <span className="rounded bg-purple-50 px-2 py-0.5 text-[9px] font-black text-purple-700 border border-purple-200">
                          {t.replacement_for} {guard.replaced_guard_name || ""}
                        </span>
                      ) : (
                        <>
                          {guard.replacement_guard_ids &&
                            guard.replacement_guard_ids.length > 0 && (
                              <span className="rounded bg-amber-50 px-2 py-0.5 text-[9px] font-black text-amber-700 border border-amber-200">
                                {t.has_replacement}
                              </span>
                            )}

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-black ${getGuardStatusStyle(
                              guard.status,
                              guard.check_in_time,
                              shift.start_time
                            )}`}
                          >
                            {getGuardStatusLabel(
                              guard.status,
                              guard.check_in_time,
                              shift.start_time
                            )}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-center">
                <p className="text-xs font-bold text-slate-500">
                  {t.no_guards}
                </p>
              </div>
            )}
          </div>
        </div>

        {!isReplacement && (
          <div className="bottom-3 z-20 rounded-2xl bg-[#f7f8fb]/90 pt-2 backdrop-blur">
            <button
              type="button"
              onClick={handleOpenCheckinPage}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0754a6] px-4 py-4 text-sm font-black uppercase text-white shadow-lg shadow-blue-900/20 transition-all active:scale-[0.98]"
            >
              <UserCheck className="h-5 w-5" />
              {t.confirm_shift_btn}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
