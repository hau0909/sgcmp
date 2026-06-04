"use client";

import React, { useState } from 'react';
import { Search, Filter, Download, Edit2, Ban, Unlock, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';


const data = [
  { id: '1', name: 'Lê Văn Cường', initials: 'LC', avatarBg: 'bg-secondary-container text-on-secondary-container', phone: '0987 654 321', email: 'cuong.le@sgcmp.vn', status: 'Hoạt động', statusBg: 'bg-[#bbf7d0]', statusColor: 'text-[#166534]', date: '12/10/2023' },
  { id: '2', name: 'Phạm Thị Hoa', initials: 'PH', avatarBg: 'bg-tertiary-fixed text-on-tertiary-fixed', phone: '0912 345 678', email: 'hoa.pham@sgcmp.vn', status: 'Hoạt động', statusBg: 'bg-[#bbf7d0]', statusColor: 'text-[#166534]', date: '15/09/2023' },
  { id: '3', name: 'Nguyễn Văn Minh', initials: 'NM', avatarBg: 'bg-primary-fixed text-on-primary-fixed', phone: '0909 111 222', email: 'minh.nguyen@sgcmp.vn', status: 'Tạm khóa', statusBg: 'bg-[#fef08a]', statusColor: 'text-[#854d0e]', date: '01/11/2023' },
  { id: '4', name: 'Trần Thanh Tùng', initials: 'TT', avatarBg: 'bg-secondary-container text-on-secondary-container', phone: '0933 444 555', email: 'tung.tran@sgcmp.vn', status: 'Vô hiệu hóa', statusBg: 'bg-[#fecaca]', statusColor: 'text-[#991b1b]', date: '20/08/2023' },
  { id: '5', name: 'Hoàng Lê Lợi', initials: 'HL', avatarBg: 'bg-tertiary-fixed text-on-tertiary-fixed', phone: '0977 888 999', email: 'loi.hoang@sgcmp.vn', status: 'Hoạt động', statusBg: 'bg-[#bbf7d0]', statusColor: 'text-[#166534]', date: '05/12/2023' },
];

export function CoordinatorTable() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] overflow-hidden">
      {/* Toolbar */}
      <div className="p-4 border-b border-outline-variant flex flex-col sm:flex-row gap-4 justify-between items-center bg-surface-container-lowest">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-[18px] h-[18px]" />
            <input 
              placeholder="Tìm kiếm theo tên, email, sđt..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
      <div className="overflow-x-auto">
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
            {data.map((item) => (
              <tr key={item.id} className="border-b border-outline-variant hover:bg-primary-fixed/30 transition-colors h-[40px]">
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${item.avatarBg} flex items-center justify-center font-label-sm text-[10px]`}>
                      {item.initials}
                    </div>
                    <span className="font-medium text-sm">{item.name}</span>
                  </div>
                </td>
                <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{item.phone}</td>
                <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{item.email}</td>
                <td className="px-4 py-1.5 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded ${item.statusBg} ${item.statusColor} font-label-sm text-[10px]`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">{item.date}</td>
                <td className="px-4 py-1.5 whitespace-nowrap text-right">
                  <button className="p-1 text-on-surface-variant hover:text-primary transition-colors focus:outline-none">
                    <Edit2 className="w-[18px] h-[18px]" />
                  </button>
                  {item.status === 'Tạm khóa' ? (
                    <button className="p-1 text-on-surface-variant hover:text-[#166534] transition-colors focus:outline-none">
                      <Unlock className="w-[18px] h-[18px]" />
                    </button>
                  ) : item.status === 'Vô hiệu hóa' ? (
                    <button className="p-1 text-on-surface-variant hover:text-error transition-colors focus:outline-none">
                      <Trash2 className="w-[18px] h-[18px]" />
                    </button>
                  ) : (
                    <button className="p-1 text-on-surface-variant hover:text-error transition-colors focus:outline-none">
                      <Ban className="w-[18px] h-[18px]" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
        <div>Hiển thị 1-5 trong 42 tài khoản</div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded hover:bg-surface-container disabled:opacity-50" disabled>
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>
          <button className="w-7 h-7 rounded bg-primary-container text-on-primary-container font-medium flex items-center justify-center">1</button>
          <button className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center">2</button>
          <button className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center">3</button>
          <span className="px-1">...</span>
          <button className="w-7 h-7 rounded hover:bg-surface-container flex items-center justify-center">9</button>
          <button className="p-1 rounded hover:bg-surface-container">
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
