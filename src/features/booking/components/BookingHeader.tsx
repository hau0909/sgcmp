"use client";

import React from "react";
import { Download, Plus } from "lucide-react";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface BookingHeaderProps {
  onExport?: () => void;
  onCreateNew?: () => void;
}

export function BookingHeader({ onExport, onCreateNew }: BookingHeaderProps) {
  const { dict } = useTranslation();

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
          {dict.company_requests?.title || "Danh sách Yêu cầu Khách hàng"}
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          {dict.company_requests?.desc || "Quản lý và xử lý các yêu cầu đặt lịch dịch vụ an ninh từ hệ thống."}
        </p>
      </div>
    </div>
  );
}
