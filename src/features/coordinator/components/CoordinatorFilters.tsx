"use client";

import React from "react";
import { Search } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CoordinatorFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function CoordinatorFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: CoordinatorFiltersProps) {
  const { dict } = useTranslation();
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-8 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            {dict.coordinator?.search_label || "Tìm kiếm"}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[16px] h-[16px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={
                dict.coordinator?.search_placeholder ||
                "Tìm kiếm theo tên, email, sđt..."
              }
              className="w-full pl-9 pr-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-4 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            {dict.coordinator?.status_label || "Trạng thái"}
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-3 pr-8 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">
                {dict.coordinator?.status_all || "Tất cả trạng thái"}
              </option>
              <option value="Hoạt động">
                {dict.coordinator?.status_active || "Hoạt động"}
              </option>
              <option value="Vô hiệu hóa">
                {dict.coordinator?.status_inactive || "Vô hiệu hóa"}
              </option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
              <svg
                className="fill-current h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
