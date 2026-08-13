"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  X,
  User,
  UserRound,
  Phone,
  Mail,
  Activity,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Search,
  Loader2,
  ShieldCheck,
  Award,
  IdCard,
  RefreshCw,
  Check,
} from "lucide-react";
import { ShiftSwapRequestWithDetails } from "../repository/shift-swap.repository";
import { requestGetAllGuards } from "@/features/guards/api/guard.api";
import { GuardListItem } from "@/features/guards/type";
import { requestGetGuardAvailability } from "../api/shift.api";
import { GuardAvailabilityInfo } from "../type";
import { requestApproveSwapRequest } from "../api/shift-swap.api";
import { ShiftSwapRequestItem } from "@/types/ShiftSwapRequest";
import { formatDate } from "@/utils/dateTime";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CoordinatorSwapModalProps {
  isOpen: boolean;
  request: ShiftSwapRequestWithDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

const getGuardProfile = (guardProfiles: GuardListItem["profiles"]) => {
  if (!guardProfiles) return null;
  if (Array.isArray(guardProfiles)) return guardProfiles[0] || null;
  return guardProfiles;
};

const getIdentityId = (profiles: GuardListItem["profiles"]): string => {
  const p = getGuardProfile(profiles);
  if (!p) return "";
  if (Array.isArray(p.identities) && p.identities.length > 0) {
    return p.identities[0].identity_id;
  }
  if (p.identities && typeof p.identities === "object" && "identity_id" in p.identities) {
    return (p.identities as any).identity_id || "";
  }
  return "";
};

export function CoordinatorSwapModal({
  isOpen,
  request,
  onClose,
  onSuccess,
}: CoordinatorSwapModalProps) {
  const { dict, locale } = useTranslation();

  // State for guard list & search
  const [guards, setGuards] = useState<GuardListItem[]>([]);
  const [loadingGuards, setLoadingGuards] = useState(false);
  const [searchGuard, setSearchGuard] = useState("");

  // Hover state for tooltip popover
  const [hoveredGuardInfo, setHoveredGuardInfo] = useState<{
    guard: GuardListItem;
    x: number;
    y: number;
  } | null>(null);

  // Selected guard mapping: shift_id -> guard_id
  const [selectedReplacements, setSelectedReplacements] = useState<Record<string, string>>({});

  // Active shift index currently being edited in right sidebar
  const [activeShiftId, setActiveShiftId] = useState<string | null>(null);

  // Availability map: guard_id -> availability info
  const [availabilityMap, setAvailabilityMap] = useState<Record<string, GuardAvailabilityInfo>>({});
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  // Submit state
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Extract requested shift items
  const requestItems = useMemo(() => {
    if (!request || !Array.isArray(request.items)) return [];
    return request.items;
  }, [request]);

  // Set initial active shift
  useEffect(() => {
    if (isOpen && requestItems.length > 0) {
      setActiveShiftId(requestItems[0].shift_id);
      setSelectedReplacements({});
      setErrorMsg(null);
      fetchApprovedGuards();
    }
  }, [isOpen, requestItems]);

  // Fetch approved guards
  const fetchApprovedGuards = async () => {
    setLoadingGuards(true);
    try {
      const res = await requestGetAllGuards({ limit: 100, approvalStatus: "approved" });
      if (res.data) {
        const rawGuards: GuardListItem[] = Array.isArray(res.data)
          ? res.data
          : (res.data as any)?.guards || [];
        const approvedOnly = rawGuards.filter(
          (g: GuardListItem) => !g.approval_status || g.approval_status === "approved"
        );
        setGuards(approvedOnly);
      }
    } catch (err) {
      console.error("Error fetching guards:", err);
    } finally {
      setLoadingGuards(false);
    }
  };

  // Fetch availability for guards based on active shift & selected replacements
  useEffect(() => {
    if (!activeShiftId || !request?.shift_details?.[activeShiftId] || guards.length === 0) return;

    const checkAvailability = async () => {
      setIsCheckingConflicts(true);
      try {
        // Group guards by their set of proposed shifts
        const groupMap = new Map<
          string,
          { guardIds: string[]; proposedShifts: { startTime: string; endTime: string }[] }
        >();

        guards.forEach((g) => {
          const gId = g.guard_id;
          const shiftIdsSet = new Set<string>();

          // Include active shift
          if (activeShiftId) {
            shiftIdsSet.add(activeShiftId);
          }

          // Include all shifts already assigned to this guard in selectedReplacements
          Object.entries(selectedReplacements).forEach(([sId, selectedGId]) => {
            if (selectedGId === gId) {
              shiftIdsSet.add(sId);
            }
          });

          // Build proposedShifts array
          const proposedShifts: { startTime: string; endTime: string }[] = [];
          shiftIdsSet.forEach((sId) => {
            const detail = request.shift_details?.[sId];
            if (detail?.start_time && detail?.end_time) {
              proposedShifts.push({
                startTime: detail.start_time,
                endTime: detail.end_time,
              });
            }
          });

          const groupKey = JSON.stringify(
            proposedShifts.sort((a, b) => a.startTime.localeCompare(b.startTime))
          );

          if (!groupMap.has(groupKey)) {
            groupMap.set(groupKey, { guardIds: [gId], proposedShifts });
          } else {
            groupMap.get(groupKey)!.guardIds.push(gId);
          }
        });

        // Batch API calls per group
        const newAvailMap: Record<string, GuardAvailabilityInfo> = {};
        await Promise.all(
          Array.from(groupMap.values()).map(async ({ guardIds: groupGuards, proposedShifts }) => {
            if (proposedShifts.length === 0) return;
            const res = await requestGetGuardAvailability({
              guardIds: groupGuards,
              proposedShifts,
            });
            if (res.data) {
              Object.assign(newAvailMap, res.data);
            }
          })
        );

        setAvailabilityMap(newAvailMap);
      } catch (err) {
        console.error("Error checking guard availability:", err);
      } finally {
        setIsCheckingConflicts(false);
      }
    };

    const timer = setTimeout(checkAvailability, 300);
    return () => clearTimeout(timer);
  }, [activeShiftId, selectedReplacements, request, guards, requestItems]);

  // Filter guards by search query & exclude requester guard
  const filteredGuards = useMemo(() => {
    const query = searchGuard.trim().toLowerCase();
    return guards.filter((g) => {
      // Exclude requester guard
      if (g.guard_id === request?.requester_guard_id) return false;

      if (!query) return true;
      const prof = getGuardProfile(g.profiles);
      const fullName = prof?.full_name?.toLowerCase() || "";
      const phone = prof?.phone_number?.toLowerCase() || "";
      const cccd = getIdentityId(g.profiles).toLowerCase() || (g as any).cccd_number?.toLowerCase() || "";

      return fullName.includes(query) || phone.includes(query) || cccd.includes(query);
    });
  }, [guards, searchGuard, request?.requester_guard_id]);

  // Handle guard selection
  const handleSelectGuard = (guardId: string) => {
    if (activeShiftId) {
      setSelectedReplacements((prev) => ({
        ...prev,
        [activeShiftId]: guardId,
      }));
    }
  };

  // Submit approval
  const handleSubmitApprove = async () => {
    setErrorMsg(null);

    // Validate that every shift has a replacement guard
    const updatedItems: ShiftSwapRequestItem[] = requestItems.map((it) => ({
      assignment_id: it.assignment_id,
      shift_id: it.shift_id,
      replacement_guard_id: selectedReplacements[it.shift_id] || null,
    }));

    const missingGuardShift = updatedItems.find((it) => !it.replacement_guard_id);
    if (missingGuardShift) {
      setErrorMsg(
        dict?.coordinator_swap_modal?.val_missing_replacement ||
          "Vui lòng chọn bảo vệ thay thế cho tất cả các ca làm."
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await requestApproveSwapRequest(request!.request_id, updatedItems);
      if (res.success) {
        onSuccess();
        onClose();
      } else {
        setErrorMsg(
          res.message || (dict?.coordinator_swap_modal?.msg_approve_error || "Duyệt đổi ca thất bại.")
        );
      }
    } catch (err: any) {
      setErrorMsg(
        err?.message || (dict?.coordinator_swap_modal?.msg_error_generic || "Đã xảy ra lỗi khi duyệt đổi ca.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatTimeRange = (startStr: string, endStr: string) => {
    try {
      const startDate = new Date(startStr);
      const endDate = new Date(endStr);
      const timeLocale = locale === "en" ? "en-US" : "vi-VN";
      const startTime = startDate.toLocaleTimeString(timeLocale, { hour: "2-digit", minute: "2-digit" });
      const endTime = endDate.toLocaleTimeString(timeLocale, { hour: "2-digit", minute: "2-digit" });
      const dateFormatted = formatDate(startStr);
      return { startTime, endTime, dateFormatted };
    } catch {
      return { startTime: "", endTime: "", dateFormatted: startStr };
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <RefreshCw className="h-5 w-5 text-blue-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {dict?.coordinator_swap_modal?.modal_title || "Duyệt & Chọn bảo vệ thay thế"}
              </h3>
              <p className="text-xs text-blue-200">
                {dict?.coordinator_swap_modal?.modal_subtitle || "Xác nhận chọn bảo vệ phù hợp cho các ca xin đổi"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Split view (Left content + Right Sidebar) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Panel: Request Details & Shift Selection */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 border-r border-slate-200">
            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Requester Guard Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {dict?.coordinator_swap_modal?.requester_info_title || "THÔNG TIN BẢO VỆ XIN ĐỔI CA"}
              </span>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-blue-600 bg-white shadow-xs shrink-0">
                  {request.requester_avatar ? (
                    <img
                      src={request.requester_avatar}
                      alt={request.requester_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <User className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-base text-slate-900 truncate">{request.requester_name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                    {request.requester_phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-blue-600" />
                        {request.requester_phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-xs border-t border-slate-200 pt-2.5">
                <span className="font-bold text-slate-700">{dict?.coordinator_swap_modal?.reason_prefix || "Lý do xin đổi ca:"} </span>
                <span className="text-slate-700 italic">"{request.reason}"</span>
              </div>
            </div>

            {/* Shift List to Assign */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  {(dict?.coordinator_swap_modal?.requested_shifts_title || "Danh sách ca xin đổi ({count} ca)").replace("{count}", String(requestItems.length))}
                </label>
                <span className="text-[11px] text-slate-500">
                  {dict?.coordinator_swap_modal?.click_shift_hint || "Nhấp vào ca để chọn bảo vệ từ danh sách bên phải"}
                </span>
              </div>

              <div className="space-y-3">
                {requestItems.map((item, index) => {
                  const shiftInfo = request.shift_details?.[item.shift_id];
                  const chosenGuardId = selectedReplacements[item.shift_id];
                  const chosenGuardItem = guards.find((g) => g.guard_id === chosenGuardId);
                  const chosenGuardProf = chosenGuardItem ? getGuardProfile(chosenGuardItem.profiles) : null;

                  const times = shiftInfo ? formatTimeRange(shiftInfo.start_time, shiftInfo.end_time) : null;
                  const isActive = activeShiftId === item.shift_id;

                  return (
                    <div
                      key={item.shift_id}
                      onClick={() => setActiveShiftId(item.shift_id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer ${
                        isActive
                          ? "border-blue-600 bg-blue-50/30 ring-2 ring-blue-500/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-800 text-xs font-extrabold">
                            {index + 1}
                          </span>
                          <span className="font-bold text-sm text-slate-900">
                            {shiftInfo?.shift_name || (dict?.coordinator_swap_modal?.shift_default_name || "Ca trực #{id}").replace("{id}", item.shift_id.slice(0, 8))}
                          </span>
                        </div>

                        {times && (
                          <span className="text-xs font-semibold text-blue-700 bg-blue-100/70 px-2.5 py-1 rounded-md self-start sm:self-auto">
                            {times.dateFormatted} · {times.startTime} - {times.endTime}
                          </span>
                        )}
                      </div>

                      {shiftInfo?.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{shiftInfo.location}</span>
                        </div>
                      )}

                      {/* Selected Replacement Guard Status */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                        <span className="text-slate-500 font-medium">
                          {dict?.coordinator_swap_modal?.replacement_guard_label || "Bảo vệ thay thế:"}
                        </span>
                        {chosenGuardProf ? (
                          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{chosenGuardProf.full_name || (dict?.coordinator_swap_modal?.default_guard_name || "Bảo vệ")}</span>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-lg">
                            {dict?.coordinator_swap_modal?.unassigned_badge || "⚠️ Chưa chọn bảo vệ"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Panel: Guard Selector Sidebar */}
          <div className="w-[360px] lg:w-[420px] bg-slate-50 flex flex-col shrink-0">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-slate-200 bg-white space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    {dict?.coordinator_swap_modal?.guards_sidebar_title || "Danh sách Bảo vệ (Approved)"}
                  </h4>
                </div>
                <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {filteredGuards.length} {dict?.coordinator_swap_modal?.guards_count_suffix || "bảo vệ"}
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={searchGuard}
                  onChange={(e) => setSearchGuard(e.target.value)}
                  placeholder={dict?.coordinator_swap_modal?.search_placeholder || "Tìm bảo vệ theo tên, SĐT..."}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {isCheckingConflicts && (
                <div className="flex items-center gap-2 text-xs text-blue-600 font-medium">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>{dict?.coordinator_swap_modal?.checking_conflicts || "Đang kiểm tra trùng lịch & giờ làm..."}</span>
                </div>
              )}
            </div>

            {/* Guards List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {loadingGuards ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs">{dict?.coordinator_swap_modal?.loading_guards || "Đang tải danh sách bảo vệ..."}</span>
                </div>
              ) : filteredGuards.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-1">
                  <User className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="text-xs font-semibold">{dict?.coordinator_swap_modal?.no_guards_found || "Không tìm thấy bảo vệ nào phù hợp"}</p>
                </div>
              ) : (
                filteredGuards.map((g) => {
                  const guardProfile = getGuardProfile(g.profiles);
                  const guardId = g.guard_id;

                  // Check if guard is chosen for active shift or all shifts
                  const isChosen = activeShiftId ? selectedReplacements[activeShiftId] === guardId : false;

                  // Check availability info from API
                  const availInfo = availabilityMap[guardId];
                  const hasConflict = availInfo ? availInfo.hasConflict : false;
                  const exceedsDailyLimit = availInfo ? availInfo.exceedsDailyLimit : false;
                  const exceedsWeeklyLimit = availInfo ? availInfo.exceedsWeeklyLimit : false;
                  const isOvertime = availInfo
                    ? availInfo.isOvertime || (availInfo.totalMinutesAfterAssign > 480 && !exceedsDailyLimit)
                    : false;

                  // Guard is disabled if checking conflicts OR hard schedule conflict OR exceeds 12h daily limit OR exceeds weekly limit
                  const isDisabled = isCheckingConflicts || hasConflict || exceedsDailyLimit || exceedsWeeklyLimit;

                  return (
                    <div
                      key={guardId}
                      onMouseEnter={(e) => {
                        if (isCheckingConflicts) return;
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredGuardInfo({
                          guard: g,
                          x: rect.left,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredGuardInfo(null)}
                      className={`p-3.5 rounded-xl border transition-all shadow-2xs ${
                        isCheckingConflicts
                          ? "border-slate-200 bg-slate-100/70 opacity-60 pointer-events-none cursor-wait"
                          : isChosen
                            ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20"
                            : hasConflict || exceedsDailyLimit || exceedsWeeklyLimit
                              ? "border-rose-200 bg-rose-50/30 opacity-80 cursor-not-allowed"
                              : isOvertime
                                ? "border-amber-300 bg-amber-50/40 hover:border-amber-400 cursor-pointer"
                                : "border-slate-200 bg-white hover:border-blue-300 hover:bg-slate-50/80 cursor-pointer"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <div className="h-11 w-11 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0 mt-0.5">
                          {guardProfile?.avatar_url ? (
                            <img
                              src={guardProfile.avatar_url}
                              alt={guardProfile.full_name || "Guard"}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <UserRound className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">
                            {guardProfile?.full_name || (dict?.coordinator_swap_modal?.default_guard_name || "Bảo vệ")}
                          </h5>
                          <p className="text-[11px] text-slate-500 truncate">
                            {guardProfile?.phone_number || (dict?.coordinator_swap_modal?.no_phone || "Chưa cập nhật SĐT")}
                          </p>

                          {/* Notable Skills badges */}
                          {Array.isArray(g.notable_skills) && g.notable_skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {g.notable_skills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center rounded bg-blue-50 border border-blue-200 px-1.5 py-0.2 text-[10px] font-semibold text-blue-900"
                                >
                                  {skill}
                                </span>
                              ))}
                              {g.notable_skills.length > 3 && (
                                <span className="text-[10px] text-slate-400 font-medium self-center">
                                  +{g.notable_skills.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Availability Badges */}
                          <div className="flex flex-wrap gap-1 mt-1.5">
                            {isCheckingConflicts ? (
                              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                                <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                                <span>{dict?.coordinator_swap_modal?.checking_badge || "Đang kiểm tra..."}</span>
                              </span>
                            ) : hasConflict ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                <AlertTriangle className="h-3 w-3 text-rose-600" />
                                <span>{dict?.coordinator_swap_modal?.conflict_badge || "Trùng lịch"}</span>
                              </span>
                            ) : exceedsDailyLimit ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                <AlertTriangle className="h-3 w-3 text-rose-600" />
                                <span>{dict?.coordinator_swap_modal?.exceed_12h_badge || "Vượt 12h/ngày"}</span>
                              </span>
                            ) : exceedsWeeklyLimit ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">
                                <AlertTriangle className="h-3 w-3 text-rose-600" />
                                <span>{dict?.coordinator_swap_modal?.exceed_48h_badge || "Vượt 48h/tuần"}</span>
                              </span>
                            ) : isOvertime ? (
                              <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 border border-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
                                <AlertTriangle className="h-3 w-3 text-amber-600" />
                                <span>{availInfo?.reason || (dict?.coordinator_swap_modal?.overtime_badge_default || "Làm thêm (OT)")}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                                <Check className="h-3 w-3 text-emerald-600" />
                                <span>{dict?.coordinator_swap_modal?.ready_badge || "Sẵn sàng"}</span>
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Select Button */}
                        <button
                          type="button"
                          disabled={isDisabled}
                          onClick={() => !isDisabled && handleSelectGuard(guardId)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            isCheckingConflicts
                              ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                              : isChosen
                                ? "bg-emerald-600 text-white shadow-xs cursor-pointer"
                                : (hasConflict || exceedsDailyLimit || exceedsWeeklyLimit)
                                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                                  : "bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white cursor-pointer"
                          }`}
                        >
                          {isCheckingConflicts
                            ? (dict?.coordinator_swap_modal?.btn_checking || "Đang kiểm tra...")
                            : isChosen
                              ? (dict?.coordinator_swap_modal?.btn_chosen || "Đã chọn")
                              : (hasConflict || exceedsDailyLimit || exceedsWeeklyLimit)
                                ? (dict?.coordinator_swap_modal?.btn_locked || "Bị khóa")
                                : (dict?.coordinator_swap_modal?.btn_select || "Chọn")}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            {dict?.coordinator_swap_modal?.btn_cancel || "Hủy bỏ"}
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleSubmitApprove}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{dict?.coordinator_swap_modal?.btn_submitting || "Đang xử lý đổi ca..."}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{dict?.coordinator_swap_modal?.btn_confirm || "Xác nhận đổi ca"}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Floating Hover Details Popover Card (Same design as CreateShiftModal.tsx) */}
      {hoveredGuardInfo && (
        <div
          className="fixed z-[99999] w-80 rounded-2xl border border-slate-200/90 bg-white/95 p-4 shadow-2xl backdrop-blur-md pointer-events-none transition-all duration-150 animate-in fade-in zoom-in-95 text-left"
          style={{
            top: `${Math.max(16, Math.min(window.innerHeight - 380, hoveredGuardInfo.y - 15))}px`,
            left: `${hoveredGuardInfo.x > 340 ? hoveredGuardInfo.x - 332 : hoveredGuardInfo.x + 360}px`,
          }}
        >
          {(() => {
            const p = getGuardProfile(hoveredGuardInfo.guard.profiles);
            const cccd = getIdentityId(hoveredGuardInfo.guard.profiles) || (hoveredGuardInfo.guard as any).cccd_number || "";
            const skills = Array.isArray(hoveredGuardInfo.guard.notable_skills)
              ? hoveredGuardInfo.guard.notable_skills
              : [];
            return (
              <div className="space-y-3">
                {/* Header with Avatar & Name */}
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-blue-600 bg-slate-100 shadow-sm">
                    {p?.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        alt={p.full_name || "Guard"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <UserRound size={24} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate font-bold text-sm text-slate-900">
                      {p?.full_name || (dict?.coordinator_swap_modal?.no_cccd || "Chưa cập nhật")}
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200/60">
                      {dict?.coordinator_swap_modal?.approved_guard_badge || "Bảo vệ đã duyệt"}
                    </span>
                  </div>
                </div>

                {/* Contact & CCCD Info */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <IdCard size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">{dict?.coordinator_swap_modal?.cccd_label || "CCCD:"}</span>
                    <span className="font-semibold text-slate-900">{cccd || (dict?.coordinator_swap_modal?.no_cccd || "Chưa cập nhật")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">{dict?.coordinator_swap_modal?.phone_label || "SĐT:"}</span>
                    <span className="font-medium text-slate-900">{p?.phone_number || (dict?.coordinator_swap_modal?.no_phone || "Chưa cập nhật SĐT")}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">{dict?.coordinator_swap_modal?.email_label || "Email:"}</span>
                    <span className="truncate font-medium text-slate-900">{p?.email || (dict?.coordinator_swap_modal?.no_email || "Chưa cập nhật")}</span>
                  </div>
                  {(hoveredGuardInfo.guard.height_cm || hoveredGuardInfo.guard.weight_kg) && (
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-blue-700 shrink-0" />
                      <span className="text-slate-500 font-medium">{dict?.coordinator_swap_modal?.physical_label || "Thể chất:"}</span>
                      <span className="font-medium text-slate-900">
                        {hoveredGuardInfo.guard.height_cm ? `${hoveredGuardInfo.guard.height_cm} cm` : "—"} · {hoveredGuardInfo.guard.weight_kg ? `${hoveredGuardInfo.guard.weight_kg} kg` : "—"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Notable Skills */}
                <div className="border-t border-slate-100 pt-2.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Award size={13} className="text-blue-700" />
                    <span>
                      {(dict?.coordinator_swap_modal?.skills_label || "Kỹ năng nổi bật ({count}):").replace("{count}", String(skills.length))}
                    </span>
                  </div>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                      {skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-md bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-900"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400 italic">{dict?.coordinator_swap_modal?.no_skills || "Chưa cập nhật kỹ năng."}</p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}
