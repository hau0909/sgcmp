"use client";

import React, { useEffect, useState, useTransition } from "react";
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
} from "lucide-react";
import {
  requestGetReplacementGuards,
  requestUpdateReplacementGuards,
} from "../api/shift.api";
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
};

/**
 * replacementMap: assignmentId -> chosen replacementGuardId (or "" if not yet chosen)
 * activeSlotAssignmentId: which slot the user is currently picking for
 */
export function ShiftDetailModal({ open, onClose, shift }: ShiftDetailModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isDispatchPanelOpen, setIsDispatchPanelOpen] = useState(false);

  const [contractGuards, setContractGuards] = useState<GuardCandidate[]>([]);
  const [outsideContractGuards, setOutsideContractGuards] = useState<GuardCandidate[]>([]);
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);

  // Map: assignmentId → selected replacementGuardId
  const [replacementMap, setReplacementMap] = useState<Record<string, string>>({});
  // Which eligible slot the user is currently assigning a replacement to
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const [lastAutoOpenedShiftId, setLastAutoOpenedShiftId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset dispatch panel when modal closes
  useEffect(() => {
    if (!open) {
      setIsDispatchPanelOpen(false);
      setReplacementMap({});
      setActiveSlotId(null);
      setErrorMessage("");
      setSearchQuery("");
      setLastAutoOpenedShiftId(null);
    }
  }, [open]);

  // ─── Computed helpers ────────────────────────────────────────────────────────

  const canDispatchReplacement = (assign: ShiftAssignment) => {
    const isShiftEnded = new Date(shift.end_time).getTime() < new Date().getTime();
    if (isShiftEnded) return false;
    return (
      assign.status === "absent" ||
      (assign.status === "late" && assign.check_in_time === null)
    );
  };

  const eligibleAssignments = shift.assignments.filter(canDispatchReplacement);

  const getStatusLabel = (assign: ShiftAssignment) => {
    if (assign.status === "assigned") return "Đã phân công";
    if (assign.status === "completed") return "Hoàn thành";
    if (assign.status === "late") {
      return assign.check_in_time ? "Đã điểm danh trễ" : "Đi trễ - chưa điểm danh";
    }
    return "Vắng mặt";
  };

  const getStatusStyle = (assign: ShiftAssignment) => {
    if (assign.status === "assigned") return "bg-yellow-50 text-yellow-700 border-yellow-200";
    if (assign.status === "completed") return "bg-emerald-50 text-emerald-700 border-emerald-200";
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
        sa.status === "completed" || (sa.status === "late" && sa.check_in_time !== null);
      if (isOriginalActive) count++;
      if (sa.replacement_guard_ids) {
        count += sa.replacement_guard_ids.length;
      }
    });
    return count;
  };

  const actualGuards = getActualGuardsCount();
  const missingGuards = Math.max(0, shift.required_guards - actualGuards);

  // ─── Dispatch panel open ────────────────────────────────────────────────────

  const handleOpenDispatchPanel = async () => {
    if (eligibleAssignments.length === 0) return;

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
      setErrorMessage(err?.message || "Không thể tải danh sách bảo vệ thay thế.");
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Auto-open dispatch panel when modal mounts if there are guards to replace
  useEffect(() => {
    if (open && eligibleAssignments.length > 0 && lastAutoOpenedShiftId !== shift.shift_id) {
      setLastAutoOpenedShiftId(shift.shift_id);
      handleOpenDispatchPanel();
    }
  }, [open, shift.shift_id, eligibleAssignments.length, lastAutoOpenedShiftId]);

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
        `Vui lòng chọn bảo vệ thay thế cho tất cả ${eligibleAssignments.length} vị trí.`
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
          throw new Error((failed as any).message || "Một số vị trí cập nhật thất bại.");
        }

        // Success
        window.dispatchEvent(new CustomEvent("refresh-shifts"));
        onClose();
      } catch (err: any) {
        setErrorMessage(err?.message || "Cập nhật bảo vệ thay thế thất bại.");
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      {/* ── Center Modal: Shift Details ── */}
      <div
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
        style={{ maxHeight: "90vh" }}
      >
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
            <div>
              <h3 className="text-base font-bold text-slate-800">Chi tiết ca trực</h3>
              <p className="text-xs text-slate-500 font-medium">
                {shift.shift_name || "Ca trực"}
              </p>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-5">
            {/* Shift info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-2.5">
                <Clock size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Thời gian</p>
                  <p className="text-xs font-semibold text-slate-800">
                    {formatTime(shift.start_time)} - {formatTime(shift.end_time)}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Địa điểm</p>
                  <p
                    className="text-xs font-semibold text-slate-800 truncate"
                    title={shift.contract_address}
                  >
                    {shift.contract_address || "Chưa có địa chỉ"}
                  </p>
                  {shift.location && (
                    <p className="text-[10px] text-slate-500 font-medium">
                      Khu vực: {shift.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Guard stats */}
            <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-700">Nhân sự ca trực</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Thực tế:{" "}
                  <span className="font-bold text-blue-600">{actualGuards}</span> /{" "}
                  {shift.required_guards} bảo vệ
                </p>
              </div>
              {missingGuards > 0 ? (
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-100">
                  Thiếu {missingGuards} vị trí
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100">
                  Đủ nhân sự
                </span>
              )}
            </div>

            {/* Assignments List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Danh sách bảo vệ trực
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
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isDispatchPanelOpen && activeSlotId === assign.assignment_id
                              ? "bg-blue-100 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                            }`}
                        >
                          <UserRound size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {assign.guard_name}
                          </p>
                          <span className="text-[10px] text-slate-400 font-medium">
                            Bảo vệ chính
                          </span>
                        </div>
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
                              ? "✓ Đã chọn"
                              : "Chọn thay thế"}
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
                            Nhân sự thay thế đã gán:
                          </p>
                          <div className="space-y-1">
                            {assign.replacement_guards.map((rep) => (
                              <div
                                key={rep.guard_id}
                                className="flex items-center justify-between text-xs"
                              >
                                <span className="font-semibold text-slate-700">
                                  • {rep.full_name}
                                </span>
                                {rep.phone_number && (
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    {rep.phone_number}
                                  </span>
                                )}
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
                onClick={handleOpenDispatchPanel}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase rounded-lg shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
              >
                <UserCheck size={14} />
                Điều phối thay thế ({eligibleAssignments.length} vị trí)
                <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right Sidebar: Dispatch Panel ── */}
      {isDispatchPanelOpen && (
        <div className="fixed right-0 top-0 bottom-0 h-full w-[380px] border-l border-slate-200 flex flex-col bg-white shadow-2xl z-[10000] animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 bg-slate-50">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Điều phối bảo vệ thay thế
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                {activeSlotId
                  ? `Đang chọn cho: `
                  : "Tất cả vị trí đã được chọn"}
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
                  Vị trí {i + 1}
                </button>
              ))}
              <span className="text-[10px] text-slate-400 ml-auto font-medium">
                {Object.values(replacementMap).filter(Boolean).length}/{eligibleAssignments.length} đã chọn
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
                placeholder="Tìm theo tên hoặc số điện thoại..."
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
                <span className="text-xs font-medium">Đang tải danh sách bảo vệ...</span>
              </div>
            ) : (
              <>
                {/* Contract Guards */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Bảo vệ trong hợp đồng ({filteredContractGuards.length})
                    </p>
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 font-bold px-1.5 py-0.5 rounded">
                      Trong HĐ
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
                                {g.phone_number || "Chưa có SĐT"}
                              </p>
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
                        Không có bảo vệ khả dụng trong hợp đồng.
                      </p>
                    )}
                  </div>
                </div>

                {/* Outside Contract Guards */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Bảo vệ ngoài hợp đồng ({filteredOutsideContractGuards.length})
                    </p>
                    <span className="text-[9px] bg-slate-100 text-slate-600 border border-slate-200 font-bold px-1.5 py-0.5 rounded">
                      Ngoài HĐ
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
                                {g.phone_number || "Chưa có SĐT"}
                              </p>
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
                        Không có bảo vệ ngoài hợp đồng rảnh hôm nay.
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
              Xác nhận điều phối ({eligibleAssignments.length} vị trí)
            </button>
            <button
              disabled={isPending}
              onClick={onClose}
              className="w-full py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase rounded-lg transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}
