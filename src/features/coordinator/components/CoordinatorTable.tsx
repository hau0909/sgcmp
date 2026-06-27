"use client";

import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Edit2, Ban, Unlock, Trash2, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { requestGetCoordinators } from '../api/coordinator.api';
import { CoordinatorWithUser } from '../types';
import { useAuthStore } from '@/store/auth.store';

// Helpers
function getInitials(name: string) {
  if (!name) return 'U';
  const words = name.trim().split(' ');
  if (words.length >= 2) {
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function getAvatarBg(name: string) {
  const colors = [
    'bg-secondary-container text-on-secondary-container',
    'bg-tertiary-fixed text-on-tertiary-fixed',
    'bg-primary-fixed text-on-primary-fixed'
  ];
  const hash = name ? name.charCodeAt(0) % colors.length : 0;
  return colors[hash];
}

function getStatusConfig(status: string) {
  switch (status?.toLowerCase()) {
    case 'hoạt động':
    case 'active':
      return { text: 'Hoạt động', bg: 'bg-[#bbf7d0]', color: 'text-[#166534]' };
    case 'tạm khóa':
    case 'locked':
      return { text: 'Tạm khóa', bg: 'bg-[#fef08a]', color: 'text-[#854d0e]' };
    default:
      return { text: 'Vô hiệu hóa', bg: 'bg-[#fecaca]', color: 'text-[#991b1b]' };
  }
}

export function CoordinatorTable() {
  const [data, setData] = useState<CoordinatorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const companyId = useAuthStore((state) => state.company_id);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await requestGetCoordinators(companyId, page, limit);
        setData(response.coordinators);
        setTotal(response.total);
      } catch (error) {
        console.error("Lỗi lấy danh sách ĐPV:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, companyId, limit]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[18px] h-[18px]" />
            <input 
              placeholder="Tìm kiếm theo tên, email, sđt..."
              className="w-full pl-9 pr-3 py-1.5 h-[36px] bg-surface-container-lowest border border-outline-variant rounded text-body-sm font-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <button className="h-[36px] px-3 border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center p-0 w-11 shadow-none">
            <Filter className="w-[18px] h-[18px]" />
          </button>
        </div>
        <div className="flex gap-2 w-full sm:w-auto self-end">
          <button className="text-body-sm font-body-sm text-on-surface-variant px-3 h-[36px] border border-outline-variant rounded hover:bg-surface-container transition-colors flex items-center gap-1 shadow-none">
            <Download className="w-[16px] h-[16px]" />
            Xuất File
          </button>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="overflow-x-auto min-h-[250px] relative">
        {loading && (
          <div className="absolute inset-0 bg-surface-container-lowest/50 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        )}
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#C4E2F5] border-b border-outline-variant">
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Họ và tên</th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Số điện thoại</th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Email</th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Trạng thái</th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">Ngày tạo</th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="font-data-tabular text-data-tabular text-on-surface">
            {!loading && data.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-on-surface-variant">Không tìm thấy dữ liệu.</td>
              </tr>
            ) : (
              data.map((item) => {
                const profile = item.profiles;
                const status = getStatusConfig(profile?.status);
                return (
                  <tr key={item.coordinator_id} className="border-b border-outline-variant hover:bg-primary-fixed/30 transition-colors h-[40px]">
                    <td className="px-4 py-1.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${getAvatarBg(profile?.full_name)} flex items-center justify-center font-label-sm text-[10px]`}>
                          {getInitials(profile?.full_name)}
                        </div>
                        <span className="font-medium text-sm">{profile?.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{profile?.phone_number || '---'}</td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{profile?.email}</td>
                    <td className="px-4 py-1.5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded ${status.bg} ${status.color} font-label-sm text-[10px]`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">
                      {item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '---'}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-right">
                      <button className="p-1 text-on-surface-variant hover:text-primary transition-colors focus:outline-none" title="Chỉnh sửa">
                        <Edit2 className="w-[18px] h-[18px]" />
                      </button>
                      {profile?.status === 'active' ? (
                        <button className="p-1 text-on-surface-variant hover:text-error transition-colors focus:outline-none" title="Vô hiệu hóa">
                          <Ban className="w-[18px] h-[18px]" />
                        </button>
                      ) : (
                        <button className="p-1 text-on-surface-variant hover:text-[#166534] transition-colors focus:outline-none" title="Kích hoạt">
                          <Unlock className="w-[18px] h-[18px]" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
        <div>Hiển thị {Math.min((page - 1) * limit + 1, total)}-{Math.min(page * limit, total)} trong {total} tài khoản</div>
        <div className="flex items-center gap-1">
          <button 
            className="p-1 rounded hover:bg-surface-container disabled:opacity-50" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>
          
          <button className="w-7 h-7 rounded bg-primary-container text-on-primary-container font-medium flex items-center justify-center">
            {page}
          </button>
          
          <span className="px-1 text-xs">/ {totalPages}</span>
          
          <button 
            className="p-1 rounded hover:bg-surface-container disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
          >
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
