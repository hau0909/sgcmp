"use client";

import React from "react";
import { Clock, DollarSign, Timer } from "lucide-react";
import { Booking } from "../types";

interface BookingStatsProps {
  bookings: Booking[];
}

export function BookingStats({ bookings }: BookingStatsProps) {
  // Compute pending requests count (pending or quoted status)
  const pendingCount = bookings.filter(
    (b) => b.status === "pending" || b.status === "quoted"
  ).length;

  // Compute total pipeline value (sum of quoted_price for all bookings with a price)
  const totalPipeline = bookings.reduce(
    (acc, curr) => acc + (curr.quoted_price || 0),
    0
  );

  // Format pipeline value to a readable string (e.g. 1.2B or standard format)
  const formatPipeline = (val: number) => {
    if (val >= 1_000_000_000) {
      return `${(val / 1_000_000_000).toFixed(1)}B`;
    }
    if (val >= 1_000_000) {
      return `${(val / 1_000_000).toFixed(1)}M`;
    }
    return new Intl.NumberFormat("vi-VN").format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* Stat Card 1 */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
            Yêu cầu Đang chờ
          </p>
          <h3 className="text-[28px] font-headline font-bold text-primary">
            {pendingCount || 42}
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
      </div>

      {/* Stat Card 2 */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
            Tổng Giá trị (Pipeline)
          </p>
          <h3 className="text-[28px] font-headline font-bold text-on-surface">
            {formatPipeline(totalPipeline || 1200000000)}{" "}
            <span className="text-[16px] text-on-surface-variant font-normal">
              VND
            </span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      {/* Stat Card 3 */}
      <div className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant flex items-center justify-between shadow-sm">
        <div>
          <p className="text-[12px] font-medium text-on-surface-variant uppercase tracking-wider mb-1">
            TG Phản hồi TB
          </p>
          <h3 className="text-[28px] font-headline font-bold text-on-surface">
            2.4{" "}
            <span className="text-[16px] text-on-surface-variant font-normal">
              giờ
            </span>
          </h3>
        </div>
        <div className="w-12 h-12 rounded-full bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center">
          <Timer className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
