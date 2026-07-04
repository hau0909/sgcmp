"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Filter,
  Download,
  FileClock,
  ShieldCheck,
  ShieldAlert,
  ExternalLink,
  Files
} from "lucide-react";
import { requestGetRegistrations } from "../api/registration.api";
import { RegistrationWithCompany } from "../types";

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};



export default function RegistrationTable() {
  const [registrations, setRegistrations] = React.useState<RegistrationWithCompany[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeFilter, setActiveFilter] = React.useState<"all" | "pending" | "approved" | "error">("all");

  // Filter registrations based on activeFilter
  const filteredRegistrations = React.useMemo(() => {
    switch (activeFilter) {
      case "pending":
        return registrations.filter((r) => r.status === "pending");
      case "approved":
        return registrations.filter((r) => r.status === "approved");
      case "error":
        return registrations.filter((r) => r.status === "rejected" || r.status === "action_required");
      case "all":
      default:
        return registrations;
    }
  }, [registrations, activeFilter]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredRegistrations.length / itemsPerPage);

  // Reset currentPage to 1 if activeFilter/totalPages changes and currentPage exceeds new totalPages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedRegistrations = React.useMemo(() => {
    return filteredRegistrations.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredRegistrations, currentPage, itemsPerPage]);

  // Calculate dynamic stats
  const pendingCount = React.useMemo(() => registrations.filter((r) => r.status === "pending").length, [registrations]);
  const approvedCount = React.useMemo(() => registrations.filter((r) => r.status === "approved").length, [registrations]);
  const errorCount = React.useMemo(() => registrations.filter((r) => r.status === "rejected" || r.status === "action_required").length, [registrations]);

  React.useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const res = await requestGetRegistrations();
        setRegistrations(res.registrations || []);
      } catch (err: any) {
        console.error("Error fetching registrations:", err);
        setError(err.message || "Không thể tải danh sách đăng ký");
      } finally {
        setLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          Đang tải danh sách đăng ký...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-error font-medium">
          Lỗi: {error}
        </div>
      </div>
    );
  }

  // Calculations and hooks are declared above

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <nav className="flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors">Doanh nghiệp</span>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-primary font-bold">Đăng ký doanh nghiệp</span>
          </nav>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Danh sách đăng ký doanh nghiệp
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Quản lý và xét duyệt hồ sơ đăng ký mới của các tổ chức.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all text-on-surface cursor-pointer shadow-sm">
            <Filter className="text-on-surface-variant w-3.5 h-3.5" />
            <span>Bộ lọc</span>
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
          <FileClock className={`w-4.5 h-4.5 shrink-0 ${activeFilter === "pending" ? "text-[#b45309]" : "text-primary"}`} />
          <span>Chờ duyệt</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "pending" ? "bg-[#b45309] text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {pendingCount}
          </span>
        </button>

        {/* Đã duyệt */}
        <button
          onClick={() => { setActiveFilter("approved"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "approved"
              ? "bg-[#dcfce7] text-[#166534] border-[#22c55e]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-[#166534]" />
          <span>Đã duyệt</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "approved" ? "bg-[#166534] text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {approvedCount}
          </span>
        </button>

        {/* Hồ sơ lỗi */}
        <button
          onClick={() => { setActiveFilter("error"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "error"
              ? "bg-error-container text-error border-error"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-error" />
          <span>Hồ sơ lỗi</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "error" ? "bg-error text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {errorCount}
          </span>
        </button>

        {/* Tất cả hồ sơ */}
        <button
          onClick={() => { setActiveFilter("all"); setCurrentPage(1); }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeFilter === "all"
              ? "bg-[#eff4ff] text-primary border-primary"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Files className={`w-4.5 h-4.5 shrink-0 ${activeFilter === "all" ? "text-primary" : "text-on-surface-variant"}`} />
          <span>Tất cả hồ sơ</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
            activeFilter === "all" ? "bg-primary text-white" : "bg-surface-container-high text-on-surface"
          }`}>
            {registrations.length}
          </span>
        </button>
      </div>

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#d5e3ff] border-b border-outline-variant">
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[130px] whitespace-nowrap">
                  ID Đăng ký
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[240px]">
                  Tên Công ty
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[110px] whitespace-nowrap">
                  Ngày gửi
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] w-[150px] whitespace-nowrap">
                  Trạng thái
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] text-right whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant bg-white">
              {paginatedRegistrations.map((reg) => {
                const isError = reg.status === "rejected" || reg.status === "action_required";
                const companyName = reg.companies?.company_name || "N/A";

                return (
                  <tr
                    key={reg.registration_id}
                    className="hover:bg-surface-container transition-colors group"
                  >
                    <td
                      className={`px-6 py-4 font-mono text-[13px] whitespace-nowrap relative ${
                        isError ? "text-error font-semibold" : "text-on-surface-variant"
                      }`}
                    >
                      {isError && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
                      )}
                      {reg.registration_code}
                    </td>
                    <td className="px-6 py-4 min-w-[240px]">
                      <Link 
                        href={`/registrations/${reg.registration_id}`}
                        className="font-semibold text-[#1f1f1f] hover:text-primary transition-colors cursor-pointer block"
                      >
                        {companyName}
                      </Link>
                      {isError && (
                        <p className="text-[11px] mt-0.5 text-error font-medium">
                          Hồ sơ có lỗi cần bổ sung
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4 font-mono text-on-surface-variant text-[13px] whitespace-nowrap">
                      {formatDate(reg.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reg.status === "pending" ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#fef3c7] text-[#b45309] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0"></span>
                          PENDING
                        </span>
                      ) : reg.status === "approved" ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#dcfce7] text-[#166534] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#22c55e] shrink-0"></span>
                          APPROVED
                        </span>
                      ) : reg.status === "rejected" ? (
                        <span className="inline-flex items-center gap-1.5 bg-[#fee2e2] text-[#991b1b] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] shrink-0"></span>
                          REJECTED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 bg-[#f3f4f6] text-[#374151] text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#9ca3af] shrink-0"></span>
                          {reg.status.toUpperCase()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link 
                        href={`/registrations/${reg.registration_id}`}
                        className="text-secondary font-semibold text-xs hover:text-primary inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                      >
                        Xem chi tiết <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <p className="text-on-surface-variant text-sm font-medium">
            Hiển thị {filteredRegistrations.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredRegistrations.length)} trên {filteredRegistrations.length} kết quả
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1 || filteredRegistrations.length === 0}
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