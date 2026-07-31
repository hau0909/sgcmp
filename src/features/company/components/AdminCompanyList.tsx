"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  Globe,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Search,
  ExternalLink,
  Users,
  FileText,
  UserCircle,
  X,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

export interface AdminCompany {
  company_id: string;
  company_name: string;
  business_license_no: string;
  license_file_url?: string | null;
  address: string;
  description?: string | null;
  rating_average: number | null;
  status: string;
  created_at: string;
  owner_id: string;
  owner?: {
    full_name: string;
    email: string;
    phone_number: string;
    avatar_url?: string;
  } | null;
  logo_url?: string | null;
  banner_url?: string | null;
  services_count: number;
  guards_count: number;
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

type StatusFilter = "all" | "published" | "active" | "pending_publish" | "suspended" | "draft";

export function AdminCompanyList() {
  const { dict } = useTranslation();

  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [activeStatusFilter, setActiveStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Detail Modal
  const [selectedCompany, setSelectedCompany] = useState<AdminCompany | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const fetchCompanies = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/companies");
      const data = await res.json();
      if (res.ok && data.companies) {
        setCompanies(data.companies);
      } else {
        setError(data.error || dict.admin_companies?.error_load_list || "Không thể tải danh sách doanh nghiệp.");
      }
    } catch (err: any) {
      console.error("Lỗi khi tải danh sách doanh nghiệp:", err);
      setError("Lỗi kết nối máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, [dict]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleUpdateStatus = async (companyId: string, newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch("/api/admin/companies", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ company_id: companyId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Đã cập nhật trạng thái thành "${getStatusBadge(newStatus).label}"`);
        setCompanies((prev) =>
          prev.map((c) => (c.company_id === companyId ? { ...c, status: newStatus } : c))
        );
        if (selectedCompany?.company_id === companyId) {
          setSelectedCompany((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
      } else {
        showToast(data.error || "Cập nhật thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi khi cập nhật trạng thái", "error");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Status stats calculation
  const statusStats = useMemo(() => {
    return {
      all: companies.length,
      published: companies.filter((c) => c.status === "published").length,
      active: companies.filter((c) => c.status === "active").length,
      pending_publish: companies.filter((c) => c.status === "pending_publish").length,
      suspended: companies.filter((c) => c.status === "suspended" || c.status === "draft").length,
    };
  }, [companies]);

  // Filtered List
  const filteredCompanies = useMemo(() => {
    let result = companies;

    if (activeStatusFilter !== "all") {
      if (activeStatusFilter === "suspended") {
        result = result.filter((c) => c.status === "suspended" || c.status === "draft");
      } else {
        result = result.filter((c) => c.status === activeStatusFilter);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.company_name?.toLowerCase().includes(q) ||
          c.business_license_no?.toLowerCase().includes(q) ||
          c.owner?.full_name?.toLowerCase().includes(q) ||
          c.owner?.email?.toLowerCase().includes(q) ||
          c.owner?.phone_number?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [companies, activeStatusFilter, searchQuery]);

  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage) || 1;

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedCompanies = useMemo(() => {
    return filteredCompanies.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredCompanies, currentPage, itemsPerPage]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return {
          label: (dict.admin_companies?.published || "ĐANG CÔNG KHAI").toUpperCase(),
          bg: "bg-[#dcfce7]",
          text: "text-[#166534]",
          dot: "bg-[#22c55e]",
        };
      case "active":
        return {
          label: (dict.admin_companies?.active || "ĐÃ KÍCH HOẠT").toUpperCase(),
          bg: "bg-[#dbeafe]",
          text: "text-[#1e40af]",
          dot: "bg-[#3b82f6]",
        };
      case "pending_publish":
        return {
          label: (dict.admin_companies?.pending_publish || "CHỜ PHÊ DUYỆT").toUpperCase(),
          bg: "bg-[#fef3c7]",
          text: "text-[#b45309]",
          dot: "bg-[#f59e0b]",
        };
      case "suspended":
        return {
          label: (dict.admin_companies?.suspended || "TẠM NGƯNG").toUpperCase(),
          bg: "bg-[#fee2e2]",
          text: "text-[#991b1b]",
          dot: "bg-[#ef4444]",
        };
      case "draft":
        return {
          label: "BẢN NHÁP",
          bg: "bg-[#f3f4f6]",
          text: "text-[#374151]",
          dot: "bg-[#9ca3af]",
        };
      default:
        return {
          label: status.toUpperCase(),
          bg: "bg-[#f3f4f6]",
          text: "text-[#374151]",
          dot: "bg-[#9ca3af]",
        };
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span>{dict.admin_companies?.loading_list || "Đang tải danh sách doanh nghiệp..."}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-error font-medium flex-col gap-3">
          <AlertTriangle className="w-10 h-10 text-rose-500" />
          <span>{dict.admin_companies?.error_load_list || "Lỗi tải danh sách doanh nghiệp"}: {error}</span>
          <button
            onClick={() => fetchCompanies()}
            className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            {dict.admin_companies?.refresh_btn || "Thử lại"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Toast message */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 text-sm font-medium ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-rose-600 text-white border-rose-700"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <nav className="flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors">
              {dict.admin_companies?.admin || "Quản trị"}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-primary font-bold">{dict.admin_companies?.title_list || "Quản lý doanh nghiệp"}</span>
          </nav>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            {dict.admin_companies?.title_list || "Quản lý doanh nghiệp"}
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            {dict.admin_companies?.desc_list || "Xem và quản lý tất cả doanh nghiệp trong hệ thống."}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Search Bar */}
          <div className="flex items-center bg-surface-container-lowest rounded-full px-4 py-2.5 border border-outline-variant focus-within:border-primary transition-colors w-full md:w-80 shadow-sm">
            <Search className="text-on-surface-variant w-4 h-4 mr-2 shrink-0" />
            <input
              type="text"
              placeholder={dict.admin_companies?.search_placeholder || "Tìm theo tên, email, SĐT..."}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-on-surface-variant hover:text-on-surface ml-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchCompanies}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg text-xs font-semibold hover:bg-surface-container-low transition-all text-on-surface cursor-pointer shadow-sm shrink-0"
            title={dict.admin_companies?.refresh_btn || "Làm mới"}
          >
            <RefreshCw className="text-on-surface-variant w-3.5 h-3.5" />
            <span className="hidden sm:inline">{dict.admin_companies?.refresh_btn || "Làm mới"}</span>
          </button>
        </div>
      </div>

      {/* Filter Buttons Row */}
      <div className="flex flex-wrap gap-2.5 items-center justify-center bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-sm">
        {/* Tất cả */}
        <button
          onClick={() => {
            setActiveStatusFilter("all");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeStatusFilter === "all"
              ? "bg-[#eff4ff] text-primary border-primary"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Users
            className={`w-4.5 h-4.5 shrink-0 ${
              activeStatusFilter === "all" ? "text-primary" : "text-on-surface-variant"
            }`}
          />
          <span>{dict.admin_companies?.all || "Tất cả"}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeStatusFilter === "all"
                ? "bg-primary text-white"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            {statusStats.all}
          </span>
        </button>

        {/* Đang công khai */}
        <button
          onClick={() => {
            setActiveStatusFilter("published");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeStatusFilter === "published"
              ? "bg-[#dcfce7] text-[#166534] border-[#22c55e]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Globe className="w-4.5 h-4.5 shrink-0 text-[#166534]" />
          <span>{dict.admin_companies?.published || "Đang công khai"}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeStatusFilter === "published"
                ? "bg-[#166534] text-white"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            {statusStats.published}
          </span>
        </button>

        {/* Đã kích hoạt */}
        <button
          onClick={() => {
            setActiveStatusFilter("active");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeStatusFilter === "active"
              ? "bg-[#dbeafe] text-[#1e40af] border-[#3b82f6]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <CheckCircle2 className="w-4.5 h-4.5 shrink-0 text-[#1e40af]" />
          <span>{dict.admin_companies?.active || "Đã kích hoạt"}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeStatusFilter === "active"
                ? "bg-[#1e40af] text-white"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            {statusStats.active}
          </span>
        </button>

        {/* Chờ duyệt */}
        <button
          onClick={() => {
            setActiveStatusFilter("pending_publish");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeStatusFilter === "pending_publish"
              ? "bg-[#fef3c7] text-[#b45309] border-[#f59e0b]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <Clock className="w-4.5 h-4.5 shrink-0 text-[#b45309]" />
          <span>{dict.admin_companies?.pending_publish || "Chờ duyệt"}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeStatusFilter === "pending_publish"
                ? "bg-[#b45309] text-white"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            {statusStats.pending_publish}
          </span>
        </button>

        {/* Tạm ngưng */}
        <button
          onClick={() => {
            setActiveStatusFilter("suspended");
            setCurrentPage(1);
          }}
          className={`flex items-center gap-2.5 px-4 py-2 rounded-lg border text-sm font-semibold transition-all cursor-pointer shadow-sm hover:shadow-md ${
            activeStatusFilter === "suspended"
              ? "bg-[#fee2e2] text-[#991b1b] border-[#ef4444]"
              : "bg-white border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          }`}
        >
          <ShieldAlert className="w-4.5 h-4.5 shrink-0 text-[#991b1b]" />
          <span>{dict.admin_companies?.suspended || "Tạm ngưng"}</span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-bold ${
              activeStatusFilter === "suspended"
                ? "bg-[#991b1b] text-white"
                : "bg-surface-container-high text-on-surface"
            }`}
          >
            {statusStats.suspended}
          </span>
        </button>
      </div>

      {/* Data Table Card */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-[#d5e3ff] border-b border-outline-variant">
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap w-[60px]">
                  #
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[250px]">
                  {dict.admin_companies?.tbl_company || "DOANH NGHIỆP"}
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[180px]">
                  {dict.admin_companies?.tbl_tax_code || "MÃ SỐ THUẾ / GP"}
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[200px]">
                  {dict.admin_companies?.tbl_representative || "NGƯỜI ĐẠI DIỆN"}
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap w-[140px]">
                  {dict.admin_companies?.tbl_status || "TRẠNG THÁI"}
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap w-[110px]">
                  {dict.admin_companies?.tbl_created || "NGÀY TẠO"}
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] text-right whitespace-nowrap">
                  {dict.admin_companies?.tbl_actions || "THAO TÁC"}
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant bg-white">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-on-surface-variant"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Building2 className="w-10 h-10 text-on-surface-variant/30" />
                      <p className="font-medium">{dict.admin_companies?.no_companies || "Không tìm thấy doanh nghiệp nào"}</p>
                      <p className="text-xs">
                        {dict.admin_companies?.no_companies_hint || "Thử điều chỉnh từ khóa tìm kiếm hoặc chọn bộ lọc khác."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((c, index) => {
                  const statusBadge = getStatusBadge(c.status);
                  const rowNumber = (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={c.company_id}
                      className="hover:bg-surface-container transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[13px] text-on-surface-variant whitespace-nowrap">
                        {rowNumber}
                      </td>

                      {/* Doanh nghiệp info */}
                      <td className="px-6 py-4 min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/50">
                            {c.logo_url ? (
                              <img
                                src={c.logo_url}
                                alt={c.company_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2 className="w-5 h-5 text-on-surface-variant/50" />
                            )}
                          </div>
                          <div>
                            <button
                              onClick={() => setSelectedCompany(c)}
                              className="font-semibold text-[#1f1f1f] hover:text-primary transition-colors cursor-pointer text-left block"
                            >
                              {c.company_name}
                            </button>
                            {c.owner?.phone_number && (
                              <p className="text-[11px] text-on-surface-variant mt-0.5 font-mono">
                                {c.owner.phone_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Mã số thuế */}
                      <td className="px-6 py-4 text-on-surface-variant text-[13px] whitespace-nowrap font-mono">
                        {c.business_license_no || "Chưa cập nhật"}
                      </td>

                      {/* Người đại diện */}
                      <td className="px-6 py-4 min-w-[200px]">
                        {c.owner ? (
                          <div>
                            <p className="font-semibold text-slate-800 text-xs">
                              {c.owner.full_name}
                            </p>
                            <p className="text-[11px] text-on-surface-variant mt-0.5">
                              {c.owner.email}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-on-surface-variant">Chưa cập nhật</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 ${statusBadge.bg} ${statusBadge.text} text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${statusBadge.dot} shrink-0`}
                          />
                          {statusBadge.label}
                        </span>
                      </td>

                      {/* Ngày tạo */}
                      <td className="px-6 py-4 font-mono text-on-surface-variant text-[13px] whitespace-nowrap">
                        {formatDate(c.created_at)}
                      </td>

                      {/* Thao tác */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedCompany(c)}
                          className="text-secondary font-semibold text-xs hover:text-primary inline-flex items-center gap-1 transition-colors whitespace-nowrap cursor-pointer"
                        >
                          {dict.admin_companies?.view_detail || "Xem chi tiết"}{" "}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant bg-surface-container-lowest">
            <p className="text-xs text-on-surface-variant">
              Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
              {Math.min(currentPage * itemsPerPage, filteredCompanies.length)} trên tổng số{" "}
              {filteredCompanies.length} doanh nghiệp
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-on-surface" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                    currentPage === p
                      ? "bg-primary text-white"
                      : "hover:bg-surface-container text-on-surface"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-outline-variant hover:bg-surface-container disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-on-surface" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedCompany && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-outline-variant overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-outline-variant/50 flex items-center justify-between bg-surface-container-low">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-white border border-outline-variant overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {selectedCompany.logo_url ? (
                    <img
                      src={selectedCompany.logo_url}
                      alt={selectedCompany.company_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-on-surface-variant" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-on-surface font-headline">
                    {selectedCompany.company_name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`inline-flex items-center gap-1.5 ${getStatusBadge(selectedCompany.status).bg} ${getStatusBadge(selectedCompany.status).text} text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${getStatusBadge(selectedCompany.status).dot}`} />
                      {getStatusBadge(selectedCompany.status).label}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedCompany(null)}
                className="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm font-body">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant">
                <div>
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Mã số thuế / GPKD
                  </span>
                  <span className="font-semibold text-on-surface font-mono">
                    {selectedCompany.business_license_no || "Chưa cập nhật"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    File giấy phép kinh doanh
                  </span>
                  {selectedCompany.license_file_url ? (
                    <a
                      href={selectedCompany.license_file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-secondary hover:underline font-semibold text-xs"
                    >
                      <FileText className="w-4 h-4" />
                      Xem tài liệu giấy phép
                    </a>
                  ) : (
                    <span className="text-on-surface-variant text-xs">Chưa đính kèm file</span>
                  )}
                </div>

                <div className="md:col-span-2">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider block mb-1">
                    Địa chỉ doanh nghiệp
                  </span>
                  <span className="font-semibold text-on-surface flex items-start gap-1.5">
                    <MapPin className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
                    <span>{selectedCompany.address || "Chưa cập nhật"}</span>
                  </span>
                </div>
              </div>

              {/* Owner Info */}
              <div>
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Thông tin đại diện pháp luật
                </h4>
                {selectedCompany.owner ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-outline-variant">
                    <div>
                      <span className="text-xs text-on-surface-variant block">Họ & Tên</span>
                      <span className="font-semibold text-on-surface flex items-center gap-1.5 mt-0.5">
                        <UserCircle className="w-3.5 h-3.5 text-on-surface-variant" />
                        {selectedCompany.owner.full_name}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-on-surface-variant block">Số điện thoại</span>
                      <a
                        href={`tel:${selectedCompany.owner.phone_number}`}
                        className="font-semibold text-secondary hover:underline flex items-center gap-1.5 mt-0.5 font-mono"
                      >
                        <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                        {selectedCompany.owner.phone_number || "Chưa có"}
                      </a>
                    </div>

                    <div>
                      <span className="text-xs text-on-surface-variant block">Email</span>
                      <a
                        href={`mailto:${selectedCompany.owner.email}`}
                        className="font-semibold text-secondary hover:underline flex items-center gap-1.5 mt-0.5"
                      >
                        <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                        {selectedCompany.owner.email || "Chưa có"}
                      </a>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant italic">Chưa có thông tin đại diện.</p>
                )}
              </div>

              {/* Description */}
              {selectedCompany.description && (
                <div>
                  <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                    Mô tả giới thiệu
                  </h4>
                  <p className="text-xs text-on-surface bg-surface-container-lowest p-3 rounded-xl border border-outline-variant leading-relaxed">
                    {selectedCompany.description}
                  </p>
                </div>
              )}

              {/* Status Update Control */}
              <div className="pt-3 border-t border-outline-variant">
                <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Cập nhật trạng thái
                </h4>
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: "published", label: "Công khai (Published)", bg: "bg-[#dcfce7] text-[#166534]" },
                    { id: "active", label: "Kích hoạt (Active)", bg: "bg-[#dbeafe] text-[#1e40af]" },
                    { id: "suspended", label: "Tạm ngưng (Suspended)", bg: "bg-[#fee2e2] text-[#991b1b]" },
                  ].map((st) => (
                    <button
                      key={st.id}
                      disabled={selectedCompany.status === st.id || isUpdatingStatus}
                      onClick={() => handleUpdateStatus(selectedCompany.company_id, st.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${st.bg} ${
                        selectedCompany.status === st.id ? "opacity-40 cursor-default" : "hover:opacity-80"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
              <Link
                href={`/companies/${selectedCompany.company_id}`}
                target="_blank"
                className="text-xs font-semibold text-secondary hover:underline flex items-center gap-1"
              >
                <span>Xem trang công khai</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <button
                onClick={() => setSelectedCompany(null)}
                className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                {dict.admin_companies?.close || "Đóng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
