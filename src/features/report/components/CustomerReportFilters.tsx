import React from "react";
import { Search } from "lucide-react";
import { REPORT_TYPE_LABELS, ReportType } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";

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
  const { dict } = useTranslation();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-surface-container-lowest border border-outline-variant/50 p-4 rounded-xl shadow-xs">
      {/* Search */}
      <div className="md:col-span-2 relative flex items-center bg-white rounded-lg border border-outline-variant/60 focus-within:border-primary transition-colors px-3 py-1.5">
        <Search className="w-4 h-4 text-on-surface-variant mr-2" />
        <input
          type="text"
          placeholder={dict.report.filters.search_placeholder}
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
        <option value="ALL">{dict.report.filters.type_all}</option>
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
        <option value="ALL">{dict.report.filters.status_all}</option>
        <option value="PENDING">{dict.report.filters.status_pending}</option>
        <option value="IN_PROGRESS">{dict.report.filters.status_in_progress}</option>
        <option value="RESOLVED">{dict.report.filters.status_resolved}</option>
        <option value="CLOSED">{dict.report.filters.status_closed}</option>
      </select>
    </div>
  );
}
