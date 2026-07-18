"use client";

import React from "react";
import { FileDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DashboardHeader() {
  // Format current date in Vietnamese style
  const getFormattedDate = () => {
    const days = [
      "Chủ Nhật",
      "Thứ Hai",
      "Thứ Ba",
      "Thứ Tư",
      "Thứ Năm",
      "Thứ Sáu",
      "Thứ Bảy",
    ];
    const today = new Date();
    const dayName = days[today.getDay()];
    const date = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    return `${dayName}, ${date} tháng ${month}, ${year}`;
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Chào buổi sáng, Quản trị viên
        </h1>
        <p className="text-sm text-slate-500 mt-1">{getFormattedDate()}</p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          className="bg-blue-50/50 hover:bg-blue-50 text-blue-600 border-blue-200/60 font-medium h-10 px-4 gap-2 rounded-lg transition-colors cursor-pointer"
        >
          <FileDown className="size-4 text-blue-500" />
          <span>Xuất báo cáo</span>
        </Button>
      </div>
    </div>
  );
}
