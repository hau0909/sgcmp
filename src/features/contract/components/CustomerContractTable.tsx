"use client";

import React from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Contract } from "@/types/Contract";
import { ContractStatus } from "@/types/Enum";
import Link from "next/link";
import { CustomerContract } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CustomerContractTableProps {
  contracts: CustomerContract[];
  totalCount: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
}

function getStatusBadge(status: ContractStatus, dict: any) {
  switch (status) {
    case "pending_signatures":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
          {dict.contract.filters.status_pending_signatures}
        </span>
      );
    case "active":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200">
          {dict.contract.filters.status_active}
        </span>
      );
    case "completed":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
          {dict.contract.filters.status_completed}
        </span>
      );
    case "cancelled":
      return (
        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-slate-100 text-slate-700 border-slate-300">
          {dict.contract.filters.status_cancelled}
        </span>
      );
    default:
      return null;
  }
}

export function CustomerContractTable({
  contracts,
  totalCount,
  page,
  limit,
  onPageChange,
}: CustomerContractTableProps) {
  const { dict } = useTranslation();

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const startIdx = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalCount);

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] flex flex-col">
      <div className="overflow-x-auto min-h-[200px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#C4E2F5] border-b border-outline-variant">
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-14 text-center">
                {dict.contract.table.stt}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.contract.table.contract_code}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.contract.table.service}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.contract.table.company}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.contract.table.created_date}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.contract.table.duration}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.contract.table.status}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right w-32">
                {dict.contract.table.actions}
              </th>
            </tr>
          </thead>
          <tbody className="text-xs text-on-surface">
            {contracts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-16 text-center text-on-surface-variant/80 bg-surface-bright">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center">
                      <FileText className="w-7 h-7 text-outline-variant" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-on-surface-variant">{dict.contract.table.no_data_title}</p>
                      <p className="text-xs text-on-surface-variant/70 mt-1">{dict.contract.table.no_data_desc}</p>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              contracts.map((contract, index) => (
                <tr
                  key={contract.contract_id}
                  className="border-b border-outline-variant/30 hover:bg-primary-fixed/30 transition-colors h-[40px]"
                >
                  <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant text-center font-mono">
                    {startIdx + index}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap font-mono font-bold text-primary">
                    {contract.contract_code || `HD-${contract.contract_id.slice(0, 8).toUpperCase()}`}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-on-surface font-medium">
                    {contract.service_name || "—"}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant">
                    {contract.company_name || "—"}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap font-mono text-on-surface-variant">
                    {contract.created_at ? new Date(contract.created_at).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap font-mono text-on-surface-variant">
                    {contract.start_date ? new Date(contract.start_date).toLocaleDateString("vi-VN") : "—"}{" — "}
                    {contract.end_date ? new Date(contract.end_date).toLocaleDateString("vi-VN") : "—"}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap">
                    {getStatusBadge(contract.status, dict)}
                  </td>
                  <td className="px-4 py-1.5 whitespace-nowrap text-right">
                    <Link
                      href={`/my-contracts/${contract.contract_id}`}
                      className="text-xs font-semibold text-secondary hover:text-primary transition-colors"
                    >
                      {dict.contract.table.view_details}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
        <div className="text-xs">
          {dict.contract.table.showing} <span className="font-semibold text-on-surface">{startIdx}–{endIdx}</span> {dict.contract.table.in}{" "}
          <span className="font-semibold text-on-surface">{totalCount}</span> {dict.contract.table.results}
        </div>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-[18px] h-[18px]" />
          </button>

          <button className="w-7 h-7 rounded bg-primary-container text-on-primary-container font-semibold flex items-center justify-center text-xs">
            {page}
          </button>

          <span className="px-1 text-xs text-on-surface-variant">/ {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1 rounded hover:bg-surface-container disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-[18px] h-[18px]" />
          </button>
        </div>
      </div>
    </div>
  );
}
