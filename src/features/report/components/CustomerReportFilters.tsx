import React from "react";
import { Search } from "lucide-react";
import { REPORT_TYPE_LABELS, ReportType } from "../types";

interface CustomerReportFiltersProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  filterType: string;
  setFilterType: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
}

export function CustomerReportFilters({
  searchQuery,
  setSearchQuery,
  filterType,
  setFilterType,
  filterStatus,
  setFilterStatus,
}: CustomerReportFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-xl shadow-xs">
      {/* Search */}
      <div className="md:col-span-2 relative flex items-center bg-white rounded-lg border border-outline-variant/60 focus-within:border-primary transition-colors px-3 py-1.5">
        <Search className="w-4 h-4 text-on-surface-variant mr-2" />
        <input
          type="text"
          placeholder="Tìm mã báo cáo, mã hợp đồng, nội dung..."
          className="bg-transparent border-none outline-none text-sm text-on-surface w-full placeholder-on-surface-variant"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Type Filter */}
      <select
        value={filterType}
        onChange={(e) => setFilterType(e.target.value)}
        className="bg-white rounded-lg border border-outline-variant/60 focus:border-primary outline-none text-sm text-on-surface px-3 py-1.5 cursor-pointer"
      >
        <option value="ALL">Tất cả vấn đề khiếu nại</option>
        {Object.entries(REPORT_TYPE_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      {/* Status Filter */}
      <select
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
        className="bg-white rounded-lg border border-outline-variant/60 focus:border-primary outline-none text-sm text-on-surface px-3 py-1.5 cursor-pointer"
      >
        <option value="ALL">Tất cả trạng thái</option>
        <option value="PENDING">Chờ tiếp nhận</option>
        <option value="IN_PROGRESS">Đang xử lý</option>
        <option value="RESOLVED">Đã giải quyết</option>
        <option value="CLOSED">Đã đóng</option>
      </select>
    </div>
  );
}
