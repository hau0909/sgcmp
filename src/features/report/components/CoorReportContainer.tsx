import React, { useState, useEffect } from "react";
import { ClipboardList, CheckCircle, X } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Report } from "../types";
import { CoorReportFilters } from "./CoorReportFilters";
import { CoorReportTable } from "./CoorReportTable";
import { CoorReportDetailModal } from "./CoorReportDetailModal";
import {
  requestGetCompanyReports,
  requestUpdateReportStatus,
} from "../api/report.api";

export function CoorReportContainer() {
  const companyId = useAuthStore((state) => state.company_id) || "";

  // UI state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Data state
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Interaction state
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Fetch reports from API
  const fetchReports = async () => {
    if (!companyId) return;
    setIsLoadingReports(true);
    try {
      const result = await requestGetCompanyReports({
        companyId,
        page: 1,
        limit: 100,
        search: searchQuery || undefined,
        status: filterStatus !== "ALL" ? filterStatus : undefined,
        type: filterType !== "ALL" ? filterType : undefined,
      });
      setReports(result.reports || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách báo cáo cho coordinator:", err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [companyId, searchQuery, filterType, filterStatus]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const updated = await requestUpdateReportStatus(id, newStatus);
      showToast("Cập nhật trạng thái báo cáo khiếu nại thành công.");
      
      // Update local state for reports
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus as any } : r))
      );

      // Update local state for selected report if open
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport((prev) => prev ? { ...prev, status: newStatus as any } : null);
      }
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái báo cáo:", err);
      showToast("Cập nhật trạng thái báo cáo thất bại.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-6 space-y-6 relative py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-3 rounded-lg shadow-xl flex items-center gap-3 z-50 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-white/60 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight font-headline">
              Quản lý báo cáo & Phản ánh
            </h1>
            <p className="text-sm text-on-surface-variant mt-0.5 font-body">
              Xem và giải quyết các báo cáo phản ánh chất lượng dịch vụ hoặc các sự cố phát sinh từ phía khách hàng.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Table */}
      <div className="space-y-6 animate-in fade-in duration-200">
        <CoorReportFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {isLoadingReports ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white border border-outline-variant/30 rounded-xl">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="text-xs text-on-surface-variant mt-3 font-medium">Đang tải danh sách báo cáo...</p>
          </div>
        ) : (
          <CoorReportTable
            reports={reports}
            onViewDetail={setSelectedReport}
          />
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <CoorReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
