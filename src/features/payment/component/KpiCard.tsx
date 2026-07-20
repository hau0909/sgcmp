"use client";

import type { ReactNode } from "react";

type KpiCardProps = {
    title: string;
    value: string;
    description: string;
    icon: ReactNode;
    /** Tailwind bg + text classes for the icon container, e.g. "bg-emerald-50 text-emerald-600" */
    iconColor?: string;
};

export function KpiCard({
    title,
    value,
    description,
    icon,
    iconColor = "bg-blue-50 text-blue-700",
}: KpiCardProps) {
    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
                    <p className="mt-1 text-xs text-slate-500">{description}</p>
                </div>
                <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconColor}`}
                >
                    {icon}
                </div>
            </div>
        </div>
    );
}
