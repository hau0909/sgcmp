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
  Clock,
  ShieldAlert,
  ExternalLink,
  Lightbulb,
  ArrowRight
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

const getLogoShort = (name: string) => {
  if (!name) return "CO";
  const parts = name.split(" ").filter(p => p && p[0] !== p[0].toLowerCase());
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export default function RegistrationTable() {
  const [registrations, setRegistrations] = React.useState<RegistrationWithCompany[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

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

  // Calculate dynamic stats
  const pendingCount = registrations.filter((r) => r.status === "pending").length;
  const approvedCount = registrations.filter((r) => r.status === "approved").length;
  const errorCount = registrations.filter((r) => r.status === "rejected" || r.status === "action_required").length;

  const approvedList = registrations.filter((r) => r.status === "approved");
  let avgDaysStr = "1.5d";
  if (approvedList.length > 0) {
    const totalDiff = approvedList.reduce((acc, r) => {
      const created = new Date(r.created_at).getTime();
      const updated = new Date(r.updated_at).getTime();
      const diffDays = (updated - created) / (1000 * 60 * 60 * 24);
      return acc + (diffDays > 0 ? diffDays : 0.5);
    }, 0);
    const avg = totalDiff / approvedList.length;
    avgDaysStr = `${avg.toFixed(1)}d`;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
        <span className="hover:text-primary cursor-pointer transition-colors">Doanh nghiệp</span>
        <ChevronRight className="w-4 h-4 text-on-surface-variant/70 shrink-0" />
        <span className="text-primary font-bold">Đăng ký doanh nghiệp</span>
      </nav>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Danh sách đăng ký doanh nghiệp
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Quản lý và xét duyệt hồ sơ đăng ký mới của các tổ chức.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded text-sm font-medium hover:bg-surface-container-low transition-colors text-on-surface">
            <Filter className="text-on-surface-variant w-4 h-4" />
            <span>Bộ lọc</span>
          </button>
          <button className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/90 text-on-secondary rounded text-sm font-medium transition-colors">
            <Download className="w-4 h-4 text-white" />
            <span>Xuất báo cáo</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Pending Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center shrink-0">
            <FileClock className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Tổng chờ duyệt
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">{pendingCount}</p>
          </div>
        </div>

        {/* Approved Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-[#dcfce7] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-[#166534]" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Đã duyệt (Tháng)
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">{approvedCount}</p>
          </div>
        </div>

        {/* Avg Time Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-[#fef3c7] flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-[#b45309]" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Thời gian TB
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">{avgDaysStr}</p>
          </div>
        </div>

        {/* Error Card */}
        <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="w-12 h-12 rounded-lg bg-error-container flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-error" />
          </div>
          <div>
            <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider">
              Hồ sơ lỗi
            </p>
            <p className="text-2xl font-bold text-on-surface mt-1">{errorCount}</p>
          </div>
        </div>
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
              {registrations.map((reg) => {
                const isError = reg.status === "rejected" || reg.status === "action_required";
                const companyName = reg.companies?.company_name || "N/A";
                const logoShort = getLogoShort(companyName);
                const desc = reg.companies?.description || "N/A";

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
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 bg-[#e8ebee] ${
                            isError ? "text-error" : "text-[#43474e]"
                          }`}
                        >
                          {logoShort}
                        </div>
                        <div>
                          <Link 
                            href={`/registrations/${reg.registration_id}`}
                            className="font-semibold text-[#1f1f1f] hover:text-primary transition-colors cursor-pointer block"
                          >
                            {companyName}
                          </Link>
                          <p
                            className={`text-[11px] mt-0.5 ${
                              isError ? "text-error font-medium" : "text-on-surface-variant"
                            }`}
                          >
                            {isError ? "Hồ sơ có lỗi cần bổ sung" : `Lĩnh vực: ${desc}`}
                          </p>
                        </div>
                      </div>
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
          <p className="text-on-surface-variant text-sm">
            Hiển thị 1 - {registrations.length} trên {registrations.length} kết quả
          </p>
          <div className="flex gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50 transition-colors"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-sm font-medium">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high text-sm transition-colors" disabled>
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high text-sm transition-colors" disabled>
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-high transition-colors" disabled>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contextual Help / Sidebar Activity (Asymmetric Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asymmetric Left Card (2/3 width) */}
        <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-6 relative overflow-hidden flex flex-col justify-center min-h-[160px] shadow-sm">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-5 flex items-center justify-center pointer-events-none overflow-visible">
            <ShieldCheck className="text-on-surface shrink-0" strokeWidth={0.5} style={{ width: "200px", height: "200px" }} />
          </div>
          <div className="relative z-10 space-y-2">
            <h3 className="text-lg font-bold text-on-surface font-headline">
              Quy trình xét duyệt nhanh
            </h3>
            <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
              Sử dụng hệ thống xác thực tự động để kiểm tra mã số doanh nghiệp và giấy phép kinh
              doanh trước khi phê duyệt thủ công.
            </p>
            <button className="px-4 py-2 bg-secondary hover:bg-secondary/95 text-on-secondary rounded text-sm font-semibold transition-colors mt-2">
              Hướng dẫn chi tiết
            </button>
          </div>
        </div>

        {/* Asymmetric Right Card (1/3 width, solid primary) */}
        <div className="bg-primary rounded-xl p-6 text-white shadow-sm flex flex-col justify-between min-h-[160px] hover:bg-primary/95 transition-colors">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary-fixed" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary-fixed">
                Mẹo quản trị
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-headline leading-tight mb-2">
              Ưu tiên hồ sơ đã xác thực số
            </h3>
            <p className="text-primary-fixed-dim text-xs leading-relaxed">
              Hồ sơ có chữ ký số được kiểm tra nhanh hơn 60% so với hồ sơ quét văn bản thông thường.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <a
              className="text-white font-medium text-sm flex items-center gap-2 group hover:text-primary-fixed transition-colors"
              href="#"
            >
              <span>Tìm hiểu thêm</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}