"use client";

import type { PaymentStatus } from "@/types/Enum";
import { useTranslation } from "@/components/providers/LanguageProvider";

type StatusBadgeProps = {
    status: PaymentStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
    const { dict, locale } = useTranslation();
    const isEn = locale === "en";

    const STATUS_CONFIG: Record<
        PaymentStatus,
        { label: string; className: string; dotClassName: string }
    > = {
        completed: {
            label: dict?.admin_payment_history?.status_completed || (isEn ? "Success" : "Thành công"),
            className: "bg-emerald-50 text-emerald-700",
            dotClassName: "bg-emerald-500",
        },
        pending: {
            label: dict?.admin_payment_history?.status_pending || (isEn ? "Processing" : "Chờ xử lý"),
            className: "bg-orange-50 text-orange-700",
            dotClassName: "bg-orange-500",
        },
        failed: {
            label: dict?.admin_payment_history?.status_failed || (isEn ? "Failed" : "Thất bại"),
            className: "bg-red-50 text-red-700",
            dotClassName: "bg-red-500",
        },
        refunded: {
            label: dict?.admin_payment_history?.status_refunded || (isEn ? "Refunded" : "Hoàn tiền"),
            className: "bg-purple-50 text-purple-700",
            dotClassName: "bg-purple-500",
        },
    };

    const config = STATUS_CONFIG[status] || {
        label: status,
        className: "bg-slate-50 text-slate-700",
        dotClassName: "bg-slate-500",
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap ${config.className}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full ${config.dotClassName}`} />
            {config.label}
        </span>
    );
}
