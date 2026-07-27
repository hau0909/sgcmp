"use client";

import React from "react";
import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/components/providers/LanguageProvider";

export function DashboardHeader() {
  const { dict, locale } = useTranslation();

  // Format current date in localized style
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

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          {dict.admin_dashboard.good_morning}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{getFormattedDate()}</p>
      </div>
    </div>
  );
}
