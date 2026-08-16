"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { createPortal } from "react-dom";
import {
  X,
  Clock,
  MapPin,
  Search,
  UserRound,
  AlertCircle,
  Check,
  UserCheck,
  ChevronRight,
  ArrowRight,
  Award,
  IdCard,
  Phone,
  Mail,
  Activity,
} from "lucide-react";
import {
  requestGetReplacementGuards,
  requestUpdateReplacementGuards,
} from "../api/shift.api";
import { requestGetAllGuards } from "@/features/guards/api/guard.api";
import type { GuardListItem } from "@/features/guards/type";
import type { ShiftWithAssignments, ShiftAssignment } from "../type";
import { formatTime } from "@/utils/dateTime";

type ShiftDetailModalProps = {
  open: boolean;
  onClose: () => void;
  shift: ShiftWithAssignments;
};

type GuardCandidate = {
  guard_id: string;
  user_id: string;
  full_name: string;
  phone_number: string | null;
  avatar_url: string | null;
  email: string;
  height_cm?: number | null;
  weight_kg?: number | null;
  notable_skills?: string[] | null;
  profiles?: any;
};

const getGuardProfile = (profiles: GuardListItem["profiles"]) => {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0] ?? null;
  return profiles;
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

/**
 * replacementMap: assignmentId -> chosen replacementGuardId (or "" if not yet chosen)
 * activeSlotAssignmentId: which slot the user is currently picking for
 */
