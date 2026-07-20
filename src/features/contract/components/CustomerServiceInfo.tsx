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
import { useTranslation } from "@/components/providers/LanguageProvider";

interface CustomerServiceInfoProps {
  serviceName: string;
  quantity: number;
  duration: string;
  location: string;
  timeSlots?: string[];
  description?: string | null;
}

export function CustomerServiceInfo({
  serviceName,
  quantity,
  duration,
  location,
  timeSlots = [],
  description = null,
}: CustomerServiceInfoProps) {
  const { dict } = useTranslation();

  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm relative overflow-hidden flex-1">
      <div className="absolute top-0 right-0 w-24 h-24 bg-secondary/5 rounded-bl-full pointer-events-none" />

      <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <Briefcase className="w-5 h-5 text-secondary" />
        <span>{dict.contract.detail.service_info_title}</span>
      </h3>

      <div className="space-y-4">
        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract.detail.service_name}
          </span>
          <span className="text-sm font-semibold text-on-surface">{serviceName}</span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract.detail.quantity}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Users className="w-4 h-4 text-outline-variant" />
            {quantity} {dict.contract.detail.guards_unit}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract.detail.duration}
          </span>
          <span className="text-sm font-semibold text-on-surface font-mono flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-outline-variant" />
            {duration}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1">
            {dict.contract.detail.location}
          </span>
          <span className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-outline-variant" />
            {location}
          </span>
        </div>

        {timeSlots.length > 0 && (
          <div className="flex flex-col pt-1">
            <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">
              {dict.contract.detail.time_slots}
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
              {dict.contract.detail.note}
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
