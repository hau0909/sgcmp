"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { Booking, BookingStatus } from "../types";
import { useTranslation } from "@/components/providers/LanguageProvider";

interface BookingTableProps {
  bookings: Booking[];
  totalCount: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onViewDetails?: (bookingId: string) => void;
  viewMode?: "company" | "customer";
}

function getStatusBadge(status: BookingStatus, dict: any) {
  switch (status) {
    case "pending":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200">
          {dict.booking.filters.status_pending}
        </span>
      );
    case "quoted":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border-amber-200">
          {dict.booking.filters.status_quoted}
        </span>
      );
    case "accepted":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border-emerald-200">
          {dict.booking.filters.status_accepted}
        </span>
      );
    case "rejected":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border-red-200">
          {dict.booking.filters.status_rejected}
        </span>
      );
    case "canceled":
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded border text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-700 border-slate-200">
          {dict.booking.filters.status_canceled}
        </span>
      );
    default:
      return null;
  }
}

export function BookingTable({
  bookings,
  totalCount,
  page,
  limit,
  onPageChange,
  onViewDetails,
  viewMode = "company",
}: BookingTableProps) {
  const { dict } = useTranslation();

  const totalPages = Math.ceil(totalCount / limit) || 1;
  const startIdx = totalCount === 0 ? 0 : (page - 1) * limit + 1;
  const endIdx = Math.min(page * limit, totalCount);

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#C4E2F5] border-b border-outline-variant">
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap w-16 text-center">
                {dict.booking.table.stt}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.booking.table.booking_code}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {viewMode === "customer" ? dict.booking.table.company : dict.booking.table.customer}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.booking.table.service}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.booking.table.guards}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
                {dict.booking.table.execution_date}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap ">
                {dict.booking.table.status}
              </th>
              <th className="py-2.5 px-4 font-label-md text-label-md text-on-surface-variant whitespace-nowrap text-right w-32">
                {dict.booking.table.actions}
              </th>
            </tr>
          </thead>
          <tbody className="text-xs text-on-surface">
            {bookings.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-8 text-center text-on-surface-variant/80 font-medium bg-surface-bright"
                >
                  {dict.booking.table.no_data}
                </td>
              </tr>
            ) : (
              bookings.map((booking, index) => {
                const displayCode = `#BKG-${booking.booking_id.slice(0, 5).toUpperCase()}`;
                const displayDates = `${new Date(booking.start_date).toLocaleDateString("vi-VN")} - ${new Date(booking.end_date).toLocaleDateString("vi-VN")}`;

                return (
                  <tr
                    key={booking.booking_id}
                    className="border-b border-outline-variant/30 hover:bg-primary-fixed/30 transition-colors h-[40px]"
                  >
                    <td className="px-4 py-1.5 whitespace-nowrap text-on-surface-variant text-center font-mono">
                      {startIdx + index}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-mono font-bold text-primary">
                      <button
                        onClick={() => onViewDetails?.(booking.booking_id)}
                        className="hover:underline hover:text-primary transition-colors text-left"
                      >
                        {displayCode}
                      </button>
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-semibold text-on-surface">
                      {viewMode === "customer"
                        ? (booking.company_name || dict.booking.table.default_company || "Doanh nghiệp bảo vệ")
                        : (booking.customer_name || dict.booking.table.default_customer || "Khách hàng doanh nghiệp")}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-medium text-on-surface-variant">
                      {booking.service_name || dict.booking.table.default_service || "Dịch vụ chưa xác định"}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-mono font-medium text-on-surface-variant">
                      {booking.guards_per_slot} {dict.booking.table.personnel || "Nhân sự"}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap font-mono text-on-surface-variant">
                      {displayDates}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-start">
                      {getStatusBadge(booking.status, dict)}
                    </td>
                    <td className="px-4 py-1.5 whitespace-nowrap text-right">
                      <button
                        onClick={() => onViewDetails?.(booking.booking_id)}
                        className="text-xs font-semibold text-secondary hover:text-primary transition-colors cursor-pointer"
                      >
                        {dict.booking.table.view_details}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-outline-variant bg-surface-container-lowest flex items-center justify-between text-body-sm font-body-sm text-on-surface-variant">
        <div>
          {dict.booking.table.showing} {startIdx}-{endIdx} / {totalCount} {dict.booking.table.results}
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
