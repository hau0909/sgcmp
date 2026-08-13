"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Hourglass,
  User,
  Clock,
  MapPin,
  Loader2,
  FileText,
  AlertCircle,
} from "lucide-react";
import { requestGetCompanySwapRequests } from "@/features/shift/api/shift-swap.api";
import { ShiftSwapRequestWithDetails } from "@/features/shift/repository/shift-swap.repository";
import { CoordinatorSwapModal } from "@/features/shift/components/CoordinatorSwapModal";
import { RejectSwapModal } from "@/features/shift/components/RejectSwapModal";
import { formatDate } from "@/utils/dateTime";
import { useTranslation } from "@/components/providers/LanguageProvider";

export default function CoordinatorShiftRequestsPage() {
  const { dict, locale } = useTranslation();
  const [requests, setRequests] = useState<ShiftSwapRequestWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal states
  const [approveModalRequest, setApproveModalRequest] = useState<ShiftSwapRequestWithDetails | null>(null);
  const [rejectModalRequestId, setRejectModalRequestId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await requestGetCompanySwapRequests();
      if (res.success && res.data) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (filterStatus !== "ALL" && req.status !== filterStatus) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const requesterName = req.requester_name?.toLowerCase() || "";
        const reason = req.reason?.toLowerCase() || "";
        return requesterName.includes(q) || reason.includes(q);
      }

      return true;
    });
  }, [requests, filterStatus, searchQuery]);

  const counts = useMemo(() => {
    return {
      ALL: requests.length,
      PENDING: requests.filter((r) => r.status === "PENDING").length,
      APPROVED: requests.filter((r) => r.status === "APPROVED").length,
      REJECTED: requests.filter((r) => r.status === "REJECTED").length,
    };
  }, [requests]);

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

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 space-y-6">
      {/* Page Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">
            {dict?.coor_shift_requests?.page_title || "Quản lý yêu cầu đổi ca"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {dict?.coor_shift_requests?.page_subtitle || "Xét duyệt các yêu cầu xin đổi ca từ bảo vệ và chỉ định bảo vệ thay thế."}
          </p>
        </div>

        <button
          type="button"
          onClick={fetchRequests}
          className="flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-blue-800 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>{dict?.coor_shift_requests?.refresh_btn || "Làm mới"}</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          {[
            { key: "ALL", label: dict?.coor_shift_requests?.tab_all || "Tất cả", count: counts.ALL },
            { key: "PENDING", label: dict?.coor_shift_requests?.tab_pending || "Chờ duyệt", count: counts.PENDING },
            { key: "APPROVED", label: dict?.coor_shift_requests?.tab_approved || "Đã duyệt", count: counts.APPROVED },
            { key: "REJECTED", label: dict?.coor_shift_requests?.tab_rejected || "Từ chối", count: counts.REJECTED },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterStatus(tab.key as any)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                filterStatus === tab.key
                  ? "bg-white text-blue-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                  filterStatus === tab.key
                    ? "bg-blue-100 text-blue-800"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px]">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={dict?.coor_shift_requests?.search_placeholder || "Tìm theo tên bảo vệ, lý do..."}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-100 transition-all"
          />
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-3" />
          <span className="text-xs font-semibold">{dict?.coor_shift_requests?.loading_msg || "Đang tải danh sách yêu cầu đổi ca..."}</span>
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-700">{dict?.coor_shift_requests?.empty_title || "Không có yêu cầu đổi ca nào"}</h3>
          <p className="text-xs text-slate-400 mt-1">
            {dict?.coor_shift_requests?.empty_desc || "Chưa có bảo vệ nào tạo yêu cầu thuộc bộ lọc hiện tại."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((req) => {
            const createdDate = formatDate(req.created_at);

            const statusConfig = {
              PENDING: {
                label: dict?.coor_shift_requests?.status_pending || "Chờ duyệt",
                bg: "bg-amber-50 text-amber-700 border-amber-200",
                icon: Hourglass,
              },
              APPROVED: {
                label: dict?.coor_shift_requests?.status_approved || "Đã duyệt",
                bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
                icon: CheckCircle2,
              },
              REJECTED: {
                label: dict?.coor_shift_requests?.status_rejected || "Đã từ chối",
                bg: "bg-rose-50 text-rose-700 border-rose-200",
                icon: XCircle,
              },
              CANCELLED: {
                label: dict?.coor_shift_requests?.status_cancelled || "Đã hủy",
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
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                      {req.requester_avatar ? (
                        <img
                          src={req.requester_avatar}
                          alt={req.requester_name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <User className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{req.requester_name}</h3>
                      <p className="text-[11px] text-slate-500">
                        {dict?.coor_shift_requests?.phone_label || "SĐT:"} {req.requester_phone || "—"} · {dict?.coor_shift_requests?.sent_at_label || "Gửi lúc"} {createdDate}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-auto ${statusConfig.bg}`}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />
                    <span>{statusConfig.label}</span>
                  </span>
                </div>

                {/* Reason */}
                <div className="text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700">{dict?.coor_shift_requests?.reason_prefix || "Lý do xin đổi ca:"} </span>
                  <span className="text-slate-800 italic">"{req.reason}"</span>
                </div>

                {/* Rejection reason if rejected */}
                {req.status === "REJECTED" && req.rejection_reason && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-800">
                    <span className="font-bold">{dict?.coor_shift_requests?.rejection_reason_prefix || "Lý do từ chối:"} </span>
                    <span>{req.rejection_reason}</span>
                  </div>
                )}

                {/* Requested Shifts */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    {dict?.coor_shift_requests?.requested_shifts_title || "Các ca làm xin đổi"} ({req.items.length}):
                  </span>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {req.items.map((item, idx) => {
                      const shiftInfo = req.shift_details?.[item.shift_id];
                      const replacementInfo = item.replacement_guard_id
                        ? req.replacement_guards_details?.[item.replacement_guard_id]
                        : null;

                      const times = shiftInfo ? formatTimeRange(shiftInfo.start_time, shiftInfo.end_time) : null;

                      return (
                        <div
                          key={idx}
                          className="p-3 rounded-xl border border-slate-200 bg-white text-xs space-y-1.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-slate-900 truncate">
                              {shiftInfo?.shift_name || `Ca #${item.shift_id.slice(0, 8)}`}
                            </span>
                            {times && (
                              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md shrink-0">
                                {times.dateFormatted}
                              </span>
                            )}
                          </div>

                          {times && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px]">
                              <Clock className="h-3 w-3 text-slate-400" />
                              <span>{times.startTime} - {times.endTime}</span>
                            </div>
                          )}

                          {shiftInfo?.location && (
                            <div className="flex items-center gap-1 text-slate-500 text-[11px] truncate">
                              <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                              <span className="truncate">{shiftInfo.location}</span>
                            </div>
                          )}

                          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between">
                            <span className="text-[10px] text-slate-400">{dict?.coor_shift_requests?.replaced_by_label || "Thay thế bởi:"}</span>
                            {replacementInfo ? (
                              <span className="font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                {replacementInfo.full_name}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">{dict?.coor_shift_requests?.unassigned || "Chưa chọn"}</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                {req.status === "PENDING" && (
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setRejectModalRequestId(req.request_id)}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>{dict?.coor_shift_requests?.btn_reject || "Từ chối"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setApproveModalRequest(req)}
                      className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{dict?.coor_shift_requests?.btn_approve_and_select || "Duyệt & Chọn bảo vệ"}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal */}
      <RejectSwapModal
        isOpen={!!rejectModalRequestId}
        requestId={rejectModalRequestId}
        onClose={() => setRejectModalRequestId(null)}
        onSuccess={fetchRequests}
      />

      {/* Approve & Assign Modal */}
      <CoordinatorSwapModal
        isOpen={!!approveModalRequest}
        request={approveModalRequest}
        onClose={() => setApproveModalRequest(null)}
        onSuccess={fetchRequests}
      />
    </div>
  );
}
