import React, { useState } from "react";
import { X, FileText, CheckCircle, Clock } from "lucide-react";
import { Report, REPORT_TYPE_LABELS } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CoorReportDetailModalProps {
  report: Report;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: string) => Promise<void>;
}

export function CoorReportDetailModal({ report, onClose, onUpdateStatus }: CoorReportDetailModalProps) {
  const { dict } = useTranslation();
  const [updating, setUpdating] = useState(false);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> {dict.report?.filters?.status_resolved}
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> {dict.report?.filters?.status_in_progress}
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle className="w-3.5 h-3.5" /> {dict.report?.filters?.status_closed}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> {dict.report?.filters?.status_pending}
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

  const handleStatusChange = async (newStatus: string) => {
    if (updating) return;
    setUpdating(true);
    try {
      await onUpdateStatus(report.id, newStatus);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
      <div className="bg-white rounded-xl border border-outline-variant max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Modal header */}
        <div className="bg-slate-50 border-b border-outline-variant/60 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-primary">
            <FileText className="w-5 h-5 shrink-0" />
            <h3 className="font-bold text-on-surface text-lg font-headline">
              {dict.report?.detail?.title} {report.report_code || report.id}
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
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.current_status}</span>
              <div className="mt-1">{getStatusBadge(report.status)}</div>
            </div>
            {/* Quick status change buttons */}
            <div className="flex gap-2">
              {report.status === "PENDING" && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {dict.report?.detail?.btn_accept}
                </button>
              )}
              {(report.status === "PENDING" || report.status === "IN_PROGRESS") && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange("RESOLVED")}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {dict.report?.detail?.btn_resolve}
                </button>
              )}
              {report.status === "RESOLVED" && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange("CLOSED")}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-600 hover:bg-slate-700 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {dict.report?.detail?.btn_close_report}
                </button>
              )}
              {(report.status === "CLOSED" || report.status === "RESOLVED") && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange("IN_PROGRESS")}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-500 hover:bg-amber-600 text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  {dict.report?.detail?.btn_reopen}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_customer}</span>
              <p className="font-semibold text-on-surface">
                {report.customer_name || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_phone}</span>
              <p className="font-semibold text-on-surface">
                {report.customer_phone || "N/A"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_contract}</span>
              <p className="font-semibold text-on-surface">
                {report.contract_code || "N/A"}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_issue}</span>
              <p className="font-semibold text-on-surface">
                {report.type ? (REPORT_TYPE_LABELS[report.type] || report.type) : (dict.report?.detail?.no_type ?? "Unclassified")}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_description}</span>
            <p className="text-on-surface bg-slate-50 border border-slate-100 p-3 rounded-lg leading-relaxed text-xs whitespace-pre-wrap">
              {report.description || (dict.report?.detail?.no_desc ?? "(No detailed description)")}
            </p>
          </div>

          {report.image_url && (
            <div className="space-y-1">
              <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_image}</span>
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
            <span className="text-xs text-on-surface-variant font-medium">{dict.report?.detail?.field_sent_at}</span>
            <p className="text-xs font-semibold text-on-surface-variant">{formatDate(report.created_at)}</p>
          </div>
        </div>

        {/* Modal footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-primary hover:bg-[#023b7e] active:scale-95 text-white transition-all rounded text-sm font-semibold shadow-md cursor-pointer font-body"
          >
            {dict.report?.detail?.btn_close}
          </button>
        </div>
      </div>
    </div>
  );
}
