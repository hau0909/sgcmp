"use client";

import React from "react";
import { History } from "lucide-react";

interface HistoryItem {
  time: string;
  title: string;
  description: string;
  isLatest?: boolean;
}

interface ContractHistoryLogProps {
  history: HistoryItem[];
}

export function ContractHistoryLog({ history }: ContractHistoryLogProps) {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-sm h-full">
      <h3 className="text-base font-bold text-on-surface mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-2 font-headline">
        <History className="w-5 h-5 text-secondary" />
        <span>Lịch sử thay đổi</span>
      </h3>

      <div className="relative border-l border-outline-variant/60 ml-3 space-y-6 pb-2">
        {history.map((item, idx) => (
          <div key={idx} className="relative pl-6">
            {/* Timeline Dot Indicator */}
            <div
              className={`absolute -left-1.5 top-1 w-3 h-3 rounded-full border-2 border-surface-container-lowest ring-4 ring-surface-container-lowest
                ${item.isLatest ? "bg-primary" : "bg-outline-variant"}`}
            />
            <p className="text-[11px] font-bold text-on-surface-variant font-mono tracking-wider">
              {item.time}
            </p>
            <p className="text-sm font-semibold text-on-background mt-1">
              {item.title}
            </p>
            <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
