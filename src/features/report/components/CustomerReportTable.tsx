import React from "react";
import { ChevronRight, ShieldAlert, Trash2, CheckCircle, Clock } from "lucide-react";
import { Report, REPORT_TYPE_LABELS } from "../types";

interface CustomerReportTableProps {
  reports: Report[];
  onViewDetail: (report: Report) => void;
}

export function CustomerReportTable({ reports, onViewDetail }: CustomerReportTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" /> Đã giải quyết
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Đang xử lý
          </span>
        );
      case "CLOSED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle className="w-3.5 h-3.5" /> Đã đóng
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5" /> Chờ tiếp nhận
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

  if (reports.length === 0) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-16 text-center shadow-2xs">
        <ShieldAlert className="w-12 h-12 text-on-surface-variant/40 mx-auto mb-4" />
        <h3 className="font-bold text-on-surface text-base">Không tìm thấy báo cáo nào</h3>
        <p className="text-xs text-on-surface-variant mt-1.5 max-w-sm mx-auto leading-relaxed">
          Bạn chưa có báo cáo phản ánh nào hoặc bộ lọc tìm kiếm của bạn không khớp với kết quả nào.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 font-body">
      {reports.map((report) => (
        <div
          key={report.id}
          onClick={() => onViewDetail(report)}
          className="bg-white hover:bg-slate-50/50 border border-outline-variant/50 rounded-xl p-5 shadow-2xs hover:shadow-xs transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative group"
        >
          <div className="space-y-2 flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-primary font-bold bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                {report.report_code || report.id}
              </span>
              <span className="text-xs text-on-surface-variant/80 font-medium">
                Hợp đồng: <span className="font-semibold text-on-surface">{report.contract_code || "N/A"}</span>
              </span>
              <span className="text-xs text-on-surface-variant/50">•</span>
              <span className="text-xs text-on-surface-variant/80 font-medium">
                Vấn đề khiếu nại: <span className="font-bold text-on-surface">{report.type ? (REPORT_TYPE_LABELS[report.type] || report.type) : "Chưa phân loại"}</span>
              </span>
            </div>

            <p className="text-sm text-on-surface line-clamp-2 leading-relaxed">
              {report.description || "(Không có mô tả)"}
            </p>

            <div className="flex items-center gap-3 pt-1 text-[11px] text-on-surface-variant/75 font-medium">
              <span>Thời gian gửi: {formatDate(report.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
            <div className="flex flex-col items-end gap-1.5">
              {getStatusBadge(report.status)}
            </div>
            <ChevronRight className="w-5 h-5 text-on-surface-variant/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
          </div>

        </div>
      ))}
    </div>
  );
}
