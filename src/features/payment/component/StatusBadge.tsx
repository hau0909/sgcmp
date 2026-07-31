"use client";

import type { PaymentStatus } from "@/types/Enum";
import { useTranslation } from "@/components/providers/LanguageProvider";

type StatusBadgeProps = {
    status: PaymentStatus;
};

const STATUS_CONFIG: Record<
    PaymentStatus,
    { key: "status_completed" | "status_pending" | "status_failed" | "status_refunded"; className: string; dotClassName: string }
> = {
    completed: {
        key: "status_completed",
        className: "bg-emerald-50 text-emerald-700",
        dotClassName: "bg-emerald-500",
    },
    pending: {
        key: "status_pending",
        className: "bg-orange-50 text-orange-700",
        dotClassName: "bg-orange-500",
    },
    failed: {
        key: "status_failed",
        className: "bg-red-50 text-red-700",
        dotClassName: "bg-red-500",
    },
    refunded: {
        key: "status_refunded",
        className: "bg-purple-50 text-purple-700",
        dotClassName: "bg-purple-500",
    },
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const { dict } = useTranslation();
    const config = STATUS_CONFIG[status];
    const label = dict.admin_payment_history?.[config?.key] || status;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap ${config?.className || ""}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config?.dotClassName || ""}`} />
            {label}
        </span>
    );
}