export function ShiftDetailModal({ open, onClose, shift }: ShiftDetailModalProps) {
  const { dict } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [isDispatchPanelOpen, setIsDispatchPanelOpen] = useState(false);

  const [contractGuards, setContractGuards] = useState<GuardCandidate[]>([]);
  const [outsideContractGuards, setOutsideContractGuards] = useState<GuardCandidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  const [guardsMap, setGuardsMap] = useState<Record<string, GuardListItem>>({});
  const [hoveredGuardInfo, setHoveredGuardInfo] = useState<{
    guard: GuardListItem;
    x: number;
    y: number;
  } | null>(null);

  // Map: assignmentId → selected replacementGuardId
  const [replacementMap, setReplacementMap] = useState<Record<string, string>>({});
  // Which eligible slot the user is currently assigning a replacement to
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lastAutoOpenedShiftId, setLastAutoOpenedShiftId] = useState<string | null>(null);

  // ─── Computed helpers ────────────────────────────────────────────────────────

  const canDispatchReplacement = (assign: ShiftAssignment) => {
    return (
      assign.status === "absent" ||
      (assign.status === "late" && assign.check_in_time === null)
    );
  };

  const eligibleAssignments = shift.assignments.filter(canDispatchReplacement);

  const shiftEndTimeMs = new Date(
    typeof shift.end_time === "string" ? shift.end_time.replace(" ", "T") : shift.end_time
  ).getTime();

  const isShiftEnded =
    (!isNaN(shiftEndTimeMs) && shiftEndTimeMs < Date.now()) ||
    (shift as any).status === "completed" ||
    (shift as any).status === "checkout" ||
    (shift as any).status === "ended";

  const isAllDispatched =
    eligibleAssignments.length > 0 &&
    eligibleAssignments.every(
      (a) => a.replacement_guard_ids && a.replacement_guard_ids.length > 0
    );

  const getStatusLabel = (assign: ShiftAssignment) => {
    if (assign.status === "assigned") return (dict?.coor_schedules?.assigned || "ĐÃ PHÂN CÔNG").toUpperCase();
    if (assign.status === "completed") return (dict?.coor_schedules?.on_duty || dict?.coor_schedules?.completed || "ĐANG TRỰC").toUpperCase();
    if (assign.status === "checkout") return (dict?.coor_schedules?.checkout || "HOÀN THÀNH").toUpperCase();
    if (assign.status === "late") {
      return assign.check_in_time
        ? (dict?.shift_detail_modal?.checked_in_late || "ĐIỂM DANH TRỄ").toUpperCase()
        : (dict?.shift_detail_modal?.late_not_checked_in || "ĐI TRỄ CHƯA ĐIỂM DANH").toUpperCase();
    }
    return (dict?.coor_schedules?.absent || "VẮNG MẶT").toUpperCase();
  };

  const getStatusStyle = (assign: ShiftAssignment) => {
    if (assign.status === "assigned") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (assign.status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (assign.status === "checkout") return "bg-slate-100 text-slate-600 border-slate-200";
    if (assign.status === "late") {
      return assign.check_in_time
        ? "bg-orange-50 text-orange-700 border-orange-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
    }
    return "bg-red-50 text-red-700 border-red-200";
  };

  const getActualGuardsCount = () => {
    let count = 0;
    shift.assignments.forEach((sa) => {
      const isOriginalActive =
        sa.status === "completed" ||
        sa.status === "checkout" ||
        (sa.status === "late" && sa.check_in_time !== null);
      if (isOriginalActive) count++;
      if (sa.replacement_guard_ids) {
        count += sa.replacement_guard_ids.length;
      }
    });
    return count;
  };

  const actualGuards = getActualGuardsCount();
  const missingGuards = Math.max(0, shift.required_guards - actualGuards);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch company guards map when modal is open
  useEffect(() => {
    if (open) {
      requestGetAllGuards({ limit: 100, approvalStatus: "approved" })
        .then((res) => {
          if (res.data) {
            const rawGuards: GuardListItem[] = Array.isArray(res.data)
              ? res.data
              : (res.data as any)?.guards || [];
            const map: Record<string, GuardListItem> = {};
            rawGuards.forEach((g) => {
              if (g.guard_id) map[g.guard_id] = g;
              if (g.user_id) map[g.user_id] = g;
              const p = getGuardProfile(g.profiles);
              if (p?.user_id) map[p.user_id] = g;
            });
            setGuardsMap(map);
          }
        })
        .catch((err) => console.error("Error fetching guards map:", err));
    } else {
      setHoveredGuardInfo(null);
    }
  }, [open]);

  const resolveGuardListItem = (
    id: string,
    fallback: {
      full_name?: string;
      phone_number?: string | null;
      email?: string | null;
      avatar_url?: string | null;
      height_cm?: number | null;
      weight_kg?: number | null;
      notable_skills?: string[] | null;
      profiles?: any;
    }
  ): GuardListItem => {
    if (id && guardsMap[id]) {
      return guardsMap[id];
    }
    const p = fallback.profiles
      ? (Array.isArray(fallback.profiles) ? fallback.profiles[0] : fallback.profiles)
      : {
          full_name: fallback.full_name ?? null,
          phone_number: fallback.phone_number ?? null,
          email: fallback.email ?? null,
          avatar_url: fallback.avatar_url ?? null,
        };
    return {
      guard_id: id,
      user_id: id,
      height_cm: fallback.height_cm ?? null,
      weight_kg: fallback.weight_kg ?? null,
      notable_skills: fallback.notable_skills ?? [],
      profiles: p,
    };
  };

  // Reset dispatch panel when modal closes or shift has ended
  useEffect(() => {
    if (!open || isShiftEnded) {
      setIsDispatchPanelOpen(false);
    }
    if (!open) {
      setReplacementMap({});
      setActiveSlotId(null);
      setErrorMessage("");
      setSearchQuery("");
      setLastAutoOpenedShiftId(null);
      setHoveredGuardInfo(null);
    }
  }, [open, isShiftEnded]);

  // ─── Dispatch panel open ────────────────────────────────────────────────────

  const handleOpenDispatchPanel = async () => {
    if (isShiftEnded || eligibleAssignments.length === 0) return;

    setIsDispatchPanelOpen(true);
    setErrorMessage("");
    setSearchQuery("");

    // Initialize replacementMap: preload existing replacements
    const initMap: Record<string, string> = {};
    eligibleAssignments.forEach((a) => {
      const existingId =
        a.replacement_guard_ids && a.replacement_guard_ids.length > 0
          ? a.replacement_guard_ids[0]
          : "";
      initMap[a.assignment_id] = existingId;
    });
    setReplacementMap(initMap);

    // Set first unassigned slot as active
    const firstUnassigned = eligibleAssignments.find(
      (a) => !initMap[a.assignment_id]
    );
    setActiveSlotId(firstUnassigned?.assignment_id ?? eligibleAssignments[0].assignment_id);

    // Load candidate list using the first eligible assignment
    try {
      setIsLoadingCandidates(true);
      const res = await requestGetReplacementGuards({
        shiftId: shift.shift_id,
        assignmentId: eligibleAssignments[0].assignment_id,
      });
      if (res.success && res.data) {
        setContractGuards(res.data.contractGuards);
        setOutsideContractGuards(res.data.outsideContractGuards);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || (dict?.shift_detail_modal?.load_guards_error || "Không thể tải danh sách bảo vệ thay thế."));
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Auto-open dispatch panel when modal mounts if there are guards to replace and shift is active
  useEffect(() => {
    if (
      open &&
      !isShiftEnded &&
      eligibleAssignments.length > 0 &&
      lastAutoOpenedShiftId !== shift.shift_id
    ) {
      setLastAutoOpenedShiftId(shift.shift_id);
      handleOpenDispatchPanel();
    }
  }, [open, isShiftEnded, shift.shift_id, eligibleAssignments.length, lastAutoOpenedShiftId]);

  // ─── Guard selection ────────────────────────────────────────────────────────

  const alreadyAssignedGuardIds = Object.entries(replacementMap)
    .filter(([assignId, guardId]) => assignId !== activeSlotId && guardId !== "")
    .map(([, guardId]) => guardId);

  const handleSelectGuard = (guardId: string) => {
    if (!activeSlotId) return;

    setReplacementMap((prev) => {
      const current = prev[activeSlotId];
      // Toggle: if clicking already selected guard for this slot, deselect
      const next = current === guardId ? "" : guardId;
      const updated = { ...prev, [activeSlotId]: next };

      // Auto-advance active slot to next unassigned (only when assigning, not deselecting)
      if (next !== "") {
        const unassigned = eligibleAssignments.find(
          (a) => a.assignment_id !== activeSlotId && !updated[a.assignment_id]
        );
        if (unassigned) {
          // We'll set activeSlotId after state update via a delayed effect trick
          // Use a ref-free approach: just stay on current slot, user can click next slot manually
        }
      }
      return updated;
    });

    // Auto-advance to next empty slot
    const currentIndex = eligibleAssignments.findIndex(
      (a) => a.assignment_id === activeSlotId
    );
    const remaining = eligibleAssignments.slice(currentIndex + 1);
    const nextEmpty = remaining.find((a) => !replacementMap[a.assignment_id] || replacementMap[a.assignment_id] === "" || replacementMap[a.assignment_id] === guardId);
    if (nextEmpty && replacementMap[activeSlotId] !== guardId) {
      // Only advance if we are assigning (not deselecting)
      setActiveSlotId(nextEmpty.assignment_id);
    }
  };

  // ─── Confirm dispatch ───────────────────────────────────────────────────────

  const allSlotsAssigned = eligibleAssignments.every(
    (a) => replacementMap[a.assignment_id] && replacementMap[a.assignment_id] !== ""
  );

  const handleConfirmReplacement = () => {
    if (!allSlotsAssigned) {
      setErrorMessage(
        (dict?.shift_detail_modal?.select_all_error || "Vui lòng chọn bảo vệ thay thế cho tất cả {0} vị trí.").replace("{0}", String(eligibleAssignments.length))
      );
      return;
    }

    startTransition(async () => {
      try {
        setErrorMessage("");

        const promises = eligibleAssignments.map((assign) => {
          const chosenGuardId = replacementMap[assign.assignment_id];
          return requestUpdateReplacementGuards({
            shiftId: shift.shift_id,
            assignmentId: assign.assignment_id,
            replacementGuardIds: [chosenGuardId],
          });
        });

        const results = await Promise.all(promises);
        const failed = results.find((r) => !r.success);
        if (failed) {
          throw new Error((failed as any).message || (dict?.shift_detail_modal?.update_failed || "Một số vị trí cập nhật thất bại."));
        }

        // Success
        window.dispatchEvent(new CustomEvent("refresh-shifts"));
        onClose();
      } catch (err: any) {
        setErrorMessage(err?.message || (dict?.shift_detail_modal?.update_failed || "Cập nhật bảo vệ thay thế thất bại."));
      }
    });
  };

  // ─── Candidate filtering ────────────────────────────────────────────────────

  const filteredContractGuards = contractGuards.filter(
    (g) =>
      !alreadyAssignedGuardIds.includes(g.guard_id) &&
      (g.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.phone_number && g.phone_number.includes(searchQuery)))
  );

  const filteredOutsideContractGuards = outsideContractGuards.filter(
    (g) =>
      !alreadyAssignedGuardIds.includes(g.guard_id) &&
      (g.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.phone_number && g.phone_number.includes(searchQuery)))
  );

  const allCandidates = [...contractGuards, ...outsideContractGuards];

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!open || !mounted) return null;

  return createPortal(
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm transition-all duration-300 ${isDispatchPanelOpen ? "md:justify-start md:pl-10 lg:pl-20 xl:pl-40" : "justify-center"
      }`}>
      {/* ── Center Modal: Shift Details ── */}
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
          <div>
            <h3 className="text-base font-bold text-slate-800">{dict?.guard_shift_detail?.title || "Chi tiết ca trực"}</h3>
            <p className="text-xs text-slate-500 font-medium">
              {shift.shift_name || (dict?.shift_week?.shift_name || "Ca trực")}
            </p>
          </div>
          {!isDispatchPanelOpen && (
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Shift info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5 min-w-0">
              <Clock size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{dict?.shift_week?.shift_time || "Thời gian"}</p>
                <p className="text-xs font-semibold text-slate-800">
                  {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5 min-w-0">
              <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">{dict?.shift_week?.location || "Địa điểm"}</p>
                <p
                  className="text-xs font-semibold text-slate-800 break-words whitespace-normal leading-relaxed"
                  title={shift.contract_address}
                >
                  {shift.contract_address || (dict?.shift_week?.unupdated || "Chưa có địa chỉ")}
                </p>
                {shift.location && (
                  <p className="text-[10px] text-slate-500 font-medium break-words whitespace-normal leading-normal mt-0.5">
                    {dict?.shift_week?.position || "Khu vực"}: {shift.location}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Guard stats */}
          <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-700">{dict?.shift_detail_modal?.shift_staffing || "Nhân sự ca trực"}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {dict?.shift_detail_modal?.actual || "Thực tế"}:{" "}
                <span className="font-bold text-blue-600">{actualGuards}</span> /{" "}
                {shift.required_guards} {dict?.guard_shift_detail?.guards_count?.replace("{0}", "").trim() || "bảo vệ"}
              </p>
            </div>
            {missingGuards > 0 ? (
              <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-100">
                {(dict?.shift_detail_modal?.missing_slots || "Thiếu {0} vị trí").replace("{0}", String(missingGuards))}
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                {dict?.shift_detail_modal?.full_staffing || "Đủ nhân sự"}
              </span>
            )}
          </div>

          {/* Assignments List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {dict?.guard_shift_detail?.guard_list || "Danh sách bảo vệ trực"}
            </h4>
            <div className="space-y-2">
              {shift.assignments.map((assign) => (
                <div
                  key={assign.assignment_id}
                  className={`rounded-lg border p-3 flex flex-col gap-2.5 transition-colors ${isDispatchPanelOpen && activeSlotId === assign.assignment_id
                    ? "border-blue-300 bg-blue-50/30"
                    : isDispatchPanelOpen &&
                      replacementMap[assign.assignment_id]
                      ? "border-emerald-200 bg-emerald-50/20"
                      : "border-slate-200 bg-white"
                    }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const gItem = resolveGuardListItem(assign.guard_id, {
                          full_name: assign.guard_name,
                        });
                        setHoveredGuardInfo({
                          guard: gItem,
                          x: rect.left,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredGuardInfo(null)}
                      className="flex items-center gap-2.5 min-w-0 cursor-pointer"
                    >
                      {(() => {
                        const gItem = resolveGuardListItem(assign.guard_id, { full_name: assign.guard_name });
                        const p = getGuardProfile(gItem.profiles);
                        const phone = p?.phone_number || (dict?.shift_detail_modal?.no_phone || "Chưa có SĐT");
                        const skills = Array.isArray(gItem.notable_skills) ? gItem.notable_skills : [];
                        return (
                          <>
                            <div
                              className={`h-9 w-9 rounded-full flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 ${isDispatchPanelOpen && activeSlotId === assign.assignment_id
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-600"
                                }`}
                            >
                              {p?.avatar_url ? (
                                <img src={p.avatar_url} alt={assign.guard_name} className="h-full w-full object-cover" />
                              ) : (
                                <UserRound size={16} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">
                                {assign.guard_name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {phone}
                              </p>
                              {(() => {
                                const visibleSkills = skills.slice(0, 2);
                                const remainingCount = skills.length - 2;
                                if (skills.length === 0) return null;
                                return (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {visibleSkills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100"
                                      >
                                        <Award size={10} className="mr-0.5 text-blue-600 shrink-0" />
                                        {skill}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                                        +{remainingCount}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${getStatusStyle(
                          assign
                        )}`}
                      >
                        {getStatusLabel(assign)}
                      </span>

                      {/* Show dispatch panel slot indicator */}
                      {isDispatchPanelOpen && canDispatchReplacement(assign) && (
                        <button
                          onClick={() => setActiveSlotId(assign.assignment_id)}
                          className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${activeSlotId === assign.assignment_id
                            ? "bg-blue-600 text-white"
                            : replacementMap[assign.assignment_id]
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                          {replacementMap[assign.assignment_id]
                            ? (dict?.shift_detail_modal?.selected_badge || "✓ Đã chọn")
                            : (dict?.shift_detail_modal?.select_replacement || "Chọn thay thế")}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Show selected replacement for this slot */}
                  {isDispatchPanelOpen &&
                    canDispatchReplacement(assign) &&
                    replacementMap[assign.assignment_id] && (
                      <div className="flex items-center gap-2 bg-emerald-50/70 rounded px-2.5 py-1.5 border border-emerald-100">
                        <ArrowRight size={12} className="text-emerald-600 shrink-0" />
                        <span className="text-[11px] font-bold text-emerald-700">
                          {(() => {
                            const g = allCandidates.find(
                              (c) => c.guard_id === replacementMap[assign.assignment_id]
                            ) || (assign.replacement_guards || []).find(
                              (rg) => rg.guard_id === replacementMap[assign.assignment_id]
                            );
                            return g ? g.full_name : replacementMap[assign.assignment_id];
                          })()}
                        </span>
                      </div>
                    )}

                  {/* Show existing replacements (already dispatched before) */}
                  {!isDispatchPanelOpen &&
                    assign.replacement_guards &&
                    assign.replacement_guards.length > 0 && (
                      <div className="bg-slate-50 rounded p-2.5 border border-slate-100 space-y-1.5">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">
                          {dict?.shift_detail_modal?.dispatched_replacements || "Nhân sự thay thế đã gán:"}
                        </p>
                        <div className="space-y-1">
                          {assign.replacement_guards.map((rep) => (
                            <div
                              key={rep.guard_id}
                              onMouseEnter={(e) => {
                                const rect = e.currentTarget.getBoundingClientRect();
                                const gItem = resolveGuardListItem(rep.guard_id, {
                                  full_name: rep.full_name,
                                  phone_number: rep.phone_number,
                                  avatar_url: rep.avatar_url,
                                });
                                setHoveredGuardInfo({
                                  guard: gItem,
                                  x: rect.left,
                                  y: rect.top,
                                });
                              }}
                              onMouseLeave={() => setHoveredGuardInfo(null)}
                              className="flex flex-col gap-1 text-xs cursor-pointer p-1 rounded hover:bg-slate-100/70 transition-colors"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-semibold text-slate-700">
                                  • {rep.full_name}
                                </span>
                                {rep.phone_number && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {rep.phone_number}
                                  </span>
                                )}
                              </div>
                              {(() => {
                                const gItem = resolveGuardListItem(rep.guard_id, {
                                  full_name: rep.full_name,
                                  phone_number: rep.phone_number,
                                  avatar_url: rep.avatar_url,
                                });
                                const skills = Array.isArray(gItem.notable_skills) ? gItem.notable_skills : [];
                                const visibleSkills = skills.slice(0, 2);
                                const remainingCount = skills.length - 2;
                                if (skills.length === 0) return null;
                                return (
                                  <div className="flex flex-wrap gap-1 pl-3">
                                    {visibleSkills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 border border-blue-100"
                                      >
                                        <Award size={10} className="mr-0.5 text-blue-600 shrink-0" />
                                        {skill}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                                        +{remainingCount}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer: Dispatch button */}
        {eligibleAssignments.length > 0 && !isDispatchPanelOpen && (
          <div className="border-t border-slate-200 p-4 bg-slate-50 shrink-0">
            <button
              disabled={isShiftEnded}
              onClick={handleOpenDispatchPanel}
              className={`w-full py-2.5 text-xs font-bold uppercase rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 ${
                isShiftEnded
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                  : isAllDispatched
                  ? "bg-purple-600 hover:bg-purple-700 text-white hover:shadow"
                  : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow"
              }`}
            >
              <UserCheck size={14} />
              {isShiftEnded
                ? (dict?.shift_detail_modal?.shift_ended || "Ca trực đã kết thúc")
                : isAllDispatched
                ? (dict?.shift_detail_modal?.update_replacement_btn || "Đổi bảo vệ thay thế ({0} vị trí)").replace("{0}", String(eligibleAssignments.length))
                : (dict?.shift_detail_modal?.dispatch_replacement_btn || "Điều phối thay thế ({0} vị trí)").replace("{0}", String(eligibleAssignments.length))}
              {!isShiftEnded && <ChevronRight size={14} />}
            </button>
          </div>
        )}
      </div>

      {/* ── Right Sidebar: Dispatch Panel ── */}
      {isDispatchPanelOpen && (
        <div className="fixed right-4 top-0 bottom-0 my-4 w-[380px] flex flex-col bg-white shadow-2xl z-[10000] rounded-2xl overflow-hidden animate-in slide-in-from-right duration-300" style={{ maxHeight: "calc(100vh - 2rem)" }}>
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {dict?.shift_detail_modal?.dispatch_header || "Điều phối bảo vệ thay thế"}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeSlotId
                  ? `${dict?.shift_detail_modal?.selecting_for || "Đang chọn cho:"} `
                  : (dict?.shift_detail_modal?.all_selected || "Tất cả vị trí đã được chọn")}
                {activeSlotId && (
                  <span className="font-bold text-blue-600">
                    {eligibleAssignments.find((a) => a.assignment_id === activeSlotId)
                      ?.guard_name ?? ""}
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Slot summary */}
          <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 flex-wrap">
              {eligibleAssignments.map((a, i) => (
                <button
                  key={a.assignment_id}
                  onClick={() => setActiveSlotId(a.assignment_id)}
                  className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border transition-colors ${activeSlotId === a.assignment_id
                    ? "bg-blue-600 text-white border-blue-600"
                    : replacementMap[a.assignment_id]
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                    }`}
                >
                  {replacementMap[a.assignment_id] ? (
                    <Check size={9} strokeWidth={3} />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-current inline-block opacity-40" />
                  )}
                  {dict?.guard_shift_detail?.location || "Vị trí"} {i + 1}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 ml-auto font-medium">
                {(dict?.shift_detail_modal?.selected_count || "{0}/{1} đã chọn").replace("{0}", String(Object.values(replacementMap).filter(Boolean).length)).replace("{1}", String(eligibleAssignments.length))}
              </span>
            </div>
          </div>

          {/* Error */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border-b border-rose-100 text-rose-600 text-xs font-semibold flex gap-2 items-start">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Search */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={dict?.shift_detail_modal?.search_placeholder || "Tìm theo tên hoặc số điện thoại..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-slate-300 bg-slate-50/50 outline-none focus:bg-white focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          {/* Candidates */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            {isLoadingCandidates ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-medium">{dict?.shift_detail_modal?.loading_guards || "Đang tải danh sách bảo vệ..."}</span>
              </div>
            ) : (
              <>
                {/* Contract Guards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {(dict?.shift_detail_modal?.contract_guards || "Bảo vệ trong hợp đồng ({0})").replace("{0}", String(filteredContractGuards.length))}
                    </p>
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-1.5 py-0.5 rounded">
                      {dict?.shift_detail_modal?.in_contract || "Trong HĐ"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredContractGuards.length > 0 ? (
                      filteredContractGuards.map((g) => {
                        const isSelectedForActive =
                          activeSlotId && replacementMap[activeSlotId] === g.guard_id;
                        const isSelectedForOther = alreadyAssignedGuardIds.includes(
                          g.guard_id
                        );
                        return (
                          <button
                            key={g.guard_id}
                            disabled={!activeSlotId || isSelectedForOther}
                            onClick={() => handleSelectGuard(g.guard_id)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const gItem = resolveGuardListItem(g.guard_id, {
                                full_name: g.full_name,
                                phone_number: g.phone_number,
                                email: g.email,
                                avatar_url: g.avatar_url,
                                height_cm: g.height_cm,
                                weight_kg: g.weight_kg,
                                notable_skills: g.notable_skills,
                                profiles: g.profiles,
                              });
                              setHoveredGuardInfo({
                                guard: gItem,
                                x: rect.left,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredGuardInfo(null)}
                            className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isSelectedForActive
                              ? "border-blue-400 bg-blue-50"
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                              }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800">
                                {g.full_name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {g.phone_number || (dict?.shift_detail_modal?.no_phone || "Chưa có SĐT")}
                              </p>
                              {(() => {
                                const gItem = resolveGuardListItem(g.guard_id, {
                                  notable_skills: g.notable_skills,
                                });
                                const skills = Array.isArray(gItem.notable_skills) ? gItem.notable_skills : [];
                                const visibleSkills = skills.slice(0, 2);
                                const remainingCount = skills.length - 2;
                                if (skills.length === 0) return null;
                                return (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {visibleSkills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 border border-blue-100"
                                      >
                                        <Award size={9} className="mr-0.5 text-blue-600 shrink-0" />
                                        {skill}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200">
                                        +{remainingCount}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${isSelectedForActive
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-slate-300 bg-white"
                                }`}
                            >
                              {isSelectedForActive && <Check size={10} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-slate-400 italic text-center py-2">
                        {dict?.shift_detail_modal?.no_contract_guards || "Không có bảo vệ khả dụng trong hợp đồng."}
                      </p>
                    )}
                  </div>
                </div>

                {/* Outside Contract Guards */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {(dict?.shift_detail_modal?.outside_guards || "Bảo vệ ngoài hợp đồng ({0})").replace("{0}", String(filteredOutsideContractGuards.length))}
                    </p>
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 font-bold px-1.5 py-0.5 rounded">
                      {dict?.shift_detail_modal?.outside_contract || "Ngoài HĐ"}
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {filteredOutsideContractGuards.length > 0 ? (
                      filteredOutsideContractGuards.map((g) => {
                        const isSelectedForActive =
                          activeSlotId && replacementMap[activeSlotId] === g.guard_id;
                        const isSelectedForOther = alreadyAssignedGuardIds.includes(
                          g.guard_id
                        );
                        return (
                          <button
                            key={g.guard_id}
                            disabled={!activeSlotId || isSelectedForOther}
                            onClick={() => handleSelectGuard(g.guard_id)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const gItem = resolveGuardListItem(g.guard_id, {
                                full_name: g.full_name,
                                phone_number: g.phone_number,
                                email: g.email,
                                avatar_url: g.avatar_url,
                                height_cm: g.height_cm,
                                weight_kg: g.weight_kg,
                                notable_skills: g.notable_skills,
                                profiles: g.profiles,
                              });
                              setHoveredGuardInfo({
                                guard: gItem,
                                x: rect.left,
                                y: rect.top,
                              });
                            }}
                            onMouseLeave={() => setHoveredGuardInfo(null)}
                            className={`w-full flex items-center justify-between text-left p-2.5 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${isSelectedForActive
                              ? "border-blue-400 bg-blue-50"
                              : "border-slate-100 bg-slate-50/50 hover:bg-slate-100/50"
                              }`}
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800">
                                {g.full_name}
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                {g.phone_number || (dict?.shift_detail_modal?.no_phone || "Chưa có SĐT")}
                              </p>
                              {(() => {
                                const gItem = resolveGuardListItem(g.guard_id, {
                                  notable_skills: g.notable_skills,
                                });
                                const skills = Array.isArray(gItem.notable_skills) ? gItem.notable_skills : [];
                                const visibleSkills = skills.slice(0, 2);
                                const remainingCount = skills.length - 2;
                                if (skills.length === 0) return null;
                                return (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {visibleSkills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="inline-flex items-center rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-700 border border-blue-100"
                                      >
                                        <Award size={9} className="mr-0.5 text-blue-600 shrink-0" />
                                        {skill}
                                      </span>
                                    ))}
                                    {remainingCount > 0 && (
                                      <span className="inline-flex items-center rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 border border-slate-200">
                                        +{remainingCount}
                                      </span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                            <div
                              className={`h-4 w-4 rounded border flex items-center justify-center shrink-0 ${isSelectedForActive
                                ? "bg-blue-600 border-blue-600 text-white"
                                : "border-slate-300 bg-white"
                                }`}
                            >
                              {isSelectedForActive && <Check size={10} strokeWidth={3} />}
                            </div>
                          </button>
                        );
                      })
                    ) : (
                      <p className="text-[11px] text-slate-400 italic text-center py-2">
                        {dict?.shift_detail_modal?.no_outside_guards || "Không có bảo vệ ngoài hợp đồng rảnh hôm nay."}
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 flex flex-col gap-2 shrink-0">
            <button
              disabled={isPending || isLoadingCandidates || !allSlotsAssigned}
              onClick={handleConfirmReplacement}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <UserCheck size={14} />
              )}
              {(dict?.shift_detail_modal?.confirm_dispatch || "Xác nhận điều phối ({0} vị trí)").replace("{0}", String(eligibleAssignments.length))}
            </button>
            <button
              disabled={isPending}
              onClick={onClose}
              className="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
            >
              {dict?.shift_detail_modal?.cancel || dict?.common?.cancel || "Hủy"}
            </button>
          </div>
        </div>
      )}

      {/* Floating Hover Details Popover Card */}
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
            const cccd = getIdentityId(hoveredGuardInfo.guard.profiles);
            const skills = Array.isArray(hoveredGuardInfo.guard.notable_skills)
              ? hoveredGuardInfo.guard.notable_skills
              : [];
            const unupdatedText =
              dict?.create_shift_modal?.guard_tooltip_unupdated ||
              (dict?.coor_guards?.unupdated || "Chưa cập nhật");
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
                      {p?.full_name || unupdatedText}
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5 border border-emerald-200/60">
                      {dict?.create_shift_modal?.guard_tooltip_approved || "Bảo vệ đã duyệt"}
                    </span>
                  </div>
                </div>

                {/* Contact & CCCD Info */}
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <IdCard size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">
                      {dict?.create_shift_modal?.guard_tooltip_cccd || "CCCD:"}
                    </span>
                    <span className="font-semibold text-slate-900">{cccd || unupdatedText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">
                      {dict?.create_shift_modal?.guard_tooltip_phone || "SĐT:"}
                    </span>
                    <span className="font-medium text-slate-900">{p?.phone_number || unupdatedText}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-blue-700 shrink-0" />
                    <span className="text-slate-500 font-medium">
                      {dict?.create_shift_modal?.guard_tooltip_email || "Email:"}
                    </span>
                    <span className="truncate font-medium text-slate-900">{p?.email || unupdatedText}</span>
                  </div>
                  {(hoveredGuardInfo.guard.height_cm || hoveredGuardInfo.guard.weight_kg) && (
                    <div className="flex items-center gap-2">
                      <Activity size={14} className="text-blue-700 shrink-0" />
                      <span className="text-slate-500 font-medium">
                        {dict?.create_shift_modal?.guard_tooltip_physical || "Thể chất:"}
                      </span>
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
                      {(dict?.create_shift_modal?.guard_tooltip_skills || "Kỹ năng nổi bật ({0}):").replace("{0}", String(skills.length))}
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
                    <p className="text-[11px] text-slate-400 italic">
                      {dict?.create_shift_modal?.guard_tooltip_no_skills || "Chưa cập nhật kỹ năng."}
                    </p>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>,
    document.body
  );
}
