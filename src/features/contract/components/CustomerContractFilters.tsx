"use client";

import React from "react";
import { Search, Filter } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CustomerContractFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  startDate: string;
  onStartDateChange: (value: string) => void;
  endDate: string;
  onEndDateChange: (value: string) => void;
}

export function CustomerContractFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
}: CustomerContractFiltersProps) {
  const { dict } = useTranslation();

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Search */}
        <div className="md:col-span-5 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            {dict.contract.filters.search_label}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[16px] h-[16px]" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={dict.contract.filters.search_placeholder}
              className="w-full pl-9 pr-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface placeholder-on-surface-variant focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="md:col-span-3 flex flex-col">
          <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
            {dict.contract.filters.status_label}
          </label>
          <div className="relative">
            <select
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="w-full pl-3 pr-8 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none cursor-pointer"
            >
              <option value="">{dict.contract.filters.status_all}</option>
              <option value="pending_signatures">{dict.contract.filters.status_pending_signatures}</option>
              <option value="active">{dict.contract.filters.status_active}</option>
              <option value="completed">{dict.contract.filters.status_completed}</option>
              <option value="cancelled">{dict.contract.filters.status_cancelled}</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-on-surface-variant">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="md:col-span-4 flex gap-3">
          <div className="flex-1 flex flex-col">
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              {dict.contract.filters.start_date}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full px-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            />
          </div>
          <div className="flex-1 flex flex-col">
            <label className="block text-[11px] font-bold text-on-surface-variant mb-1 uppercase tracking-wider">
              {dict.contract.filters.end_date}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => onEndDateChange(e.target.value)}
              className="w-full px-3 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-xs text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
