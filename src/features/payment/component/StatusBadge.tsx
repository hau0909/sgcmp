"use client";

import type { PaymentStatus } from "@/types/Enum";

type StatusBadgeProps = {
    status: PaymentStatus;
};

const STATUS_CONFIG: Record<
    PaymentStatus,
    { label: string; className: string; dotClassName: string }
> = {
    completed: {
        label: "Thành công",
        className: "bg-emerald-50 text-emerald-700",
        dotClassName: "bg-emerald-500",
    },
    pending: {
        label: "Chờ xử lý",
        className: "bg-orange-50 text-orange-700",
        dotClassName: "bg-orange-500",
    },
    failed: {
        label: "Thất bại",
        className: "bg-red-50 text-red-700",
        dotClassName: "bg-red-500",
    },
    refunded: {
        label: "Hoàn tiền",
        className: "bg-purple-50 text-purple-700",
        dotClassName: "bg-purple-500",
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap ${config.className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
            {config.label}
        </span>
    );
}
