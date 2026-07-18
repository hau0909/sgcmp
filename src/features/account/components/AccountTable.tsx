"use client";

import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  ChevronLeft,
  Users,
  UserCircle,
  ShieldCheck,
  ShieldAlert,
  Building2,
  Shield,
  Crosshair,
  ExternalLink,
  Search,
} from "lucide-react";
import { requestGetAllAccounts } from "../api/account.api";
import type { Profile } from "@/types/Profile";
import type { UserRole, GeneralStatus } from "@/types/Enum";

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

const getRoleLabel = (role: UserRole): string => {
  switch (role) {
    case "admin":
      return "Admin";
    case "customer":
      return "Khách hàng";
    case "company-admin":
      return "Quản lý DN";
    case "guard":
      return "Bảo vệ";
    case "coordinator":
      return "Điều phối";
    default:
      return role;
  }
};

const getRoleBadge = (role: UserRole) => {
  switch (role) {
    case "admin":
      return {
        bg: "bg-[#ede9fe]",
        text: "text-[#6d28d9]",
        dot: "bg-[#8b5cf6]",
      };
    case "customer":
      return {
        bg: "bg-[#dbeafe]",
        text: "text-[#1e40af]",
        dot: "bg-[#3b82f6]",
      };
    case "company-admin":
      return {
        bg: "bg-[#fef3c7]",
        text: "text-[#b45309]",
        dot: "bg-[#f59e0b]",
      };
    case "guard":
      return {
        bg: "bg-[#d1fae5]",
        text: "text-[#065f46]",
        dot: "bg-[#10b981]",
      };
    case "coordinator":
      return {
        bg: "bg-[#fce7f3]",
        text: "text-[#9d174d]",
        dot: "bg-[#ec4899]",
      };
    default:
      return {
        bg: "bg-[#f3f4f6]",
        text: "text-[#374151]",
        dot: "bg-[#9ca3af]",
      };
  }
};

const getStatusBadge = (status: GeneralStatus) => {
  if (status === "active") {
    return {
      label: "Active",
      bg: "bg-[#dcfce7]",
      text: "text-[#166534]",
      dot: "bg-[#22c55e]",
    };
  }
  return {
    label: "Unactive",
    bg: "bg-[#fee2e2]",
    text: "text-[#991b1b]",
    dot: "bg-[#ef4444]",
  };
};

type RoleFilter = "all" | UserRole;
type StatusFilter = "all" | GeneralStatus;

