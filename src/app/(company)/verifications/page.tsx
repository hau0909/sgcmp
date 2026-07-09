"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { requestGetVerificationsByCompany, VerificationListItem } from "@/features/verification/api/verification.api";
import { VerificationStatus } from "@/types/Enum";
import { ClipboardCheck, Search, Filter, ChevronLeft, ChevronRight, Image as ImageIcon } from "lucide-react";

const STATUS_OPTIONS: { label: string; value: VerificationStatus | "" }[] = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Chờ duyệt", value: "pending" },
  { label: "Đã duyệt", value: "approved" },
  { label: "Từ chối", value: "rejected" },
];

function StatusBadge({ status }: { status: VerificationStatus }) {
  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
          Đã duyệt
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border-red-200">
          Từ chối
        </span>
      );
    case "pending":
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
          Chờ duyệt
        </span>
      );
  }
}

export default function CompanyVerificationsPage() {
  const router = useRouter();
  const companyId = useAuthStore((s) => s.company_id);

  const [verifications, setVerifications] = useState<VerificationListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 8;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<VerificationStatus | "">("");

  const fetchData = useCallback(async () => {
    if (!companyId) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const res = await requestGetVerificationsByCompany(
        companyId,
        page,
        limit,
        statusFilter || undefined
      );
      setVerifications(res.verifications || []);
      setTotalCount(res.totalCount || 0);
    } catch (err) {
      console.error("Lỗi tải danh sách khảo sát:", err);
    } finally {
      setIsLoading(false);
    }
  }, [companyId, page, statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filtered = verifications.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.booking.customer_name.toLowerCase().includes(q) ||
      v.booking.service_name.toLowerCase().includes(q) ||
      v.booking.address.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const startIdx = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalCount);

  return (
    <div className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Danh sách Khảo sát Yêu cầu
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Quản lý các phiên khảo sát hiện trường khu vực cần bảo vệ trước khi lập báo giá.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Search */}
          <div className="md:col-span-8 flex flex-col">
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Tìm kiếm
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[16px] h-[16px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Khách hàng, dịch vụ, địa chỉ..."
                className="w-full pl-9 pr-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-4 flex flex-col">
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              Trạng thái
            </label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value as VerificationStatus | ""); setPage(1); }}
                className="w-full pl-3 pr-8 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-8 h-8 border-b-2 border-primary rounded-full animate-spin mb-3" />
            <p className="text-xs text-on-surface-variant font-medium">Đang tải danh sách khảo sát...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-on-surface-variant bg-surface-bright">
            <ClipboardCheck className="w-12 h-12 opacity-30 mb-3" />
            <p className="text-sm font-semibold">Không có phiên khảo sát nào</p>
            <p className="text-xs mt-1 opacity-70">Tạo phiên khảo sát từ trang chi tiết yêu cầu dịch vụ</p>
          </div>
        ) : (
          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#C4E2F5] border-b border-outline-variant">
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-16 text-center">STT</th>
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Khách hàng</th>
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Dịch vụ</th>
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap hidden md:table-cell">Địa chỉ</th>
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-center hidden sm:table-cell">Hình ảnh</th>
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Trạng thái</th>
                  <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right w-32">Hành động</th>
                </tr>
              </thead>
              <tbody className="text-xs text-on-surface">
                {filtered.map((v, index) => (
                  <tr key={v.verification_id} className="border-b border-outline-variant/30 hover:bg-primary-fixed/30 transition-colors h-[40px]">
                    <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant text-center font-mono">{startIdx + index}</td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-semibold text-on-surface">{v.booking.customer_name}</td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-medium text-on-surface-variant">{v.booking.service_name}</td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-medium text-on-surface-variant hidden md:table-cell truncate max-w-[200px]" title={v.booking.address}>{v.booking.address}</td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-center hidden sm:table-cell">
                      <span className="inline-flex items-center gap-1 font-mono text-on-surface-variant">
                        <ImageIcon className="w-3.5 h-3.5 text-outline-variant" />
                        {v.images.length}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-start">
                      <StatusBadge status={v.status} />
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => router.push(`/verifications/${v.booking_id}`)}
                        className="text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
            <div>
              Hiển thị {startIdx}-{endIdx} trong {totalCount} kết quả
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="p-1 rounded hover:bg-surface-container disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-[18px] h-[18px]" />
              </button>

              <button className="w-7 h-7 rounded bg-primary-container text-on-primary-container font-medium flex items-center justify-center text-xs">
                {page}
              </button>

              <span className="px-1 text-xs">/ {totalPages}</span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="p-1 rounded hover:bg-surface-container disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
