"use client";

import React from "react";
import { Download, Plus } from "lucide-react";

interface BookingHeaderProps {
  onExport?: () => void;
  onCreateNew?: () => void;
}

export function BookingHeader({ onExport, onCreateNew }: BookingHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
          Danh sách Yêu cầu Khách hàng
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Quản lý và xử lý các yêu cầu đặt lịch dịch vụ an ninh từ hệ thống.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onExport}
          className="px-4 py-2 text-sm font-semibold text-secondary border border-outline-variant rounded hover:bg-surface-container-low transition-colors bg-surface-container-lowest flex items-center gap-2 shadow-sm active:scale-95 duration-100 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo cáo</span>
        </button>
        <button
          onClick={onCreateNew}
          className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 active:scale-95 duration-100 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo Yêu cầu Mới</span>
        </button>
      </div>
    </div>
  );
}
