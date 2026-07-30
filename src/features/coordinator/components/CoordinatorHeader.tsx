"use client";

import React from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CoordinatorHeaderProps {
  onCreateNew?: () => void;
  canAdd?: boolean | null;
}

export function CoordinatorHeader({ onCreateNew, canAdd = true }: CoordinatorHeaderProps) {
  const { dict } = useTranslation();
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
          {dict.coordinator?.page_title || "Quản lý Tài khoản Điều phối viên"}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          {dict.coordinator?.page_desc || "Quản lý và theo dõi quyền truy cập của các điều phối viên trong doanh nghiệp."}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {canAdd === null && (
          <div className="w-[160px] h-[36px] animate-pulse bg-surface-container rounded" />
        )}
        {canAdd === false && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-sm font-medium shadow-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{dict.coordinator?.limit_reached || "Đã đạt giới hạn 1 tài khoản"}</span>
          </div>
        )}
        {canAdd === true && (
          <button
            onClick={onCreateNew}
            className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 active:scale-95 duration-100 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{dict.coordinator?.btn_add || "Tạo tài khoản mới"}</span>
          </button>
        )}
      </div>
    </div>
  );
}
