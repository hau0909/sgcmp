"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Contract, ContractStatus } from "../types";

interface ContractTableProps {
  contracts: Contract[];
  totalCount: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onViewDetails?: (contractId: string) => void;
}

function getStatusBadge(status: ContractStatus) {
  switch (status) {
    case "pending_hardcopy":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
          Chờ bản cứng
        </span>
      );
    case "pending_consent":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200">
          Chờ đồng thuận
        </span>
      );
    case "completed":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
          Đã hoàn thành
        </span>
      );
    default:
      return null;
  }
}

export function ContractTable({
  contracts,
  totalCount,
  page,
  limit,
  onPageChange,
  onViewDetails,
}: ContractTableProps) {
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const startIdx = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalCount);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col">
      <div className="overflow-x-auto min-h-[200px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#C4E2F5] border-b border-outline-variant">
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-16 text-center">
                STT
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                Mã Hợp Đồng
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                Khách Hàng
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                Dịch Vụ
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                Ngày Tạo
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                Trạng Thái
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right w-32">
                Hành Động
              </th>
            </tr>
          </thead>
          <tbody className="text-xs text-on-surface">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-on-surface-variant/80 font-medium bg-surface-bright">
                  Không tìm thấy hợp đồng nào.
                </td>
              </tr>
            ) : (
              contracts.map((contract, index) => (
                <tr
                  key={contract.id}
                  className="border-b border-outline-variant/30 hover:bg-primary-fixed/30 transition-colors h-[40px]"
                >
                  <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant text-center font-mono">
                    {startIdx + index}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap font-mono font-bold text-primary">
                    {contract.contractCode}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap font-semibold text-on-surface">
                    {contract.customerName}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">
                    {contract.serviceName}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap font-mono text-on-surface-variant">
                    {contract.createdAt}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">{getStatusBadge(contract.status)}</td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-right">
                    <button
                      onClick={() => onViewDetails?.(contract.id)}
                      className="text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant border-t">
        <div>
          Hiển thị {startIdx}-{endIdx} trong {totalCount} kết quả
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-50 cursor-pointer"
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>

          <button className="w-7 h-7 rounded bg-primary-container text-on-primary-container font-medium flex items-center justify-center text-xs">
            {page}
          </button>

          <span className="px-1 text-xs">/ {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-50 cursor-pointer"
          >
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
