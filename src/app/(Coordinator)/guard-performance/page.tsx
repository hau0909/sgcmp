"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
    CheckSquare,
    Star,
    Clock,
    Download,
    PcCase,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight,
    User,
    Calendar,
    TrendingUp,
    TrendingDown,
    UserCheck,
    AlertTriangle,
    UserX,
    ClockAlert,
    RefreshCw,
    ChevronDown,
    X,
    ScrollText,
} from "lucide-react";
import {
    ResponsiveContainer,
    Tooltip,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts";
import { requestGetGuardPerformanceSummary, requestGetGuardPerformanceList } from "@/features/guards/api/guard.api";
import type { GuardPerformanceSummaryData, GuardPerformanceListItem } from "@/features/guards/type";

import { useTranslation } from "@/components/providers/LanguageProvider";

interface GuardPerformanceData {
    id: string;
    name: string;
    guardId: string;
    avatar: string;
    location: string;
    role: string;
    performanceScore: number;
    rating: number;
    category: "XUẤT SẮC" | "TIÊU CHUẨN" | "CẦN CẢI THIỆN";
}

export default function GuardPerformancePage() {
    const { dict } = useTranslation();
    const [mounted, setMounted] = useState(false);
    const [filterTab, setFilterTab] = useState<"all" | "top10">("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // Date range calendar picker state
    const formatDateStr = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
    };

    const getPresetDates = (preset: "today" | "7days" | "30days" | "thisMonth" | "lastMonth") => {
        const now = new Date();
        const todayStr = formatDateStr(now);

        if (preset === "today") {
            return { start: todayStr, end: todayStr };
        }
        if (preset === "7days") {
            const past = new Date(now);
            past.setDate(past.getDate() - 6);
            return { start: formatDateStr(past), end: todayStr };
        }
        if (preset === "30days") {
            const past = new Date(now);
            past.setDate(past.getDate() - 29);
            return { start: formatDateStr(past), end: todayStr };
        }
        if (preset === "thisMonth") {
            const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
            return { start: formatDateStr(firstDay), end: todayStr };
        }
        if (preset === "lastMonth") {
            const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
            return { start: formatDateStr(firstDayLastMonth), end: formatDateStr(lastDayLastMonth) };
        }
        return { start: todayStr, end: todayStr };
    };

    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [startDate, setStartDate] = useState(() => getPresetDates("thisMonth").start);
    const [endDate, setEndDate] = useState(() => getPresetDates("thisMonth").end);

    const [tempStartDate, setTempStartDate] = useState(startDate);
    const [tempEndDate, setTempEndDate] = useState(endDate);

    const formatDateDisplay = (dateStr: string) => {
        if (!dateStr) return "";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    };

    /**
     * Converts a "YYYY-MM-DD" date string to a full ISO 8601 string
     * with the user's local timezone offset (e.g. "2026-07-22T00:00:00+07:00").
     * @param dateStr  "YYYY-MM-DD"
     * @param endOfDay  if true, sets time to 23:59:59 (for endDate)
     */
    const toLocalISODate = (dateStr: string, endOfDay = false): string => {
        if (!dateStr || dateStr.length !== 10) return dateStr;
        const offsetMinutes = -new Date().getTimezoneOffset(); // positive for UTC+
        const sign = offsetMinutes >= 0 ? "+" : "-";
        const absOffset = Math.abs(offsetMinutes);
        const hh = String(Math.floor(absOffset / 60)).padStart(2, "0");
        const mm = String(absOffset % 60).padStart(2, "0");
        const time = endOfDay ? "T23:59:59" : "T00:00:00";
        return `${dateStr}${time}${sign}${hh}:${mm}`;
    };

    const [selectedGuardId, setSelectedGuardId] = useState<string | null>(null);
    const [selectedGuardName, setSelectedGuardName] = useState<string | null>(null);
    const [summaryData, setSummaryData] = useState<GuardPerformanceSummaryData | null>(null);
    const [loadingSummary, setLoadingSummary] = useState(true);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function fetchSummary() {
            try {
                setLoadingSummary(true);
                const res = await requestGetGuardPerformanceSummary({
                    guard_id: selectedGuardId || undefined,
                    startDate: toLocalISODate(startDate),
                    endDate: toLocalISODate(endDate, true),
                });
                if (isMounted && res.success && res.data) {
                    setSummaryData(res.data);
                }
            } catch (err) {
                console.error("Failed to fetch guard performance summary:", err);
            } finally {
                if (isMounted) setLoadingSummary(false);
            }
        }
        fetchSummary();
        return () => {
            isMounted = false;
        };
    }, [selectedGuardId, startDate, endDate]);

    const currentRadarData = [
        { subject: dict.coor_guard_performance?.on_time || "Đúng giờ", score: summaryData?.on_time_rate.percentage ?? 0, fullMark: 100 },
        { subject: dict.coor_guard_performance?.absent || "Vắng mặt", score: summaryData?.attendance_rate.absent_percentage ?? 0, fullMark: 100 },
        { subject: dict.coor_guard_performance?.late || "Điểm danh trễ", score: summaryData?.late_check_in_rate.percentage ?? 0, fullMark: 100 },
        { subject: dict.coor_guard_performance?.replacement || "Thay ca", score: summaryData?.replacement_rate.percentage ?? 0, fullMark: 100 },
    ];

    const currentAttendanceMetrics = [
        {
            name: dict.coor_guard_performance?.on_time || "Đúng giờ",
            value: summaryData?.on_time_rate.percentage ?? 0,
            count: summaryData?.on_time_rate.on_time_shift_count ?? 0,
            color: "#10b981",
            icon: UserCheck,
            badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
        },
        {
            name: dict.coor_guard_performance?.late || "Điểm danh trễ",
            value: summaryData?.late_check_in_rate.percentage ?? 0,
            count: summaryData?.late_check_in_rate.count ?? 0,
            color: "#3b82f6",
            icon: ClockAlert,
            badgeBg: "bg-blue-50 text-blue-700 border-blue-200/60",
        },
        {
            name: dict.coor_guard_performance?.absent || "Vắng mặt",
            value: summaryData?.attendance_rate.absent_percentage ?? 0,
            count: summaryData?.attendance_rate.absent_count ?? 0,
            color: "#e11d48",
            icon: UserX,
            badgeBg: "bg-rose-50 text-rose-700 border-rose-200/60",
        },
        {
            name: dict.coor_guard_performance?.replacement || "Thay ca",
            value: summaryData?.replacement_rate.percentage ?? 0,
            count: summaryData?.replacement_rate.count ?? 0,
            color: "#8b5cf6",
            icon: RefreshCw,
            badgeBg: "bg-purple-50 text-purple-700 border-purple-200/60",
        },
    ];

    const [realGuards, setRealGuards] = useState<GuardPerformanceListItem[]>([]);
    const [totalRealGuards, setTotalRealGuards] = useState<number>(0);
    const [totalRealPages, setTotalRealPages] = useState<number>(1);
    const [loadingGuards, setLoadingGuards] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;
        async function fetchGuards() {
            try {
                setLoadingGuards(true);
                const res = await requestGetGuardPerformanceList({
                    startDate: toLocalISODate(startDate),
                    endDate: toLocalISODate(endDate, true),
                    search: searchQuery,
                    tab: filterTab,
                    page: currentPage,
                    limit: 10,
                });
                if (isMounted && res?.success && res?.data) {
                    setRealGuards(res.data.guards || []);
                    setTotalRealGuards(res.data.total || 0);
                    setTotalRealPages(res.data.totalPages || 1);
                }
            } catch (err) {
                console.error("Failed to fetch real guards performance list:", err);
            } finally {
                if (isMounted) setLoadingGuards(false);
            }
        }
        fetchGuards();
        return () => {
            isMounted = false;
        };
    }, [startDate, endDate, searchQuery, filterTab, currentPage]);

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
            {/* Header Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface tracking-tight">
                        {dict.coor_guard_performance?.title || "Hiệu suất Nhân viên"}
                    </h1>
                    <p className="text-xs text-on-surface-variant mt-1 max-w-2xl">
                        {selectedGuardName ? (
                            <span className="inline-flex items-center gap-2">
                                <span>{dict.coor_guard_performance?.viewing_single || "Đang xem chỉ số của:"} <strong className="text-primary font-bold">{selectedGuardName}</strong></span>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSelectedGuardId(null);
                                        setSelectedGuardName(null);
                                    }}
                                    className="px-2 py-0.5 text-[11px] font-bold bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
                                >
                                    {dict.coor_guard_performance?.view_company_overview || "Xem tổng quan toàn công ty"}
                                </button>
                            </span>
                        ) : (
                            dict.coor_guard_performance?.desc || "Phân tích và theo dõi chỉ số hiệu suất làm việc của nhân viên bảo vệ."
                        )}
                    </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {/* Date Picker Button & Popover */}
                    <div className="relative">
                        <button
                            type="button"
                            onClick={() => {
                                if (!isCalendarOpen) {
                                    setTempStartDate(startDate);
                                    setTempEndDate(endDate);
                                }
                                setIsCalendarOpen(!isCalendarOpen);
                            }}
                            className="flex items-center gap-2 px-3.5 py-2 bg-surface-container-lowest border border-outline-variant hover:border-primary/50 rounded-xl text-xs font-medium text-on-surface shadow-xs transition-colors cursor-pointer"
                        >
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                                {startDate && endDate ? `${startDate} - ${endDate}` : (dict.coor_guard_performance?.select_date_range || "Chọn khoảng thời gian")}
                            </span>
                            <ChevronDown className={`w-3.5 h-3.5 text-on-surface-variant transition-transform duration-200 ${isCalendarOpen ? "rotate-180" : ""}`} />
                        </button>

                        {/* Calendar Picker Popover */}
                        {isCalendarOpen && (
                            <>
                                {/* Click outside backdrop */}
                                <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => {
                                        setTempStartDate(startDate);
                                        setTempEndDate(endDate);
                                        setIsCalendarOpen(false);
                                    }}
                                />

                                <div className="absolute right-0 mt-2 z-50 w-80 p-4 bg-surface-container-lowest border border-outline-variant/80 rounded-2xl shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-150">
                                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/40">
                                        <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            <span>{dict.coor_guard_performance?.select_date_range || "Chọn khoảng thời gian"}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTempStartDate(startDate);
                                                setTempEndDate(endDate);
                                                setIsCalendarOpen(false);
                                            }}
                                            className="p-1 text-on-surface-variant hover:text-on-surface rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Quick Presets */}
                                    <div className="space-y-1.5">
                                        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                                            {dict.coor_guard_performance?.quick_select || "Lựa chọn nhanh"}
                                        </span>
                                        <div className="grid grid-cols-2 gap-1.5">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = getPresetDates("today");
                                                    setTempStartDate(p.start);
                                                    setTempEndDate(p.end);
                                                }}
                                                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-colors ${tempStartDate === getPresetDates("today").start && tempEndDate === getPresetDates("today").end
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
                                                    }`}
                                            >
                                                {dict.coor_guard_performance?.preset_today || "Hôm nay"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = getPresetDates("7days");
                                                    setTempStartDate(p.start);
                                                    setTempEndDate(p.end);
                                                }}
                                                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-colors ${tempStartDate === getPresetDates("7days").start && tempEndDate === getPresetDates("7days").end
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
                                                    }`}
                                            >
                                                {dict.coor_guard_performance?.preset_7days || "7 ngày qua"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = getPresetDates("30days");
                                                    setTempStartDate(p.start);
                                                    setTempEndDate(p.end);
                                                }}
                                                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-colors ${tempStartDate === getPresetDates("30days").start && tempEndDate === getPresetDates("30days").end
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
                                                    }`}
                                            >
                                                {dict.coor_guard_performance?.preset_30days || "30 ngày qua"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = getPresetDates("thisMonth");
                                                    setTempStartDate(p.start);
                                                    setTempEndDate(p.end);
                                                }}
                                                className={`px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-colors ${tempStartDate === getPresetDates("thisMonth").start && tempEndDate === getPresetDates("thisMonth").end
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
                                                    }`}
                                            >
                                                {dict.coor_guard_performance?.preset_this_month || "Tháng này"}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const p = getPresetDates("lastMonth");
                                                    setTempStartDate(p.start);
                                                    setTempEndDate(p.end);
                                                }}
                                                className={`col-span-2 px-2.5 py-1.5 text-xs font-medium rounded-lg text-left transition-colors ${tempStartDate === getPresetDates("lastMonth").start && tempEndDate === getPresetDates("lastMonth").end
                                                    ? "bg-primary/10 text-primary font-bold"
                                                    : "bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant"
                                                    }`}
                                            >
                                                {dict.coor_guard_performance?.preset_last_month || "Tháng trước"}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Date Range Inputs */}
                                    <div className="space-y-2 pt-2 border-t border-outline-variant/40">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                                                    {dict.coor_guard_performance?.from_date || "Từ ngày"}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={tempStartDate}
                                                    onChange={(e) => setTempStartDate(e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">
                                                    {dict.coor_guard_performance?.to_date || "Đến ngày"}
                                                </label>
                                                <input
                                                    type="date"
                                                    value={tempEndDate}
                                                    onChange={(e) => setTempEndDate(e.target.value)}
                                                    className="w-full px-2.5 py-1.5 bg-surface-container-low border border-outline-variant/60 rounded-xl text-xs font-medium text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Footer Actions */}
                                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/40">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setTempStartDate(startDate);
                                                setTempEndDate(endDate);
                                                setIsCalendarOpen(false);
                                            }}
                                            className="px-3 py-1.5 bg-surface-container-low hover:bg-surface-container-high text-on-surface text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                                        >
                                            {dict.coor_guard_performance?.close || "Đóng"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setStartDate(tempStartDate);
                                                setEndDate(tempEndDate);
                                                setIsCalendarOpen(false);
                                            }}
                                            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
                                        >
                                            {dict.coor_guard_performance?.apply || "Áp dụng"}
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Export Data Button */}
                    <button
                        type="button"
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" />
                        <span>{dict.coor_guard_performance?.export_data || "Xuất dữ liệu"}</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Card 0: Tổng số ca trực (distinct shifts) */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {dict.coor_guard_performance?.total_shifts || "TỔNG SỐ CA TRỰC"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {loadingSummary ? (
                                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded-md" />
                            ) : (
                                <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                                    {(summaryData?.attendance_rate?.total_shifts ?? 0)}{" "}
                                    <span className="text-sm font-semibold text-on-surface-variant">{dict.coor_guard_performance?.shift_unit || "ca"}</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant/80 mt-1">
                            {dict.coor_guard_performance?.total_shifts_desc || "Số ca duy nhất trong kỳ"}
                        </p>
                    </div>
                </div>

                {/* Card 0b: Tổng lượt phân công (assignments) */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <PcCase className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {dict.coor_guard_performance?.total_assignments || "TỔNG LƯỢT PHÂN CÔNG"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {loadingSummary ? (
                                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded-md" />
                            ) : (
                                <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                                    {(summaryData?.attendance_rate?.total_assignments ?? 0)}{" "}
                                    <span className="text-sm font-semibold text-on-surface-variant">{dict.coor_guard_performance?.total_assignments_unit || "lượt"}</span>
                                </span>
                            )}
                        </div>
                        <p className="text-[11px] text-on-surface-variant/80 mt-1">
                            {dict.coor_guard_performance?.total_assignments_desc || "Tổng lượt bảo vệ được phân công"}
                        </p>
                    </div>
                </div>

                {/* Card 1: Tỷ lệ chuyên cần */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <CheckSquare className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {dict.coor_guard_performance?.attendance_rate || "TỶ LỆ CHUYÊN CẦN"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {loadingSummary ? (
                                <div className="h-7 w-20 bg-slate-200 animate-pulse rounded-md" />
                            ) : (
                                <>
                                    <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                                        {`${summaryData?.attendance_rate?.percentage ?? 0}%`}
                                    </span>
                                    {(() => {
                                        const trend = summaryData?.attendance_rate?.trend_percentage;
                                        if (trend == null || trend === 0) {
                                            return (
                                                <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                    +0%
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                                                {trend > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                                {`${trend > 0 ? "+" : ""}${trend}%`}
                                            </span>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 2: Số ca vắng mặt */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                            <UserX className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {dict.coor_guard_performance?.absent_count || "SỐ CA VẮNG MẶT"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {loadingSummary ? (
                                <div className="h-7 w-16 bg-slate-200 animate-pulse rounded-md" />
                            ) : (
                                <>
                                    <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                                        {(summaryData?.total_absent_count?.count ?? 0)}{" "}
                                        <span className="text-sm font-semibold text-on-surface-variant">{dict.coor_guard_performance?.shift_unit || "ca"}</span>
                                    </span>
                                    {(() => {
                                        const absentPct = summaryData?.attendance_rate?.absent_percentage ?? 0;
                                        if (absentPct === 0) {
                                            return (
                                                <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                    0%
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${absentPct > 5 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                                                {absentPct > 5 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                                {`${absentPct}%`}
                                            </span>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 3: Tỷ lệ đi trễ */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {dict.coor_guard_performance?.late_rate || "TỶ LỆ ĐI TRỄ"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {loadingSummary ? (
                                <div className="h-7 w-24 bg-slate-200 animate-pulse rounded-md" />
                            ) : (
                                <>
                                    <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                                        {`${summaryData?.late_rate?.percentage ?? 0}%`}{" "}
                                        <span className="text-sm font-semibold text-on-surface-variant">
                                            ({summaryData?.late_rate?.late_shift_count ?? 0} {dict.coor_guard_performance?.shift_unit || "ca"})
                                        </span>
                                    </span>
                                    {(() => {
                                        const latePct = summaryData?.late_rate?.percentage ?? 0;
                                        if (latePct === 0) {
                                            return (
                                                <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                    0%
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${latePct > 3 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50"}`}>
                                                {latePct > 3 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                                {`${latePct}%`}
                                            </span>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Card 4: Tỷ lệ đúng giờ */}
                <div className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl text-emerald-600 bg-emerald-50 flex items-center justify-center">
                            <Clock className="w-5 h-5" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                            {dict.coor_guard_performance?.on_time_rate || "TỶ LỆ ĐÚNG GIỜ"}
                        </span>
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            {loadingSummary ? (
                                <div className="h-7 w-20 bg-slate-200 animate-pulse rounded-md" />
                            ) : (
                                <>
                                    <span className="text-2xl font-extrabold text-on-surface tracking-tight">
                                        {`${summaryData?.on_time_rate?.percentage ?? 0}%`}
                                    </span>
                                    {(() => {
                                        const trend = summaryData?.on_time_rate?.trend_percentage;
                                        if (trend == null || trend === 0) {
                                            return (
                                                <span className="inline-flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-md">
                                                    +0%
                                                </span>
                                            );
                                        }
                                        return (
                                            <span className={`inline-flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md ${trend > 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"}`}>
                                                {trend > 0 ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
                                                {`${trend > 0 ? "+" : ""}${trend}%`}
                                            </span>
                                        );
                                    })()}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Section: Bảng xếp hạng nhân viên ưu tú (8 Cols) */}
                <div className="lg:col-span-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs overflow-hidden flex flex-col">
                    {/* Table Header Controls */}
                    <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/40">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-base font-bold text-on-surface">
                                {filterTab === "top10" ? (dict.coor_guard_performance?.title_list_top10 || "Top 10 nhân viên ưu tú") : (dict.coor_guard_performance?.title_list_all || "Danh sách tất cả nhân viên bảo vệ")}
                            </h2>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
                            {/* Tab Pills */}
                            <div className="bg-surface-container-low p-1 rounded-xl flex items-center gap-1 border border-outline-variant/30 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setFilterTab("all")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${filterTab === "all"
                                        ? "bg-surface-container-lowest text-primary shadow-xs"
                                        : "text-on-surface-variant hover:text-on-surface"
                                        }`}
                                >
                                    {dict.coor_guard_performance?.tab_all || "Tất cả"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFilterTab("top10")}
                                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${filterTab === "top10"
                                        ? "bg-surface-container-lowest text-primary shadow-xs"
                                        : "text-on-surface-variant hover:text-on-surface"
                                        }`}
                                >
                                    {dict.coor_guard_performance?.tab_top10 || "Top 10 xuất sắc"}
                                </button>
                            </div>

                            {/* Info Tooltip Button */}
                            <div className="relative group">
                                <button
                                    type="button"
                                    className="p-2 text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-lg transition-colors border border-outline-variant/40"
                                >
                                    <ScrollText className="w-4 h-4" />
                                </button>
                                {/* Tooltip */}
                                <div className="absolute right-0 top-full mt-2 w-80 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <div className="bg-on-surface text-surface text-[11px] leading-relaxed rounded-xl px-3 py-2.5 shadow-lg">
                                        <p className="font-semibold mb-1">{dict.coor_guard_performance?.formula_title || "📊 Cách tính Hiệu suất & Xếp loại"}</p>
                                        <p className="mb-1">{dict.coor_guard_performance?.formula_calc || "Hiệu suất = Ca có điểm danh / Ca phân công"}</p>
                                        <p>{dict.coor_guard_performance?.formula_excellent || "🌟 Xuất sắc: Chuyên cần ≥ 95%, Vắng ≤ 2%, Trễ ≤ 3%"}</p>
                                        <p>{dict.coor_guard_performance?.formula_standard || "🟢 Tiêu chuẩn: Chuyên cần ≥ 90%, Vắng ≤ 5%, Trễ ≤ 10%"}</p>
                                        <p>{dict.coor_guard_performance?.formula_improvement || "🔴 Cần cải thiện: Không đáp ứng hai mức trên"}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Table View */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-surface-container-low/50 text-[11px] font-bold text-on-surface-variant uppercase tracking-wider border-b border-outline-variant/30">
                                    <th className="py-3.5 px-5">{dict.coor_guard_performance?.col_guard || "NHÂN VIÊN"}</th>
                                    <th className="py-3.5 px-4">{dict.coor_guard_performance?.col_target || "MỤC TIÊU"}</th>
                                    <th className="py-3.5 px-4">{dict.coor_guard_performance?.col_performance || "HIỆU SUẤT"}</th>
                                    <th className="py-3.5 px-5 text-center">{dict.coor_guard_performance?.col_rating || "XẾP LOẠI"}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-outline-variant/20 text-sm">
                                {loadingGuards ? (
                                    Array.from({ length: 5 }).map((_, idx) => (
                                        <tr key={idx} className="animate-pulse border-b border-outline-variant/10">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0" />
                                                    <div className="space-y-1.5 flex-1">
                                                        <div className="h-4 w-32 bg-slate-200 rounded" />
                                                        <div className="h-3 w-20 bg-slate-200/70 rounded" />
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="space-y-1.5">
                                                    <div className="h-4 w-24 bg-slate-200 rounded" />
                                                    <div className="h-3 w-16 bg-slate-200/70 rounded" />
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="h-4 w-28 bg-slate-200 rounded" />
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <div className="h-6 w-24 bg-slate-200 rounded-xl mx-auto" />
                                            </td>
                                        </tr>
                                    ))
                                ) : realGuards.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-xs text-on-surface-variant">
                                            {filterTab === "top10"
                                                ? "Chưa có nhân viên bảo vệ nào đạt danh hiệu Xuất sắc trong khoảng thời gian này"
                                                : "Không có bảo vệ nào trong danh sách"}
                                        </td>
                                    </tr>
                                ) : realGuards.map((guard) => {
                                    const isSelected = selectedGuardId === guard.id;
                                    return (
                                        <tr
                                            key={guard.id}
                                            onClick={() => {
                                                if (isSelected) {
                                                    setSelectedGuardId(null);
                                                    setSelectedGuardName(null);
                                                } else {
                                                    setSelectedGuardId(guard.id);
                                                    setSelectedGuardName(guard.name);
                                                }
                                            }}
                                            className={`transition-colors cursor-pointer group ${isSelected
                                                ? "bg-primary/10 font-bold border-l-4 border-l-primary"
                                                : "hover:bg-surface-container-low/30"
                                                }`}
                                        >
                                            {/* Guard Name & Avatar */}
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    {guard.avatar ? (
                                                        <img
                                                            src={guard.avatar}
                                                            alt={guard.name}
                                                            className="w-10 h-10 rounded-full object-cover shrink-0 border border-outline-variant/40"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full shrink-0 border border-outline-variant/40 bg-surface-container flex items-center justify-center">
                                                            <User />
                                                        </div>
                                                    )}
                                                    <div className="flex flex-col leading-tight">
                                                        <span className="font-bold text-on-surface group-hover:text-primary transition-colors">
                                                            {guard.name}
                                                        </span>
                                                        <span className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                                                            ID: {guard.guardId}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Location & Role */}
                                            <td className="py-4 px-4">
                                                <div className="flex flex-col leading-tight">
                                                    <span className="font-semibold text-on-surface text-xs">
                                                        {guard.location}
                                                    </span>
                                                    <span className="text-[11px] text-on-surface-variant font-normal mt-0.5">
                                                        {guard.role}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Performance Score & Progress Bar */}
                                            <td className="py-4 px-4 min-w-[160px]">
                                                <div className="space-y-1.5">
                                                    <div className="flex items-center gap-2">
                                                        <span
                                                            className={`font-bold text-xs ${guard.performanceScore >= 95
                                                                ? "text-emerald-600"
                                                                : guard.performanceScore >= 90
                                                                    ? "text-blue-600"
                                                                    : "text-rose-600"
                                                                }`}
                                                        >
                                                            {guard.performanceScore.toFixed(1)}%
                                                        </span>
                                                        <span className="text-on-surface-variant/40 text-xs">|</span>
                                                        <span className="text-xs font-semibold text-amber-500 flex items-center gap-0.5">
                                                            {guard.rating.toFixed(1)}
                                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400 inline-block" />
                                                        </span>
                                                    </div>

                                                    {/* Progress Bar */}
                                                    <div className="w-full bg-surface-container-high rounded-full h-1.5 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${guard.performanceScore >= 95
                                                                ? "bg-emerald-500"
                                                                : guard.performanceScore >= 90
                                                                    ? "bg-blue-500"
                                                                    : "bg-rose-500"
                                                                }`}
                                                            style={{ width: `${guard.performanceScore}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Category Badge */}
                                            <td className="py-4 px-5 text-center">
                                                <span
                                                    className={`inline-block px-3 py-1 rounded-xl text-[11px] font-bold tracking-wide ${guard.category === "XUẤT SẮC"
                                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                                        : guard.category === "TIÊU CHUẨN"
                                                            ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                                                            : guard.category === "CẦN CẢI THIỆN"
                                                                ? "bg-rose-50 text-rose-700 border border-rose-200/60"
                                                                : "bg-slate-100 text-slate-600 border border-slate-200/60"
                                                        }`}
                                                >
                                                    {guard.category === "XUẤT SẮC"
                                                        ? (dict.coor_guard_performance?.category_excellent || "XUẤT SẮC")
                                                        : guard.category === "TIÊU CHUẨN"
                                                            ? (dict.coor_guard_performance?.category_standard || "TIÊU CHUẨN")
                                                            : guard.category === "CẦN CẢI THIỆN"
                                                                ? (dict.coor_guard_performance?.category_need_improvement || "CẦN CẢI THIỆN")
                                                                : guard.category === "CHƯA PHÂN CÔNG"
                                                                    ? (dict.coor_guard_performance?.category_unassigned || "CHƯA PHÂN CÔNG")
                                                                    : guard.category}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer / Pagination */}
                    <div className="p-4 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-on-surface-variant">
                        <span>{dict.company_verifications?.showing || "Hiển thị"} {realGuards.length} {dict.company_verifications?.in || "trên"} {totalRealGuards || 150} {dict.coor_guard_performance?.showing_records ? "" : "hồ sơ năng lực"}</span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-low disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {Array.from({ length: Math.min(totalRealPages, 5) }).map((_, idx) => {
                                const p = idx + 1;
                                return (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setCurrentPage(p)}
                                        className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold transition-all cursor-pointer ${currentPage === p
                                            ? "bg-primary text-on-primary shadow-xs"
                                            : "hover:bg-surface-container-low text-on-surface"
                                            }`}
                                    >
                                        {p}
                                    </button>
                                );
                            })}

                            <button
                                type="button"
                                disabled={currentPage >= totalRealPages}
                                onClick={() => setCurrentPage((p) => Math.min(totalRealPages, p + 1))}
                                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-container-low disabled:opacity-40 transition-colors cursor-pointer"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Section: Recharts Attendance Breakdown & Recognition (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Card 1: Recharts Attendance Chart (Đúng giờ, Trễ, Vắng mặt, Điểm danh trễ) */}
                    <div className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/60 shadow-xs space-y-5">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-on-surface">
                                    {dict.coor_guard_performance?.attendance_chart_title || "Chỉ số chuyên cần"}
                                </h2>
                                <p className="text-[11px] text-on-surface-variant">
                                    {dict.coor_guard_performance?.attendance_chart_desc || "Đúng giờ, Vắng mặt, Điểm danh trễ & Thay ca"}
                                </p>
                            </div>
                        </div>

                        {/* Recharts Render Container */}
                        <div className="relative w-full h-52 flex items-center justify-center">
                            {mounted ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius={68} data={currentRadarData}>
                                        <PolarGrid stroke="#cbd5e1" />
                                        <PolarAngleAxis
                                            dataKey="subject"
                                            tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }}
                                        />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar
                                            name={dict.coor_guard_performance?.chart_series_name || "Chỉ số năng lực chuyên cần"}
                                            dataKey="score"
                                            stroke="#1d4ed8"
                                            fill="#2563eb"
                                            fillOpacity={0.25}
                                            strokeWidth={2}
                                            dot={{ r: 3, fill: "#1d4ed8" }}
                                        />
                                        <Tooltip
                                            formatter={(value: any, name: any) => [`${value}/100`, "Chỉ số"]}
                                            contentStyle={{
                                                backgroundColor: "#ffffff",
                                                border: "1px solid #e2e8f0",
                                                borderRadius: "12px",
                                                fontSize: "12px",
                                                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                                            }}
                                        />
                                    </RadarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center gap-2 animate-pulse">
                                    <div className="w-20 h-20 rounded-full border-4 border-slate-200 border-t-primary animate-spin" />
                                    <span className="text-xs text-on-surface-variant/70 font-medium">{dict.coor_guard_performance?.chart_loading || "Đang tải biểu đồ..."}</span>
                                </div>
                            )}
                        </div>

                        {/* Attendance Metrics Breakdown Grid */}
                        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-outline-variant/30">
                            {currentAttendanceMetrics.map((item) => {
                                const IconComponent = item.icon;
                                return (
                                    <div
                                        key={item.name}
                                        className="p-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/30 flex items-center gap-2.5"
                                    >
                                        <div
                                            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: `${item.color}15`, color: item.color }}
                                        >
                                            <IconComponent className="w-4 h-4" />
                                        </div>
                                        <div className="flex flex-col leading-tight min-w-0">
                                            <span className="text-[11px] font-medium text-on-surface-variant truncate">
                                                {item.name}
                                            </span>
                                            <div className="flex items-baseline gap-1 mt-0.5">
                                                <span className="text-xs font-bold text-on-surface">
                                                    {item.value}%
                                                </span>
                                                <span className="text-[10px] text-on-surface-variant/70 font-normal">
                                                    ({item.count})
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
