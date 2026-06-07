import React from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
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
            Quản lý và theo dõi quyền truy cập của các điều phối viên trong doanh nghiệp.
          </p>
        </div>
        <Link
          href="/coordinator/add"
          className="bg-secondary hover:bg-primary text-on-secondary font-bold py-2 px-4 rounded text-sm transition-colors flex items-center gap-2 w-fit shadow-sm active:scale-95 duration-100"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo tài khoản mới</span>
        </Link>
      </div>
      
      <CoordinatorTable />

      <div className="h-8" />
    </div>
  );
}
