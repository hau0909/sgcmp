import React, { useState } from "react";
import { Calendar, ChevronDown, Check, RefreshCw } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface DashboardHeaderProps {
  timeFilter: "week" | "month" | "year";
  onTimeFilterChange: (filter: "week" | "month" | "year") => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function DashboardHeader({ timeFilter, onTimeFilterChange, onRefresh, isRefreshing }: DashboardHeaderProps) {
  const { dict, locale } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    const adminTitle = locale === "vi" ? "Quản trị viên" : "Administrator";
    if (hour >= 5 && hour < 12) {
      return locale === "vi" ? `Chào buổi sáng, ${adminTitle}!` : `Good morning, ${adminTitle}!`;
    } else if (hour >= 12 && hour < 18) {
      return locale === "vi" ? `Chào buổi chiều, ${adminTitle}!` : `Good afternoon, ${adminTitle}!`;
    } else {
      return locale === "vi" ? `Chào buổi tối, ${adminTitle}!` : `Good evening, ${adminTitle}!`;
    }
  };

  const getFormattedDate = () => {
    const today = new Date();
    if (locale === "vi") {
      const days = [
        "Chủ Nhật",
        "Thứ Hai",
        "Thứ Ba",
        "Thứ Tư",
        "Thứ Năm",
        "Thứ Sáu",
        "Thứ Bảy",
      ];
      const dayName = days[today.getDay()];
      return `${dayName}, ${today.getDate()} tháng ${today.getMonth() + 1}, ${today.getFullYear()}`;
    } else {
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const dayName = days[today.getDay()];
      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];
      const monthName = monthNames[today.getMonth()];
      return `${dayName}, ${monthName} ${today.getDate()}, ${today.getFullYear()}`;
    }
  };

  const filterOptions = [
    { value: "week", label: dict.admin_dashboard?.filter_week || "Tuần này" },
    { value: "month", label: dict.admin_dashboard?.filter_month || "Tháng này" },
    { value: "year", label: dict.admin_dashboard?.filter_year || "Năm này" },
  ];

  const currentOption = filterOptions.find((opt) => opt.value === timeFilter) || filterOptions[0];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {getGreeting()}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{getFormattedDate()}</p>
      </div>

      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-full shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 text-slate-600 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{locale === "vi" ? "Làm mới" : "Refresh"}</span>
          </button>
        )}

        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white pl-3.5 pr-3 py-2 border border-slate-200 hover:border-slate-300 text-xs font-bold text-slate-800 rounded-full shadow-xs transition-all cursor-pointer outline-none"
          >
            <Calendar className="size-4 text-blue-600 shrink-0" />
            <span>{currentOption.label}</span>
            <ChevronDown className={`size-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <div className="absolute right-0 top-11 z-50 w-44 rounded-2xl border border-slate-200/90 bg-white shadow-xl py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {filterOptions.map((opt) => {
                  const isSelected = timeFilter === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onTimeFilterChange(opt.value as "week" | "month" | "year");
                        setIsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                        isSelected
                          ? "bg-blue-50/80 text-blue-700 font-bold"
                          : "text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      <span>{opt.label}</span>
                      {isSelected && <Check className="size-3.5 text-blue-600" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
