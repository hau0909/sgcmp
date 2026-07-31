"use client";

import React from "react";
import { Search, X } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface BookingFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}

export function BookingFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: BookingFiltersProps) {
  const { dict } = useTranslation();

  const handleReset = () => {
    onSearchChange("");
    onStatusChange("");
    onStartDateChange("");
    onEndDateChange("");
  };

  const hasActiveFilters = Boolean(search || status || startDate || endDate);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] transition-all">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        {/* Search */}
        <div className={`${hasActiveFilters ? "md:col-span-4" : "md:col-span-5"} flex flex-col`}>
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            {dict.company_requests?.search_label || "Tìm kiếm"}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={dict.company_requests?.search_placeholder || "Mã yêu cầu, Tên khách hàng, Dịch vụ..."}
              className="w-full pl-9 pr-3 h-[38px] bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            {dict.company_requests?.status_label || "Trạng thái"}
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value)}
            className="w-full px-3 h-[38px] bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
          >
            <option value="">{dict.company_requests?.status_all || "Tất cả trạng thái"}</option>
            <option value="pending">Chờ báo giá</option>
            <option value="quoted">Đã báo giá</option>
            <option value="contract_created">Đã tạo hợp đồng</option>
            <option value="rejected">Đã từ chối</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>

        {/* Start Date */}
        <div className="md:col-span-2 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            Từ ngày
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 h-[38px] bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* End Date */}
        <div className="md:col-span-2 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            Đến ngày
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 h-[38px] bg-surface-container-lowest border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Reset Filter Button */}
        {hasActiveFilters && (
          <div className="md:col-span-1 flex items-end">
            <button
              type="button"
              onClick={handleReset}
              title="Xóa bộ lọc"
              className="h-[38px] w-full flex items-center justify-center gap-1 px-2 bg-surface-container-high hover:bg-surface-container-highest text-on-surface-variant text-xs font-medium rounded-lg border border-outline-variant transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Xóa</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
