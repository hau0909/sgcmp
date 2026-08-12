"use client";

import React from "react";
import { calculateContractProgress } from "../utils/contractProgress";

interface ContractProgressBarProps {
  startDate?: string | null;
  endDate?: string | null;
  variant?: "table" | "card";
  statusText?: string;
  className?: string;
}

export function ContractProgressBar({
  startDate,
  endDate,
  variant = "table",
  statusText,
  className = "",
}: ContractProgressBarProps) {
  const progress = calculateContractProgress(startDate, endDate);

  // Dynamic gradient based on percentage
  const getGradient = (pct: number) => {
    if (pct >= 80) return "from-teal-500 to-emerald-600";
    if (pct >= 50) return "from-blue-500 to-teal-500";
    if (pct >= 25) return "from-indigo-500 to-blue-500";
    return "from-blue-600 to-indigo-600";
  };

  if (variant === "table") {
    return (
      <div className={`flex flex-col gap-0.5 min-w-[100px] max-w-[140px] ${className}`}>
        {statusText && (
          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider bg-blue-50 text-blue-700 border-blue-200 w-fit">
            {statusText}
          </span>
        )}
        <div className="flex items-center gap-1.5 w-full">
          <div className="flex-1 bg-blue-100 dark:bg-blue-950/50 rounded-full h-1.5 overflow-hidden border border-blue-200/80 dark:border-blue-800/80 p-[0.5px]">
            <div
              className={`bg-gradient-to-r ${getGradient(progress.percentage)} h-full rounded-full transition-all duration-500`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-700 dark:text-blue-400 shrink-0">
            {progress.formattedPercentage}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50/80 to-teal-50/50 dark:from-blue-950/40 dark:to-teal-950/20 border border-blue-200/80 dark:border-blue-800/80 rounded-xl p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-blue-900 dark:text-blue-200 uppercase tracking-wider font-headline">
            Tiến độ thực hiện hợp đồng
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
            {progress.statusLabel}
          </span>
        </div>
        <span className="text-xl font-black font-mono text-blue-700 dark:text-blue-400">
          {progress.formattedPercentage}
        </span>
      </div>

      <div className="w-full bg-blue-200/60 dark:bg-blue-900/60 rounded-full h-3 overflow-hidden p-[1px] border border-blue-300/60 dark:border-blue-700/60">
        <div
          className={`bg-gradient-to-r ${getGradient(progress.percentage)} h-full rounded-full transition-all duration-500 shadow-inner`}
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