export default function AccountTable() {
  const [accounts, setAccounts] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [activeRoleFilter, setActiveRoleFilter] =
    React.useState<RoleFilter>("all");
  const [activeStatusFilter, setActiveStatusFilter] =
    React.useState<StatusFilter>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  // Filter accounts based on activeRoleFilter, activeStatusFilter, and searchQuery
  const filteredAccounts = React.useMemo(() => {
    let result = accounts;

    if (activeRoleFilter !== "all") {
      result = result.filter((a) => a.role === activeRoleFilter);
    }

    if (activeStatusFilter !== "all") {
      result = result.filter((a) => a.status === activeStatusFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (a) =>
          a.full_name?.toLowerCase().includes(q) ||
          a.email?.toLowerCase().includes(q) ||
          a.phone_number?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [accounts, activeRoleFilter, activeStatusFilter, searchQuery]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);

  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  const paginatedAccounts = React.useMemo(() => {
    return filteredAccounts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [filteredAccounts, currentPage, itemsPerPage]);

  // Calculate dynamic stats
  const roleStats = React.useMemo(() => {
    return {
      customer: accounts.filter((a) => a.role === "customer").length,
      "company-admin": accounts.filter((a) => a.role === "company-admin")
        .length,
      guard: accounts.filter((a) => a.role === "guard").length,
      coordinator: accounts.filter((a) => a.role === "coordinator").length,
      admin: accounts.filter((a) => a.role === "admin").length,
    };
  }, [accounts]);

  const statusStats = React.useMemo(() => {
    return {
      active: accounts.filter((a) => a.status === "active").length,
      unactive: accounts.filter((a) => a.status === "unactive").length,
    };
  }, [accounts]);

  React.useEffect(() => {
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const res = await requestGetAllAccounts();
        setAccounts(res.accounts || []);
      } catch (err: any) {
        console.error("Error fetching accounts:", err);
        setError(err.message || "Không thể tải danh sách tài khoản");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center min-h-[400px] text-on-surface-variant font-medium">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Đang tải danh sách tài khoản...</span>
          </div>
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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-5">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-2">
        <div>
          <nav className="flex items-center gap-1 text-on-surface-variant/80 text-xs font-medium mb-1">
            <span className="hover:text-primary cursor-pointer transition-colors">
              Quản trị
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-on-surface-variant/50 shrink-0" />
            <span className="text-primary font-bold">Quản lý tài khoản</span>
          </nav>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Quản lý tài khoản
          </h2>
          <p className="text-xs text-on-surface-variant mt-0.5">
            Xem và quản lý tất cả tài khoản người dùng trong hệ thống.
          </p>
        </div>


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
                  Người dùng
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap min-w-[200px]">
                  Email
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap w-[130px]">
                  Vai trò
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap w-[110px]">
                  Trạng thái
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] whitespace-nowrap w-[110px]">
                  Ngày tạo
                </th>
                <th className="py-3 px-6 text-[12px] font-semibold text-on-surface uppercase tracking-[0.05em] text-right whitespace-nowrap">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-outline-variant bg-white">
              {paginatedAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-on-surface-variant"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Users className="w-10 h-10 text-on-surface-variant/30" />
                      <p className="font-medium">
                        Không tìm thấy tài khoản nào
                      </p>
                      <p className="text-xs">
                        Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account, index) => {
                  const roleBadge = getRoleBadge(account.role);
                  const statusBadge = getStatusBadge(account.status);
                  const rowNumber =
                    (currentPage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr
                      key={account.user_id}
                      className="hover:bg-surface-container transition-colors group"
                    >
                      <td className="px-6 py-4 font-mono text-[13px] text-on-surface-variant whitespace-nowrap">
                        {rowNumber}
                      </td>
                      <td className="px-6 py-4 min-w-[250px]">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center shrink-0 overflow-hidden border border-outline-variant/50">
                            {account.avatar_url ? (
                              <img
                                src={account.avatar_url}
                                alt={account.full_name || "Avatar"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserCircle className="w-5 h-5 text-on-surface-variant/50" />
                            )}
                          </div>
                          <div>
                            <Link
                              href={`/accounts/${account.user_id}`}
                              className="font-semibold text-[#1f1f1f] hover:text-primary transition-colors cursor-pointer block"
                            >
                              {account.full_name || "Chưa cập nhật"}
                            </Link>
                            {account.phone_number && (
                              <p className="text-[11px] text-on-surface-variant mt-0.5">
                                {account.phone_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant text-[13px] whitespace-nowrap">
                        {account.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 ${roleBadge.bg} ${roleBadge.text} text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${roleBadge.dot} shrink-0`}
                          />
                          {getRoleLabel(account.role)}
                        </span>
                      </td>
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
                      <td className="px-6 py-4 font-mono text-on-surface-variant text-[13px] whitespace-nowrap">
                        {formatDate(account.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <Link
                          href={`/accounts/${account.user_id}`}
                          className="text-secondary font-semibold text-xs hover:text-primary inline-flex items-center gap-1 transition-colors whitespace-nowrap"
                        >
                          Xem chi tiết{" "}
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-outline-variant flex justify-between items-center bg-surface-container-low">
          <p className="text-on-surface-variant text-sm font-medium">
            Hiển thị{" "}
            {filteredAccounts.length === 0
              ? 0
              : (currentPage - 1) * itemsPerPage + 1}{" "}
            -{" "}
            {Math.min(currentPage * itemsPerPage, filteredAccounts.length)}{" "}
            trên {filteredAccounts.length} kết quả
          </p>
          <div className="flex gap-1">
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.max(prev - 1, 1))
              }
              disabled={
                currentPage === 1 || filteredAccounts.length === 0
              }
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (num) => (
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
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
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
