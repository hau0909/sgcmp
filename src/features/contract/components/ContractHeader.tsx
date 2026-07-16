"use client";

import React from "react";

interface ContractHeaderProps {
  onExport?: () => void;
}

export function ContractHeader({ onExport }: ContractHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4 mb-6">
      <div>
        <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
          Danh sách hợp đồng
        </h2>
        <p className="text-sm text-on-surface-variant mt-1 font-body">
          Quản lý và theo dõi trạng thái các hợp đồng dịch vụ bảo vệ.
        </p>
      </div>
    </div>
  );
}
