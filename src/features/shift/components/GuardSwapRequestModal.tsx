"use client";

import React, { useEffect, useState } from "react";
import {
  X,
  RefreshCw,
  CalendarDays,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Hourglass,
  Send,
  FileText,
  History,
  PlusCircle,
  Loader2,
} from "lucide-react";
import {
  requestGetEligibleSwapShifts,
  requestCreateSwapRequest,
  requestGetMySwapRequests,
} from "../api/shift-swap.api";
import { EligibleShiftForSwap, ShiftSwapRequestWithDetails } from "../repository/shift-swap.repository";
import { formatDate } from "@/utils/dateTime";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface GuardSwapRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GuardSwapRequestModal({ isOpen, onClose }: GuardSwapRequestModalProps) {
  const { dict, locale } = useTranslation();
  const [activeTab, setActiveTab] = useState<"create" | "history">("create");

  // Tab 1 state
  const [eligibleShifts, setEligibleShifts] = useState<EligibleShiftForSwap[]>([]);
  const [loadingShifts, setLoadingShifts] = useState(false);
  const [selectedShiftIds, setSelectedShiftIds] = useState<string[]>([]);
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Tab 2 state
  const [myRequests, setMyRequests] = useState<ShiftSwapRequestWithDetails[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setSuccessMsg(null);
      if (activeTab === "create") {
        fetchEligibleShifts();
      } else {
        fetchMyRequests();
      }
    }
  }, [isOpen, activeTab]);

  const fetchEligibleShifts = async () => {
    setLoadingShifts(true);
    try {
      const res = await requestGetEligibleSwapShifts();
      if (res.success && res.data) {
        setEligibleShifts(res.data);
      } else {
        setEligibleShifts([]);
      }
    } catch {
      setEligibleShifts([]);
    } finally {
      setLoadingShifts(false);
    }
  };

  const fetchMyRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await requestGetMySwapRequests();
      if (res.success && res.data) {
        setMyRequests(res.data);
      } else {
        setMyRequests([]);
      }
    } catch {
      setMyRequests([]);
    } finally {
      setLoadingRequests(false);
    }
  };

  const toggleShiftSelect = (shiftId: string) => {
    setSelectedShiftIds((prev) =>
      prev.includes(shiftId) ? prev.filter((id) => id !== shiftId) : [...prev, shiftId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (selectedShiftIds.length === 0) {
      setErrorMsg(dict?.guard_swap_modal?.val_select_at_least_one || "Vui lòng chọn ít nhất 1 ca làm cần đổi.");
      return;
    }

    if (!reason.trim()) {
      setErrorMsg(dict?.guard_swap_modal?.val_enter_reason || "Vui lòng nhập lý do xin đổi ca.");
      return;
    }

    // Build items array matching selected shifts
    const items = selectedShiftIds.map((shiftId) => {
      const shiftObj = eligibleShifts.find((s) => s.shift_id === shiftId);
      return {
        assignment_id: shiftObj?.assignment_id || "",
        shift_id: shiftId,
        replacement_guard_id: null,
      };
    });

    try {
      setSubmitting(true);
      const res = await requestCreateSwapRequest({
        reason: reason.trim(),
        items,
      });

      if (res.success) {
        setSuccessMsg(dict?.guard_swap_modal?.msg_success || "Gửi yêu cầu đổi ca thành công! Vui lòng chờ điều phối viên xét duyệt.");
        setSelectedShiftIds([]);
        setReason("");
        fetchEligibleShifts();
        setTimeout(() => {
          setActiveTab("history");
        }, 1200);
      } else {
        setErrorMsg(res.message || (dict?.guard_swap_modal?.msg_submit_error || "Gửi yêu cầu thất bại."));
      }
    } catch (err: any) {
      setErrorMsg(err?.message || (dict?.guard_swap_modal?.msg_error_generic || "Đã xảy ra lỗi khi gửi yêu cầu."));
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md">
              <RefreshCw className="h-5 w-5 text-blue-200" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {dict?.guard_swap_modal?.title || "Yêu cầu đổi ca làm"}
              </h3>
              <p className="text-xs text-blue-100">
                {dict?.guard_swap_modal?.subtitle || "Gửi yêu cầu đổi ca cho điều phối viên xét duyệt"}
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

        {/* Tab Header Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("create")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
              activeTab === "create"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <PlusCircle className="h-4 w-4" />
            <span>{dict?.guard_swap_modal?.tab_create || "Tạo yêu cầu đổi ca"}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-bold transition-all cursor-pointer ${
              activeTab === "history"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="h-4 w-4" />
            <span>{dict?.guard_swap_modal?.tab_history || "Lịch sử gửi yêu cầu"}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === "create" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Guard Shift Select Section */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  {dict?.guard_swap_modal?.select_shifts_label || "Chọn ca trực bạn muốn đổi"} <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-3 italic">
                  {dict?.guard_swap_modal?.select_shifts_hint || "* Chỉ hiển thị các ca trực mà bạn gửi yêu cầu trước khi ca bắt đầu ít nhất 24 giờ."}
                </p>

                {loadingShifts ? (
                  <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                    <span className="text-xs">{dict?.guard_swap_modal?.loading_shifts || "Đang tải ca làm của bạn..."}</span>
                  </div>
                ) : eligibleShifts.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
                    <CalendarDays className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      {dict?.guard_swap_modal?.empty_eligible_title || "Không có ca trực nào thỏa điều kiện"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {dict?.guard_swap_modal?.empty_eligible_desc || "Bạn chưa có ca làm được phân công hoặc các ca trực diễn ra trong vòng 24h tới."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {eligibleShifts.map((shift) => {
                      const { startTime, endTime, dateFormatted } = formatTimeRange(
                        shift.start_time,
                        shift.end_time
                      );
                      const isSelected = selectedShiftIds.includes(shift.shift_id);

                      return (
                        <div
                          key={shift.shift_id}
                          onClick={() => toggleShiftSelect(shift.shift_id)}
                          className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? "border-blue-600 bg-blue-50/60 shadow-xs"
                              : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}} // handled by parent div click
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <span className="font-bold text-sm text-slate-900 truncate">
                                {shift.shift_name || (dict?.guard_swap_modal?.default_shift_name || "Ca trực bảo vệ")}
                              </span>
                              <span className="shrink-0 font-medium text-xs text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                                {dateFormatted}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {startTime} - {endTime}
                              </span>
                              {shift.location && (
                                <span className="flex items-center gap-1 truncate max-w-[240px]">
                                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                  <span className="truncate">{shift.location}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Reason Textarea */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  {dict?.guard_swap_modal?.reason_label || "Lý do đổi ca"} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder={dict?.guard_swap_modal?.reason_placeholder || "Ghi rõ lý do bạn xin đổi ca (ví dụ: bận việc gia đình đột xuất, bị ốm, trùng lịch học...)"}
                  className="w-full rounded-xl border border-slate-300 p-3 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {dict?.guard_swap_modal?.btn_cancel || "Hủy bỏ"}
                </button>
                <button
                  type="submit"
                  disabled={submitting || eligibleShifts.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{dict?.guard_swap_modal?.btn_submitting || "Đang gửi..."}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{dict?.guard_swap_modal?.btn_submit || "Gửi yêu cầu đổi ca"}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {activeTab === "history" && (
            <div className="space-y-3">
              {loadingRequests ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                  <span className="text-xs">{dict?.guard_swap_modal?.loading_history || "Đang tải lịch sử yêu cầu..."}</span>
                </div>
              ) : myRequests.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50">
                  <FileText className="mx-auto h-10 w-10 text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">
                    {dict?.guard_swap_modal?.empty_history_title || "Bạn chưa gửi yêu cầu đổi ca nào"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {dict?.guard_swap_modal?.empty_history_desc || "Các yêu cầu bạn tạo sẽ hiển thị tại đây."}
                  </p>
                </div>
              ) : (
                myRequests.map((req) => {
                  const createdDate = formatDate(req.created_at);

                  const statusConfig = {
                    PENDING: {
                      label: dict?.guard_swap_modal?.status_pending || "Chờ xét duyệt",
                      bg: "bg-amber-50 text-amber-700 border-amber-200",
                      icon: Hourglass,
                    },
                    APPROVED: {
                      label: dict?.guard_swap_modal?.status_approved || "Đã duyệt",
                      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      icon: CheckCircle2,
                    },
                    REJECTED: {
                      label: dict?.guard_swap_modal?.status_rejected || "Từ chối",
                      bg: "bg-rose-50 text-rose-700 border-rose-200",
                      icon: XCircle,
                    },
                    CANCELLED: {
                      label: dict?.guard_swap_modal?.status_cancelled || "Đã hủy",
                      bg: "bg-slate-50 text-slate-600 border-slate-200",
                      icon: AlertCircle,
                    },
                  }[req.status] || {
                    label: req.status,
                    bg: "bg-slate-50 text-slate-700 border-slate-200",
                    icon: AlertCircle,
                  };

                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={req.request_id}
                      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs hover:border-slate-300 transition-all"
                    >
                      {/* Top bar */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <span className="text-xs text-slate-500 font-medium">
                          {dict?.guard_swap_modal?.created_at_label || "Ngày tạo:"} <strong className="text-slate-800">{createdDate}</strong>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusConfig.bg}`}
                        >
                          <StatusIcon className="h-3.5 w-3.5" />
                          <span>{statusConfig.label}</span>
                        </span>
                      </div>

                      {/* Reason */}
                      <div className="text-xs">
                        <span className="font-bold text-slate-700">{dict?.guard_swap_modal?.reason_prefix || "Lý do xin đổi:"} </span>
                        <span className="text-slate-600 italic">"{req.reason}"</span>
                      </div>

                      {/* Rejection reason if rejected */}
                      {req.status === "REJECTED" && req.rejection_reason && (
                        <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100 text-xs text-rose-800">
                          <span className="font-bold">{dict?.guard_swap_modal?.rejection_reason_prefix || "Lý do từ chối:"} </span>
                          <span>{req.rejection_reason}</span>
                        </div>
                      )}

                      {/* Shifts list in item */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {dict?.guard_swap_modal?.shifts_list_title || "DANH SÁCH CA XIN ĐỔI:"}
                        </span>
                        <div className="grid gap-2">
                          {req.items.map((item, idx) => {
                            const shiftInfo = req.shift_details?.[item.shift_id];
                            const replacementInfo = item.replacement_guard_id
                              ? req.replacement_guards_details?.[item.replacement_guard_id]
                              : null;

                            const times = shiftInfo
                              ? formatTimeRange(shiftInfo.start_time, shiftInfo.end_time)
                              : null;

                            return (
                              <div
                                key={idx}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs"
                              >
                                <div className="space-y-0.5">
                                  <p className="font-bold text-slate-800">
                                    {shiftInfo?.shift_name || `Ca trực #${item.shift_id.slice(0, 8)}`}
                                  </p>
                                  {times && (
                                    <p className="text-slate-500">
                                      {times.dateFormatted} · {times.startTime} - {times.endTime}
                                    </p>
                                  )}
                                </div>

                                {replacementInfo ? (
                                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-md shrink-0">
                                    <span className="text-[10px] text-emerald-600 font-semibold uppercase">{dict?.guard_swap_modal?.replaced_by_prefix || "THAY BỞI:"}</span>
                                    <span className="font-bold">{replacementInfo.full_name}</span>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">
                                    {dict?.guard_swap_modal?.unassigned || "Chưa phân công"}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
