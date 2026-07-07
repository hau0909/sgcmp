"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Globe,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

import { PublishRequest } from "@/types/PublishRequest";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatDateTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    const hour = String(d.getHours()).padStart(2, "0");
    const minute = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hour}:${minute}`;
  } catch {
    return dateStr;
  }
};

type StatusKey = "pending" | "approved" | "rejected" | string;

const STATUS_CONFIG: Record<
  StatusKey,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    label: "Chờ duyệt",
    bg: "bg-[#fef3c7]",
    text: "text-[#b45309]",
    icon: <Clock className="w-3.5 h-3.5" />,
  },
  approved: {
    label: "Đã duyệt",
    bg: "bg-[#dcfce7]",
    text: "text-[#166534]",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
  },
  rejected: {
    label: "Từ chối",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    icon: <XCircle className="w-3.5 h-3.5" />,
  },
};

const getStatusConfig = (status: string) => {
  const key = (status || "").toLowerCase();
  return (
    STATUS_CONFIG[key] ?? {
      label: status.toUpperCase(),
      bg: "bg-[#f3f4f6]",
      text: "text-[#374151]",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    }
  );
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function PublishRequestTable() {
  const [requests, setRequests] = React.useState<PublishRequest[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "pending" | "approved" | "rejected">("all");

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/publish-requests");
      const data = await res.json();
      if (res.ok && data.publish_requests) {
        setRequests(data.publish_requests);
      } else {
        console.error("Lỗi khi tải danh sách yêu cầu công khai:", data.error);
      }
    } catch (err) {
      console.error("Lỗi kết nối API:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    Promise.resolve().then(() => {
      fetchData();
    });
  }, [fetchData]);

  // Filter requests based on activeFilter
  const filteredRequests = React.useMemo(() => {
    switch (activeFilter) {
      case "pending":
        return requests.filter((r) => (r.status || "").toLowerCase() === "pending");
      case "approved":
        return requests.filter((r) => (r.status || "").toLowerCase() === "approved");
      case "rejected":
        return requests.filter((r) => (r.status || "").toLowerCase() === "rejected");
      case "all":
      default:
        return requests;
    }
  }, [requests, activeFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  // Reset currentPage to 1 if activeFilter/totalPages changes and currentPage exceeds new totalPages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      Promise.resolve().then(() => {
        setCurrentPage(1);
      });
    }
  }, [totalPages, currentPage]);

  const paginatedRequests = React.useMemo(() => {
    return filteredRequests.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredRequests, currentPage, itemsPerPage]);

  // Stats
  const pendingCount = React.useMemo(() => requests.filter((r) => (r.status || "").toLowerCase() === "pending").length, [requests]);
  const approvedCount = React.useMemo(() => requests.filter((r) => (r.status || "").toLowerCase() === "approved").length, [requests]);
  const rejectedCount = React.useMemo(() => requests.filter((r) => (r.status || "").toLowerCase() === "rejected").length, [requests]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          <span className="animate-pulse">
            Đang tải danh sách yêu cầu công khai...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <nav className="flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors">Doanh nghiệp</span>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-primary font-bold">Yêu cầu công khai</span>
          </nav>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Danh sách yêu cầu công khai
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Xem xét và xử lý các yêu cầu đăng công khai thông tin công ty lên hệ thống.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={fetchData}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all text-on-surface cursor-pointer shadow-sm"
          >
            <RefreshCw className="text-on-surface-variant w-3.5 h-3.5" />
            <span>Làm mới</span>
          </button>
        </div>
      </div>

      {/* Status Filter Buttons */}
      <div className="flex flex-wrap gap-2.5 items-center justify-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-sm">
        {/* Chờ duyệt */}
        <button
          onClick={() => { setActiveFilter("pending"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "pending"
              ? "bg-[#fef3c7] text-[#b45309] border-[#b45309]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Clock className={`w-4.5 h-4.5 shrink-0 ${activeFilter === "pending" ? "text-[#b45309]" : "text-primary"}`} />
          <span>Chờ duyệt</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "pending" ? "bg-[#b45309] text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {pendingCount}
          </span>
        </button>

        {/* Đã phê duyệt */}
        <button
          onClick={() => { setActiveFilter("approved"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "approved"
              ? "bg-[#dcfce7] text-[#166534] border-[#22c55e]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-[#166534]" />
          <span>Đã phê duyệt</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "approved" ? "bg-[#166534] text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {approvedCount}
          </span>
        </button>

        {/* Từ chối */}
        <button
          onClick={() => { setActiveFilter("rejected"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "rejected"
              ? "bg-[#fee2e2] text-[#991b1b] border-error"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <XCircle className="w-4.5 h-4.5 shrink-0 text-error" />
          <span>Từ chối</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "rejected" ? "bg-error text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {rejectedCount}
          </span>
        </button>

        {/* Tất cả yêu cầu */}
        <button
          onClick={() => { setActiveFilter("all"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "all"
              ? "bg-[#eff4ff] text-primary border-primary"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Globe className={`w-4.5 h-4.5 shrink-0 ${activeFilter === "all" ? "text-primary" : "text-on-surface-variant"}`} />
          <span>Tất cả yêu cầu</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "all" ? "bg-primary text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {requests.length}
          </span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm w-full">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#d5e3ff] border-b border-outline-variant">
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[70px] text-center whitespace-nowrap">
                  STT
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[240px]">
                  Tên công ty
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[160px] text-center whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[180px] text-center whitespace-nowrap">
                  Ngày giờ
                </th>
                <th className="py-3.5 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] text-right whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant bg-white">
              {paginatedRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-16 text-center text-on-surface-variant font-medium"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <Globe className="w-10 h-10 text-on-surface-variant/40" />
                      <span>Chưa có yêu cầu công khai nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRequests.map((req, idx) => {
                  const companyName = req.companies?.company_name ?? "—";
                  const statusCfg = getStatusConfig(req.status);

                  return (
                    <tr
                      key={req.request_id}
                      className="hover:bg-surface-container transition-colors group"
                    >
                      {/* STT */}
                      <td className="px-6 py-4.5 text-center text-on-surface-variant font-mono text-[13px] whitespace-nowrap">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>

                      {/* Company Name */}
                      <td className="px-6 py-4.5 min-w-[240px]">
                        <Link
                          href={`/publish-requests/${req.request_id}`}
                          className="font-semibold text-[#1f1f1f] hover:text-primary transition-colors cursor-pointer block leading-snug text-[14px]"
                        >
                          {companyName}
                        </Link>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 ${statusCfg.bg} ${statusCfg.text} text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap shadow-xs`}
                        >
                          {statusCfg.icon}
                          {statusCfg.label}
                        </span>
                      </td>

                      {/* Date Time */}
                      <td className="px-6 py-4.5 text-center font-mono text-on-surface-variant text-[13px] whitespace-nowrap">
                        {formatDateTime(req.requested_at)}
                      </td>

                      {/* Action */}
                      <td className="px-6 py-4.5 text-right whitespace-nowrap">
                        <Link
                          href={`/publish-requests/${req.request_id}`}
                          className="text-secondary font-semibold text-xs hover:text-primary inline-flex items-center gap-1 transition-colors whitespace-nowrap px-2 py-1 rounded hover:bg-surface-container-high"
                        >
                          Xem chi tiết <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <p className="text-on-surface-variant text-sm font-medium">
            Hiển thị {filteredRequests.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRequests.length)} trên {filteredRequests.length} kết quả
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredRequests.length === 0}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
              <button
                key={num}
                onClick={() => setCurrentPage(num)}
                className={`w-8 h-8 flex items-center justify-center rounded border text-sm font-medium transition-colors cursor-pointer ${
                  currentPage === num
                    ? "border-primary bg-primary text-white"
                    : "border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {num}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages <= 1}
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
