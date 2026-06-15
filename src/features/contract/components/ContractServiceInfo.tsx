"use client";

import React from "react";
import {
  Briefcase,
  Calendar,
  Users,
  MapPin,
  Clock,
  FileText,
} from "lucide-react";

interface ContractServiceInfoProps {
  serviceName: string;
  quantity: number;
  duration: string;
  location: string;
  timeSlots?: string[];
  description?: string | null;
}

export function ContractServiceInfo({
  serviceName,
  quantity,
  duration,
  location,
  timeSlots = [],
  description = null,
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

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Số lượng bảo vệ
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-outline-variant" />
            {quantity} nhân sự
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Thời hạn thuê
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-outline-variant" />
            <span>{duration}</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            Địa điểm thực hiện nhiệm vụ
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-outline-variant" />
            <span>{location}</span>
          </span>
        </div>

        {timeSlots && timeSlots.length > 0 && (
          <div className="flex flex-col pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              KHUNG GIỜ YÊU CẦU BẢO VỆ
            </span>
            <div className="flex flex-wrap gap-2">
              {timeSlots.map((slot, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-surface-container-low border border-outline-variant/60 rounded-md text-xs font-semibold text-secondary font-mono"
                >
                  <Clock className="w-3 h-3 text-outline-variant" />
                  {slot}
                </span>
              ))}
            </div>
          </div>
        )}

        {description && (
          <div className="flex flex-col pt-2 border-t border-outline-variant/30">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
              Lưu ý / Mô tả yêu cầu chi tiết
            </span>
            <div className="text-xs text-on-surface-variant bg-surface-container-low/50 border border-outline-variant/30 rounded-lg p-3 leading-relaxed flex gap-2">
              <FileText className="w-4 h-4 text-outline-variant mt-0.5 shrink-0" />
              <span>{description}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
