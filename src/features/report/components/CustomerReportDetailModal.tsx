import React from "react";
import { X, FileText, CheckCircle, Clock, Users, User } from "lucide-react";
import { Report, REPORT_TYPE_LABELS } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";
import { formatTime } from "@/utils/dateTime";

interface CustomerReportDetailModalProps {
  report: Report;
  onClose: () => void;
}

export function CustomerReportDetailModal({ report, onClose }: CustomerReportDetailModalProps) {
  const { dict } = useTranslation();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> {dict.report.filters.status_resolved}
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> {dict.report.filters.status_in_progress}
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle className="w-3.5 h-3.5" /> {dict.report.filters.status_closed}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> {dict.report.filters.status_pending}
          </span>
        );
    }
  };

  const getGuardStatusBadge = (status?: string | null) => {
    if (!status) return null;
    const s = status.toLowerCase();
    const guardStatusDict = dict.report?.guard_status;

    switch (s) {
      case "completed":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            {guardStatusDict?.completed || "Completed"}
          </span>
        );
      case "checkout":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            {guardStatusDict?.checkout || "Checked Out"}
          </span>
        );
      case "assigned":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            {guardStatusDict?.assigned || "Assigned"}
          </span>
        );
      case "late":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            {guardStatusDict?.late || "Late"}
          </span>
        );
      case "absent":
        return (
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
            {guardStatusDict?.absent || "Absent"}
          </span>
        );
      default:
        return (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  const formatDate = (isoString: string) => {
    if (!isoString) return "N/A";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "N/A";
    return `${d.toLocaleDateString("vi-VN")} ${d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-xl border border-outline-variant max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="bg-slate-50 border-b border-outline-variant/60 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-on-surface text-lg font-headline">
              {dict.report.modal.detail_title} {report.report_code || report.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-6 space-y-4 font-body text-sm overflow-y-auto flex-1">
          <div className="pb-3 border-b border-slate-100">
            <span className="text-xs text-on-surface-variant font-medium">{dict.report.modal.status}</span>
            <div className="mt-1">{getStatusBadge(report.status)}</div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">{dict.report.modal.related_contract}</span>
            <p className="font-semibold text-on-surface">
              {report.contract_code || "N/A"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">{dict.report.modal.issue_type}</span>
            <p className="font-semibold text-on-surface">
              {report.type ? (REPORT_TYPE_LABELS[report.type] || report.type) : dict.report.table.unclassified}
            </p>
          </div>

          {/* Related shift info */}
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs text-on-surface-variant font-medium flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                {dict.report?.detail?.field_shift || "Ca trực liên quan"}
              </span>
              {report.shift_start_time && report.shift_end_time && (
                <span className="text-xs font-medium text-slate-600 bg-white px-2.5 py-0.5 rounded border border-slate-200">
                  {formatTime(report.shift_start_time)} – {formatTime(report.shift_end_time)}
                </span>
              )}
            </div>

            {report.shift_name || report.shift_id ? (
              <>
                <div className="font-bold text-on-surface text-sm text-indigo-700">
                  {report.shift_name || dict.report?.table?.shift || "Ca trực"}
                </div>

                {/* Assigned Guards List */}
                <div className="pt-2 border-t border-slate-200/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      {dict.report?.detail?.shift_guards || "Bảo vệ ca trực"}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 bg-slate-200/60 px-2 py-0.5 rounded-full">
                      {report.guards?.length || 0} {dict.report?.detail?.guards_count || "bảo vệ"}
                    </span>
                  </div>

                  {report.guards && report.guards.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {report.guards.map((g, idx) => (
                        <div
                          key={g.guard_id || idx}
                          className="bg-white border border-slate-200/80 rounded-lg p-2.5 flex items-center justify-between gap-2 shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="w-7 h-7 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0 overflow-hidden">
                              {g.avatar_url ? (
                                <img src={g.avatar_url} alt={g.guard_name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-blue-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-800 truncate">{g.guard_name}</p>
                            </div>
                          </div>
                          {getGuardStatusBadge(g.status)}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic bg-white/60 p-2 rounded border border-dashed border-slate-200 text-center">
                      {dict.report?.detail?.no_guards_assigned || "Chưa có bảo vệ nào được phân công trong ca này"}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-400 italic pt-0.5">
                {dict.report?.detail?.no_shift || "Không gắn với ca trực cụ thể"}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">{dict.report.modal.detail_desc}</span>
            <p className="text-on-surface bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed text-xs whitespace-pre-wrap">
              {report.description || dict.report.modal.no_desc}
            </p>
          </div>

          {report.image_url && (
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">{dict.report.modal.attachment}</span>
              <div className="border border-outline-variant rounded-lg overflow-hidden max-h-60 flex items-center justify-center bg-slate-50">
                <img
                  src={report.image_url}
                  alt="Attached evidence"
                  className="max-h-60 object-contain w-full"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">Thời gian gửi</span>
            <p className="text-xs font-semibold text-on-surface-variant">{formatDate(report.created_at)}</p>
          </div>


        </div>

        {/* Modal footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-semibold shadow-md cursor-pointer font-body"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
