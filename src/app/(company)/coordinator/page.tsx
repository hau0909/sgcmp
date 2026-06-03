import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CoordinatorTable } from '@/features/coordinator/components/CoordinatorTable';

export default function CoordinatorPage() {
  return (
    <div className="flex-1 p-6 lg:p-8 max-w-[1440px] mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-outline-variant/60 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-primary tracking-tight font-headline">
            Quản lý Tài khoản Điều phối viên
          </h2>
          <p className="text-sm text-on-surface-variant mt-1 font-body">
            Manage and monitor coordinator access across the enterprise.
          </p>
        </div>
        <button className="bg-secondary hover:bg-secondary-container text-on-secondary hover:text-on-secondary-container font-bold py-2 px-4 rounded text-sm transition-colors flex items-center gap-2 w-fit shadow-sm active:scale-95 duration-100">
          <Plus className="w-4 h-4" />
          <span>Tạo tài khoản mới</span>
        </button>
      </div>
      
      <CoordinatorTable />

      <div className="h-8" />
    </div>
  );
}
