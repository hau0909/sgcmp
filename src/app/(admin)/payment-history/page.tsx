"use client";

import { useCallback, useMemo, useState } from "react";
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
    Search,
} from "lucide-react";

import { DateRangePicker } from "@/features/payment/component/DateRangePicker";
import { KpiCard } from "@/features/payment/component/KpiCard";
import { StatusBadge } from "@/features/payment/component/StatusBadge";
import {
    packageOptions,
    PAYMENT_DATA,
    statusOptions,
    type DateRange,
} from "@/features/payment/types";
import { formatCurrency } from "@/features/payment/utils/payment.utils";
import type { PaymentMethod } from "@/types/Enum";

const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
    bank_transfer: "Chuyển khoản ngân hàng",
    credit_card: "Thẻ tín dụng",
    e_wallet: "Ví điện tử",
};

export default function AdminPaymentHistoryPage() {
    const [searchKeyword, setSearchKeyword] = useState("");
    const [status, setStatus] = useState("all");
    const [packageName, setPackageName] = useState("all");
    const [dateRange, setDateRange] = useState<DateRange>({ start: null, end: null });
    const [currentPage, setCurrentPage] = useState(1);

    const filteredPayments = useMemo(() => {
        const keyword = searchKeyword.trim().toLowerCase();

        return PAYMENT_DATA.filter((payment) => {
            const matchesSearch =
                !keyword ||
                payment.id.toLowerCase().includes(keyword) ||
                payment.companyName.toLowerCase().includes(keyword);

            const matchesStatus = status === "all" || payment.status === status;
            const matchesPackage = packageName === "all" || payment.packageName === packageName;

            let matchesDate = true;
            if (dateRange.start || dateRange.end) {
                const [datePart] = payment.paidAt.split(" ");
                const [dd, mm, yyyy] = datePart.split("/");
                const payDate = new Date(+yyyy, +mm - 1, +dd);
                if (dateRange.start && payDate < dateRange.start) matchesDate = false;
                if (dateRange.end && payDate > dateRange.end) matchesDate = false;
            }

            return matchesSearch && matchesStatus && matchesPackage && matchesDate;
        });
    }, [searchKeyword, status, packageName, dateRange]);

    const totalRevenue = filteredPayments
        .filter((p) => p.status === "completed")
        .reduce((sum, p) => sum + p.amount, 0);

    const successCount = filteredPayments.filter((p) => p.status === "completed").length;
    const pendingCount = filteredPayments.filter((p) => p.status === "pending").length;
    const failedCount = filteredPayments.filter((p) => p.status === "failed").length;

    const handleExportReport = useCallback(() => {
        const headers = [
            "Mã giao dịch", "Doanh nghiệp", "Gói",
            "Số tiền", "Phương thức", "Ngày thanh toán", "Trạng thái",
        ];
        const rows = filteredPayments.map((p) => [
            p.id, p.companyName, p.packageName,
            p.amount.toString(), PAYMENT_METHOD_LABEL[p.paymentMethod], p.paidAt, p.status,
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
                        value={formatCurrency(totalRevenue)}
                        description="Từ các giao dịch thành công"
                        icon={<BadgeDollarSign className="h-5 w-5" />}
                    />
                    <KpiCard
                        title="Giao dịch thành công"
                        value={String(successCount)}
                        description="Trong kết quả đang lọc"
                        icon={<CircleCheckBig className="h-5 w-5" />}
                        iconColor="bg-emerald-50 text-emerald-600"
                    />
                    <KpiCard
                        title="Đang xử lý"
                        value={String(pendingCount)}
                        description="Cần tiếp tục theo dõi"
                        icon={<Clock3 className="h-5 w-5" />}
                        iconColor="bg-amber-50 text-amber-500"
                    />
                    <KpiCard
                        title="Giao dịch thất bại"
                        value={String(failedCount)}
                        description="Cần kiểm tra nguyên nhân"
                        icon={<CircleX className="h-5 w-5" />}
                        iconColor="bg-red-50 text-red-600"
                    />
                </section>

                {/* ── Table Card ────────────────────────────────────────── */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    {/* Filters */}
                    <div className="border-b border-slate-200 p-4 md:p-5">
                        <div className="grid gap-4 xl:grid-cols-[minmax(280px,1.6fr)_minmax(180px,0.6fr)_minmax(180px,0.6fr)]">
                            {/* Search */}
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Tìm kiếm
                                </label>
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        value={searchKeyword}
                                        onChange={(e) => {
                                            setSearchKeyword(e.target.value);
                                            setCurrentPage(1);
                                        }}
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
                                        onChange={(e) => { setStatus(e.target.value); setCurrentPage(1); }}
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    >
                                        {statusOptions.map((o) => (
                                            <option key={o.value} value={o.value}>{o.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                                </div>
                            </div>

                            {/* Package */}
                            <div>
                                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-700">
                                    Gói dịch vụ
                                </label>
                                <div className="relative">
                                    <select
                                        value={packageName}
                                        onChange={(e) => { setPackageName(e.target.value); setCurrentPage(1); }}
                                        className="h-11 w-full appearance-none rounded-lg border border-slate-300 bg-slate-50 px-3 pr-9 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                    >
                                        {packageOptions.map((o) => (
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
                                    onChange={(r) => { setDateRange(r); setCurrentPage(1); }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="min-w-[1050px] w-full border-collapse">
                            <thead>
                                <tr className="bg-blue-50">
                                    {[
                                        { label: "Mã giao dịch", cls: "w-[130px]" },
                                        { label: "Doanh nghiệp", cls: "min-w-[200px]" },
                                        { label: "Gói", cls: "w-[110px]" },
                                        { label: "Số tiền", cls: "w-[150px] text-right" },
                                        { label: "Phương thức", cls: "min-w-[190px]" },
                                        { label: "Ngày thanh toán", cls: "w-[150px]" },
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
                                {filteredPayments.length > 0 ? (
                                    filteredPayments.map((payment) => {
                                        const [date, time] = payment.paidAt.split(" ");
                                        return (
                                            <tr
                                                key={payment.id}
                                                className="border-b border-slate-200 transition hover:bg-slate-50"
                                            >
                                                <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                    <button type="button" className="text-sm font-medium text-blue-700 hover:underline">
                                                        #{payment.id}
                                                    </button>
                                                </td>
                                                <td className="border-r border-slate-200 px-4 py-5 align-middle">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-blue-50 text-xs font-bold text-blue-700">
                                                            {payment.companyShortName}
                                                        </div>
                                                        <span className="text-sm font-semibold text-slate-900">
                                                            {payment.companyName}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="border-r border-slate-200 px-4 py-5 text-sm text-slate-800">
                                                    {payment.packageName}
                                                </td>
                                                <td className="border-r border-slate-200 px-4 py-5 text-right text-sm font-bold text-slate-900">
                                                    {formatCurrency(payment.amount)}
                                                </td>
                                                <td className="border-r border-slate-200 px-4 py-5 text-sm font-medium text-slate-800">
                                                    {PAYMENT_METHOD_LABEL[payment.paymentMethod]}
                                                </td>
                                                <td className="border-r border-slate-200 px-4 py-5 text-sm text-slate-700">
                                                    <div className="font-medium">{date}</div>
                                                    <div className="text-slate-500">{time}</div>
                                                </td>
                                                <td className="border-r border-slate-200 px-4 py-5">
                                                    <StatusBadge status={payment.status} />
                                                </td>
                                                <td className="px-4 py-5 text-center">
                                                    <button
                                                        type="button"
                                                        aria-label={`Xem giao dịch ${payment.id}`}
                                                        className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-lg text-blue-700 transition hover:bg-blue-50"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
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
                    <div className="flex flex-col gap-4 bg-slate-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-600">
                            Hiển thị{" "}
                            <span className="font-semibold text-slate-900">
                                {filteredPayments.length === 0 ? 0 : 1}–{filteredPayments.length}
                            </span>{" "}
                            trong số{" "}
                            <span className="font-semibold text-slate-900">124</span> giao dịch
                        </p>

                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {[1, 2, 3].map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() => setCurrentPage(page)}
                                    className={`h-9 min-w-9 rounded-md px-3 text-sm font-semibold transition
                                        ${currentPage === page
                                            ? "bg-blue-700 text-white"
                                            : "border border-transparent bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <span className="px-1 text-sm text-slate-500">...</span>

                            <button
                                type="button"
                                onClick={() => setCurrentPage(25)}
                                className={`h-9 min-w-9 rounded-md px-3 text-sm font-semibold transition
                                    ${currentPage === 25
                                        ? "bg-blue-700 text-white"
                                        : "border border-transparent bg-white text-slate-700 hover:border-blue-200 hover:text-blue-700"
                                    }`}
                            >
                                25
                            </button>

                            <button
                                type="button"
                                disabled={currentPage === 25}
                                onClick={() => setCurrentPage((p) => Math.min(p + 1, 25))}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-300"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}