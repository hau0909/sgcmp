"use client";

import React from "react";
import { Briefcase, Calendar, Users, MapPin } from "lucide-react";

interface ContractServiceInfoProps {
  serviceName: string;
  quantity: number;
  duration: string;
  location: string;
}

export function ContractServiceInfo({
  serviceName,
  quantity,
  duration,
  location,
}: ContractServiceInfoProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden flex-1">
      {/* Decorative top-right curved gradient block */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none"></div>

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Briefcase className="w-5 h-5 text-secondary" />
        <span>Thông tin dịch vụ</span>
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Dịch vụ
          </span>
          <span className="text-sm font-semibold text-on-surface">
            {serviceName}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Số lượng
            </span>
            <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
              <Users className="w-4 h-4 text-outline-variant" />
              {quantity} nhân sự
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Thời gian
            </span>
            <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-outline-variant" />
              <span>{duration}</span>
            </span>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Địa điểm
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-outline-variant" />
            <span>{location}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
