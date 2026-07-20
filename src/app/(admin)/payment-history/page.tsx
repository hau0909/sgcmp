"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
    BadgeDollarSign,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    CircleCheckBig,
    CircleX,
    Clock3,
    Download,
    Eye,
    Loader2,
    Search,
    Building2,
} from "lucide-react";

import { DateRangePicker } from "@/features/payment/component/DateRangePicker";
import { KpiCard } from "@/features/payment/component/KpiCard";
import { StatusBadge } from "@/features/payment/component/StatusBadge";
import {
    statusOptions,
    type DateRange,
} from "@/features/payment/types";
import { formatPrice } from "@/utils/formatPrice";
import type { PaymentMethod, PaymentStatus } from "@/types/Enum";
import type { PaymentWithCompany } from "@/features/payment/controller/payment.controller";

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
    bank_transfer: "Chuyển khoản ngân hàng",
    credit_card: "Thẻ tín dụng",
    e_wallet: "Ví điện tử",
};

const PAGE_SIZE = 10;

export default function AdminPaymentHistoryPage() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [status, setStatus] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);

    const [payments, setPayments] = useState<PaymentWithCompany[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch ALL payments once on mount
    useEffect(() => {
        let cancelled = false;

        const fetchPayments = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch("/api/admin/payment/history");
                const json = await res.json();

                if (!res.ok || !json.success) {
                    throw new Error(json.error ?? "Không thể tải dữ liệu");
                }

                if (!cancelled) {
                    setPayments(json.data);
                }
            } catch (err: any) {
                if (!cancelled) setError(err.message ?? "Đã xảy ra lỗi");
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        fetchPayments();
        return () => { cancelled = true; };
    }, []);

    // Filter payments completely client-side
    const filteredPayments = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return payments.filter((payment) => {
            // 1. Search Keyword filter
            const matchesSearch =
                !keyword ||
                (payment.transaction_code && payment.transaction_code.toLowerCase().includes(keyword)) ||
                (payment.company_name && payment.company_name.toLowerCase().includes(keyword)) ||
                (payment.company_id && payment.company_id.toLowerCase().includes(keyword));

            // 2. Status filter
            const matchesStatus = status === "all" || payment.payment_status === status;

            // 3. Date Range filter
            let matchesDate = true;
            if (dateRange.start || dateRange.end) {
                if (!payment.paid_at) {
                    matchesDate = false;
                } else {
                    const payDate = new Date(payment.paid_at);
                    if (dateRange.start) {
                        const start = new Date(dateRange.start);
                        start.setHours(0, 0, 0, 0);
                        if (payDate < start) matchesDate = false;
                    }
                    if (dateRange.end) {
                        const end = new Date(dateRange.end);
                        end.setHours(23, 59, 59, 999);
                        if (payDate > end) matchesDate = false;
                    }
                }
            }

            return matchesSearch && matchesStatus && matchesDate;
        });
    }, [payments, searchKeyword, status, dateRange]);

    // Client-side pagination calculations
    const total = filteredPayments.length;
    const totalPages = Math.ceil(total / PAGE_SIZE) || 1;

    const displayPayments = useMemo(() => {
        const startIdx = (currentPage - 1) * PAGE_SIZE;
        return filteredPayments.slice(startIdx, startIdx + PAGE_SIZE);
    }, [filteredPayments, currentPage]);

    // KPI summary calculated client-side based on filtered results
    const summary = useMemo(() => {
        let totalRevenue = 0;
        let successCount = 0;
        let pendingCount = 0;
        let failedCount = 0;

        for (const p of filteredPayments) {
            if (p.payment_status === "completed") {
                totalRevenue += p.amount || 0;
                successCount++;
            } else if (p.payment_status === "pending") {
                pendingCount++;
            } else if (p.payment_status === "failed") {
                failedCount++;
            }
        }

        return {
            totalRevenue,
            successCount,
            pendingCount,
            failedCount,
        };
    }, [filteredPayments]);

    // Reset to page 1 when filters change
    const handleStatusChange = (val: string) => {
        setStatus(val);
        setCurrentPage(1);
    };

    const handleDateChange = (r: DateRange) => {
        setDateRange(r);
        setCurrentPage(1);
    };

    const handleKeywordChange = (val: string) => {
        setSearchKeyword(val);
        setCurrentPage(1);
    };

    const handleExportReport = useCallback(() => {
        const headers = [
            "Mã giao dịch", "Công ty (ID)", "Gói", "Số tiền",
            "Phương thức", "Ngày thanh toán", "Trạng thái",
        ];
        const rows = filteredPayments.map((p) => [
            p.transaction_code ?? "",
            p.company_id,
            p.plan_name ?? "",
            p.amount.toString(),
            PAYMENT_METHOD_LABEL[p.payment_method as PaymentMethod] ?? p.payment_method,
            p.paid_at ?? "",
            p.payment_status,
        ]);
        const csv = [headers, ...rows]
            .map((row) => row.map((c) => `"${String(c).replaceAll('"', '""')}"`).join(","))
            .join("\n");
        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "payment-history.csv";
        a.click();
        URL.revokeObjectURL(url);
    }, [filteredPayments]);

    // Pagination helpers
    const getPageNumbers = () => {
        const pages: (number | "...")[] = [];
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
        return pages;
    };

    return (
        <main className="min-h-screen bg-slate-50 p-4 md:p-6">
            <div className="mx-auto max-w-[1500px] space-y-6">
                {/* ── Header ───────────────────────────────────────────── */}
                <section className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Lịch sử thanh toán</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            Theo dõi và quản lý các giao dịch thanh toán của doanh nghiệp.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleExportReport}
                        className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <Download className="h-4 w-4" />
                        Xuất báo cáo
                    </button>
                </section>

                {/* ── KPI Cards ─────────────────────────────────────────── */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        title="Tổng doanh thu"
                        value={formatPrice(summary.totalRevenue)}
                        description="Từ các giao dịch thành công"
                        icon={<BadgeDollarSign className="h-5 w-5" />}
                    />
                    <KpiCard
                        title="Giao dịch thành công"
                        value={String(summary.successCount)}
                        description="Trong kết quả đang lọc"
                        icon={<CircleCheckBig className="h-5 w-5" />}
                        iconColor="bg-emerald-50 text-emerald-600"
                    />
                    <KpiCard
                        title="Đang xử lý"
                        value={String(summary.pendingCount)}
                        description="Cần tiếp tục theo dõi"
                        icon={<Clock3 className="h-5 w-5" />}
                        iconColor="bg-amber-50 text-amber-500"
                    />
                    <KpiCard
                        title="Giao dịch thất bại"
                        value={String(summary.failedCount)}
                        description="Cần kiểm tra nguyên nhân"
                        icon={<CircleX className="h-5 w-5" />}
                        iconColor="bg-red-50 text-red-600"
                    />
                </section>

                {/* ── Table Card ────────────────────────────────────────── */}
                <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Filters */}
                    <div className="rounded-t-2xl border-b border-slate-200 p-4 md:p-5">
                        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1.6fr)_minmax(180px,0.6fr)]">
                            {/* Search */}
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchKeyword}
                                        onChange={(e) => handleKeywordChange(e.target.value)}
                                        placeholder="Mã giao dịch / Tên công ty..."
                                        className="h-11 w-full rounded-lg border border-slate-300 bg-slate-50 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Trạng thái
                                </label>
                                <div className="relative">
                                    <select
                                        value={status}
                                        onChange={(e) => handleStatusChange(e.target.value)}
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    >
                                        {statusOptions.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* Date range */}
                        <div className="mt-4">
                            <div className="w-full sm:max-w-[340px]">
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Khoảng thời gian
                                </label>
                                <DateRangePicker
                                    value={dateRange}
                                    onChange={handleDateChange}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="border-b border-red-200 bg-red-50 px-5 py-3 text-sm text-red-700">
                            Lỗi: {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-[900px] w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-50">
                                    {[
                                        { label: "Mã giao dịch", cls: "w-[180px]" },
                                        { label: "Tên công ty", cls: "min-w-[200px]" },
                                        { label: "Gói", cls: "w-[120px]" },
                                        { label: "Số tiền", cls: "w-[150px] text-right" },
                                        { label: "Phương thức", cls: "min-w-[190px]" },
                                        { label: "Ngày thanh toán", cls: "w-[170px]" },
                                        { label: "Trạng thái", cls: "w-[130px]" },
                                        { label: "Hành động", cls: "w-[90px] text-center" },
                                    ].map(({ label, cls }) => (
                                        <th
                                            key={label}
                                            className={`border-b border-r border-blue-100 px-4 py-4 text-left text-xs font-bold uppercase tracking-wide text-slate-900 last:border-r-0 ${cls}`}
                                        >
                                            {label}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <tr key={`skeleton-${idx}`} className="border-b border-slate-200">
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 shrink-0 rounded-md bg-slate-200 animate-pulse" />
                                                    <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                                                </div>
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="h-4 w-24 bg-slate-200 rounded animate-pulse ml-auto" />
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="h-4 w-36 bg-slate-200 rounded animate-pulse" />
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="h-4 w-28 bg-slate-200 rounded animate-pulse" />
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="h-6 w-20 bg-slate-200 rounded-full animate-pulse" />
                                            </td>
                                            <td className="px-4 py-5 text-center align-middle">
                                                <div className="h-8 w-8 bg-slate-200 rounded-lg animate-pulse mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : displayPayments.length > 0 ? (
                                    displayPayments.map((payment) => (
                                        <tr
                                            key={payment.payment_id}
                                            className="border-b border-slate-200 transition hover:bg-slate-50"
                                        >
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <span className="text-sm font-medium text-blue-700">
                                                    {payment.transaction_code ?? "—"}
                                                </span>
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md overflow-hidden border border-slate-200 bg-slate-50">
                                                        {payment.company_logo_url ? (
                                                            <img
                                                                src={payment.company_logo_url}
                                                                alt={payment.company_name ?? "logo"}
                                                                className="h-full w-full object-contain"
                                                            />
                                                        ) : (
                                                            <Building2 className="h-5 w-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-semibold text-slate-900">
                                                        {payment.company_name ?? (
                                                            <span className="text-slate-400 italic">Không rõ</span>
                                                        )}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 text-sm text-slate-800">
                                                {payment.plan_name ?? <span className="text-slate-400">—</span>}
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 text-right text-sm font-bold text-slate-900">
                                                {formatPrice(payment.amount)}
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 text-sm font-medium text-slate-800">
                                                {PAYMENT_METHOD_LABEL[payment.payment_method as PaymentMethod] ?? payment.payment_method}
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5 text-sm text-slate-700">
                                                {payment.paid_at
                                                    ? new Date(payment.paid_at).toLocaleString("vi-VN")
                                                    : <span className="text-slate-400">—</span>
                                                }
                                            </td>
                                            <td className="border-r border-slate-200 px-4 py-5">
                                                <StatusBadge status={payment.payment_status as PaymentStatus} />
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <button
                                                    type="button"
                                                    aria-label={`Xem giao dịch ${payment.transaction_code}`}
                                                    className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg text-blue-700 transition hover:bg-blue-50"
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-16 text-center">
                                            <p className="font-semibold text-slate-800">Không tìm thấy giao dịch</p>
                                            <p className="mt-1 text-sm text-slate-500">
                                                Hãy thay đổi từ khóa hoặc bộ lọc để xem kết quả khác.
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex flex-col gap-4 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between rounded-b-2xl">
                        <p className="text-sm text-slate-600">
                            Tổng{" "}
                            <span className="font-semibold text-slate-900">{total}</span>{" "}
                            giao dịch
                            {totalPages > 1 && (
                                <> · Trang <span className="font-semibold text-slate-900">{currentPage}</span> / {totalPages}</>
                            )}
                        </p>

                        {totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    disabled={currentPage === 1 || loading}
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                {getPageNumbers().map((page, idx) =>
                                    page === "..." ? (
                                        <span key={`ellipsis-${idx}`} className="px-1 text-sm text-slate-500">...</span>
                                    ) : (
                                        <button
                                            key={page}
                                            type="button"
                                            disabled={loading}
                                            onClick={() => setCurrentPage(page as number)}
                                            className={`h-9 min-w-9 rounded-md px-3 text-sm font-semibold transition
                                                ${currentPage === page
                                                    ? "bg-blue-700 text-white"
                                                    : "border border-transparent bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    )
                                )}

                                <button
                                    type="button"
                                    disabled={currentPage === totalPages || loading}
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </main>
    );
}