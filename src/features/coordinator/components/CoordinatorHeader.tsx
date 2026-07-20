"use client";

import React from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CoordinatorHeaderProps {
  onCreateNew?: () => void;
}

export function CoordinatorHeader({ onCreateNew }: CoordinatorHeaderProps) {
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
      <div className="flex gap-3">
        <button
          onClick={onCreateNew}
          className="px-4 py-2 text-sm font-semibold text-on-primary bg-primary rounded hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2 active:scale-95 duration-100 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{dict.coordinator?.btn_add || "Tạo tài khoản mới"}</span>
        </button>
      </div>
    </div>
  );
}
