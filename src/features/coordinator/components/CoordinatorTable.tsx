"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { requestGetCoordinators } from '../api/coordinator.api';
import { CoordinatorWithUser } from '../types';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/components/providers/LanguageProvider';

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

interface CoordinatorTableProps {
  searchStr?: string;
  statusFilter?: string;
}

export function CoordinatorTable({ searchStr = "", statusFilter = "" }: CoordinatorTableProps) {
  const { dict, locale } = useTranslation();
  const dateLocale = locale === "en" ? "en-US" : "vi-VN";

  const [data, setData] = useState<CoordinatorWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const router = useRouter();

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(total / limit) || 1;

  const companyId = useAuthStore((state) => state.company_id);
  const startIdx = total === 0 ? 0 : (page - 1) * limit + 1;

  const getStatusConfig = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'hoạt động':
      case 'active':
        return { key: 'active', text: dict.coordinator?.status_text_active || 'Hoạt động', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { key: 'inactive', text: dict.coordinator?.status_text_disabled || 'Vô hiệu hóa', classes: 'bg-rose-50 text-rose-700 border-rose-200' };
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [searchStr, statusFilter]);

  useEffect(() => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await requestGetCoordinators(companyId, page, limit, searchStr);
        let results = response.coordinators || [];
        if (statusFilter) {
          results = results.filter(item => getStatusConfig(item.profiles?.status).key === statusFilter.toLowerCase());
        }
        setData(results);
        setTotal(statusFilter ? results.length : response.total);
      } catch (error) {
        console.error("Lỗi lấy danh sách ĐPV:", error);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [page, companyId, limit, searchStr, statusFilter]);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
          <p className="text-xs text-on-surface-variant/80 font-medium">
            {dict.coordinator?.loading || "Đang tải danh sách điều phối viên..."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto min-h-[250px] relative">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#C4E2F5] border-b border-outline-variant">
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-16 text-center">{dict.coordinator?.table_stt || "STT"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-12 text-center">{dict.coordinator?.table_avatar || "Ảnh"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{dict.coordinator?.table_name || "Họ và tên"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{dict.coordinator?.table_phone || "Số điện thoại"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{dict.coordinator?.table_email || "Email"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{dict.coordinator?.table_status || "Trạng thái"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">{dict.coordinator?.table_created || "Ngày tạo"}</th>
                <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right w-32">{dict.coordinator?.table_action || "Hành Động"}</th>
              </tr>
            </thead>
            <tbody className="font-data-tabular text-data-tabular text-on-surface">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-on-surface-variant">
                    {dict.coordinator?.no_data || "Không tìm thấy dữ liệu."}
                  </td>
                </tr>
              ) : (
                data.map((item, index) => {
                  const profile = item.profiles;
                  const status = getStatusConfig(profile?.status);
                  return (
                    <tr key={item.coordinator_id} className="border-b border-outline-variant hover:bg-primary-fixed/30 transition-colors h-[40px]">
                      <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant text-center font-mono">
                        {startIdx + index}
                      </td>
                      <td className="px-4 py-1.5 whitespace-nowrap text-center">
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt={profile.full_name || 'Avatar'}
                            className="w-7 h-7 rounded-full object-cover border border-outline-variant/30 mx-auto"
                          />
                        ) : (
                          <div className={`w-7 h-7 rounded-full ${getAvatarBg(profile?.full_name)} flex items-center justify-center font-label-sm text-[11px] mx-auto`}>
                            {getInitials(profile?.full_name)}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-1.5 whitespace-nowrap font-medium text-sm">{profile?.full_name}</td>
                      <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{profile?.phone_number || '---'}</td>
                      <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{profile?.email}</td>
                      <td className="px-4 py-1.5 whitespace-nowrap">
                        <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${status.classes}`}>
                          {status.text}
                        </span>
                      </td>
                      <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">
                        {item.created_at ? new Date(item.created_at).toLocaleDateString(dateLocale) : '---'}
                      </td>
                      <td className="px-4 py-1.5 whitespace-nowrap text-right">
                        <button
                          className="text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
                          onClick={() => router.push(`/coordinators/${item.coordinator_id}`)}
                        >
                          {dict.coordinator?.view_detail || "Xem chi tiết"}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && (
        <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
          <div>
            {(dict.coordinator?.pagination_show || "Hiển thị {0}-{1} trong {2} tài khoản")
              .replace("{0}", String(Math.min((page - 1) * limit + 1, total)))
              .replace("{1}", String(Math.min(page * limit, total)))
              .replace("{2}", String(total))}
          </div>
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
      )}
    </div>
  );
}
